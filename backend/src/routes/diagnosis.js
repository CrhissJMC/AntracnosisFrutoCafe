import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query, withTransaction } from '../db/pool.js';
import { asyncHandler, HttpError, notFound, parseId } from '../lib/http.js';
import { canSeeCapture } from '../lib/modulo.js';
import { climateConfig, refreshForecast } from '../lib/clima.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const ML_URL = process.env.ML_SERVICE_URL;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
// Fotos de las capturas (volumen de Docker; no van a Git)
export const CAPTURES_DIR = process.env.CAPTURAS_DIR || '/data/capturas';

// Modelos que ofrece el sitio. "ambos" analiza la misma foto con los dos.
export const MODELS = [
  { id: 'mobilenet_v2', name: 'MobileNetV2', description: 'Cumple la meta de recall · más rápido y ligero', recommended: true },
  { id: 'efficientnet_b0', name: 'EfficientNet-B0', description: 'Menos falsas alarmas · recall algo menor', recommended: false },
];
const MODEL_IDS = MODELS.map((m) => m.id);

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados análisis seguidos. Espera un minuto.' },
});

// La foto llega como data URL (el navegador ya la redujo a ~1024 px antes de enviarla).
const imageDataUrl = z
  .string()
  .regex(/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/, 'Solo se aceptan imágenes JPG o PNG')
  .refine((v) => Math.floor(((v.length - v.indexOf(',') - 1) * 3) / 4) <= MAX_IMAGE_BYTES, 'La imagen supera los 8 MB');

const coord = (min, max) => z.preprocess((v) => (v === '' || v === undefined ? null : v), z.coerce.number().min(min).max(max).nullable());

// Condiciones del lugar (variables de influencia), opcionales: vacío = no la sabe. Se acepta coma decimal.
const optionalNumber = (min, max, label, { int = false } = {}) =>
  z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? null : typeof v === 'string' ? Number(v.trim().replace(',', '.')) : v),
    (int ? z.number({ invalid_type_error: `${label}: escribe un número` }).int(`${label}: sin decimales`) : z.number({ invalid_type_error: `${label}: escribe un número` }))
      .min(min, `${label}: entre ${min} y ${max}`)
      .max(max, `${label}: entre ${min} y ${max}`)
      .nullable(),
  );

const analyzeSchema = z
  .object({
    image: imageDataUrl,
    model: z.enum([...MODEL_IDS, 'ambos'], { message: 'Elige un modelo' }),
    // Ubicación: solo si el usuario la autoriza en el navegador; ambas o ninguna.
    latitud: coord(-90, 90).default(null),
    longitud: coord(-180, 180).default(null),
    altitud_m: optionalNumber(0, 5000, 'Altitud', { int: true }).default(null),
    humedad_pct: optionalNumber(0, 100, 'Humedad').default(null),
    temperatura_c: optionalNumber(-5, 45, 'Temperatura').default(null),
    precipitacion_mm: optionalNumber(0, 500, 'Lluvia').default(null),
  })
  .strict()
  .refine((d) => (d.latitud === null) === (d.longitud === null), { message: 'Ubicación incompleta', path: ['latitud'] });

/** Versión del modelo que generó el resultado (RNF08). Si el servicio trae una versión nueva, se registra. */
async function modelVersionId(client, r) {
  const { rows } = await client.query('SELECT id FROM modelo_versiones WHERE modelo = $1 AND version = $2', [r.model, r.version]);
  if (rows[0]) return rows[0].id;
  const inserted = await client.query(
    `INSERT INTO modelo_versiones (modelo, version, archivo, umbral_inferior, umbral_superior, notas, activo)
     VALUES ($1::varchar, $2, $3, $4, $5, 'Registrada automáticamente al recibir su primer diagnóstico.',
             NOT EXISTS (SELECT 1 FROM modelo_versiones WHERE modelo = $1::varchar AND activo))
     ON CONFLICT (modelo, version) DO UPDATE SET modelo = EXCLUDED.modelo
     RETURNING id`,
    [r.model, r.version, `ml/modelos/${r.model}.keras`, r.thresholds.inferior, r.thresholds.superior],
  );
  return inserted.rows[0].id;
}

