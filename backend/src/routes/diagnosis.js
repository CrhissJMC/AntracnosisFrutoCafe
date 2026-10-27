import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { asyncHandler, HttpError } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const ML_URL = process.env.ML_SERVICE_URL;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

// Modelos que ofrece el sitio. "ambos" analiza la misma foto con los dos.
export const MODELS = [
  { id: 'efficientnet_b0', name: 'EfficientNet-B0', description: 'Más preciso · modelo principal', recommended: true },
  { id: 'mobilenet_v2', name: 'MobileNetV2', description: 'Más rápido · más ligero', recommended: false },
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

const analyzeSchema = z
  .object({
    image: imageDataUrl,
    model: z.enum([...MODEL_IDS, 'ambos'], { message: 'Elige un modelo' }),
  })
  .strict();

async function callMl(path, init = {}, timeoutMs = 3000) {
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

// POST /api/diagnostico/analizar — usuarios con sesión: envía la foto al servicio de los modelos
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
    res.json({ compared: models.length > 1, results });
  }),
);

export default router;