/** Guarda la foto en el volumen de capturas; devuelve el nombre del archivo. */
async function saveImage(dataUrl) {
  const ext = dataUrl.startsWith('data:image/png') ? 'png' : 'jpg';
  const name = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`;
  const file = path.join(CAPTURES_DIR, name);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(dataUrl.split(',', 2)[1], 'base64'));
  return { name, file };
}

export async function callMl(path, init = {}, timeoutMs = 3000) {
  if (!ML_URL) return null;
  try {
    const res = await fetch(`${ML_URL}${path}`, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
  } catch {
    return null; // servicio apagado o sin responder
  }
}

// GET /api/diagnostico/modelos — público: qué modelos hay y si están listos
router.get(
  '/modelos',
  asyncHandler(async (req, res) => {
    const health = await callMl('/health', {}, 2000);
    const status = Object.fromEntries((health?.ok ? health.body.models : []).map((m) => [m.id, m]));
    const models = MODELS.map((m) => ({ ...m, available: Boolean(status[m.id]?.available), version: status[m.id]?.version ?? null }));
    res.json({ service: Boolean(health?.ok), models });
  }),
);

// POST /api/diagnostico/analizar — usuarios con sesión: analiza la foto y registra la captura (RF05)
router.post(
  '/analizar',
  requireAuth,
  analyzeLimiter,
  asyncHandler(async (req, res) => {
    const data = analyzeSchema.parse(req.body);
    const models = data.model === 'ambos' ? MODEL_IDS : [data.model];

    const result = await callMl(
      '/predict',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: data.image, models }) },
      30000,
    );
    if (!result) {
      throw new HttpError(503, 'El servicio de los modelos no está activo. La foto no se analizó.', { code: 'model_unavailable' });
    }
    if (!result.ok) {
      throw new HttpError(result.status === 413 || result.status === 400 ? result.status : 502, result.body?.detail || 'El modelo no pudo analizar la imagen');
    }
    const results = result.body.results ?? [];
    if (!results.some((r) => r.available)) {
      throw new HttpError(503, 'El modelo elegido todavía no está entrenado. La foto no se analizó.', { code: 'model_unavailable' });
    }

    // Registro: foto en el volumen; captura y un diagnóstico por modelo en la base de datos.
    const image = await saveImage(data.image);
    let captura;
    try {
      captura = await withTransaction(async (client) => {
        const { rows } = await client.query(
          `INSERT INTO capturas (autor_id, imagen, latitud, longitud, altitud_m, humedad_pct, temperatura_c, precipitacion_mm)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, tomada_en`,
          [req.user.id, image.name, data.latitud, data.longitud, data.altitud_m, data.humedad_pct, data.temperatura_c, data.precipitacion_mm],
        );
        for (const r of results.filter((x) => x.available)) {
          await client.query(
            `INSERT INTO diagnosticos (captura_id, modelo_id, prob_antracnosis, resultado, tiempo_ms)
             VALUES ($1, $2, $3, $4, $5)`,
            [rows[0].id, await modelVersionId(client, r), r.probability, r.class, r.time_ms],
          );
        }
        return rows[0];
      });
    } catch (err) {
      await unlink(image.file).catch(() => {});
      throw err;
    }
    // Guarda el clima de estos días para la captura (sin esperar: si no hay conexión, no afecta al diagnóstico).
    climateConfig()
      .then((cfg) => refreshForecast(cfg))
      .catch(() => {});

    res.status(201).json({
      compared: models.length > 1,
      results,
      captura: {
        id: captura.id,
        tomada_en: captura.tomada_en,
        ubicacion: data.latitud !== null,
        condiciones: ['altitud_m', 'humedad_pct', 'temperatura_c', 'precipitacion_mm'].filter((k) => data[k] !== null).length,
      },
    });
  }),
);

/** Captura con permiso de lectura: quien la tomó, un especialista o el administrador. */
async function readableCapture(req) {
  const id = parseId(req.params.id, 'Captura');
  const { rows } = await query('SELECT id, autor_id, imagen FROM capturas WHERE id = $1', [id]);
  if (!rows[0] || !canSeeCapture(req.user, rows[0])) throw notFound('Captura');
  return rows[0];
}

// GET /api/diagnostico/capturas/:id/imagen — la foto guardada
router.get(
  '/capturas/:id/imagen',
  requireAuth,
  asyncHandler(async (req, res) => {
    const capture = await readableCapture(req);
    res.set('Cache-Control', 'private, max-age=86400');
    res.sendFile(capture.imagen, { root: CAPTURES_DIR, dotfiles: 'deny' }, (err) => {
      if (err && !res.headersSent) res.status(404).json({ error: 'La foto ya no está disponible' });
    });
  }),
);

// POST /api/diagnostico/capturas/:id/gradcam — vuelve a calcular el mapa Grad-CAM de un modelo
// (no se guarda: se genera al pedirlo, con la versión que esté cargada en el servicio).
router.post(
  '/capturas/:id/gradcam',
  requireAuth,
  analyzeLimiter,
  asyncHandler(async (req, res) => {
    const capture = await readableCapture(req);
    const { model } = z.object({ model: z.enum(MODEL_IDS) }).strict().parse(req.body);
    let bytes;
    try {
      bytes = await readFile(path.join(CAPTURES_DIR, capture.imagen));
    } catch {
      throw new HttpError(404, 'La foto ya no está disponible');
    }
    const mime = capture.imagen.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const result = await callMl(
      '/predict',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: `data:${mime};base64,${bytes.toString('base64')}`, models: [model] }),
      },
      30000,
    );
    const r = result?.ok ? result.body.results?.[0] : null;
    if (!r?.available) throw new HttpError(503, 'El servicio de los modelos no está activo.', { code: 'model_unavailable' });
    res.json({ model, version: r.version, gradcam: r.gradcam, probability: r.probability, class: r.class });
  }),
);

export default router;
