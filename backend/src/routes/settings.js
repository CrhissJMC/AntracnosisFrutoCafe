import { Router } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../db/pool.js';
import { asyncHandler } from '../lib/http.js';
import { requireAdmin } from '../middleware/auth.js';
import { httpUrl } from '../lib/schemas.js';
import { SETTINGS } from '../db/seed-data.js';

const router = Router();

// Solo se aceptan las claves conocidas (evita que se inyecten claves arbitrarias).
const KEYS = Object.keys(SETTINGS);
// Las claves que guardan un enlace o una imagen solo aceptan http(s) (evita enlaces `javascript:`).
const isLinkKey = (k) => /(_url|_image)$/.test(k);
// Ubicación del clima y umbrales del riesgo: números dentro de un rango (se acepta coma decimal).
const NUMERIC = {
  clima_lat: [-90, 90], clima_lon: [-180, 180],
  riesgo_temp_min: [-10, 50], riesgo_temp_max: [-10, 50], riesgo_lluvia_mm: [0, 500], riesgo_hr: [0, 100],
  riesgo_dias_medio: [1, 7], riesgo_dias_alto: [1, 7],
};
const numeric = ([min, max]) =>
  z
    .string()
    .trim()
    .max(20)
    .refine((v) => {
      const n = Number(v.replace(',', '.'));
      return v !== '' && Number.isFinite(n) && n >= min && n <= max;
    }, `Debe ser un número entre ${min} y ${max}`);
const fieldSchema = (k) => (NUMERIC[k] ? numeric(NUMERIC[k]) : isLinkKey(k) ? z.union([z.literal(''), httpUrl]) : z.string().max(5000));
const settingsSchema = z
  .object(Object.fromEntries(KEYS.map((k) => [k, fieldSchema(k).optional()])))
  .strict();

async function readAll() {
  const { rows } = await query('SELECT key, value FROM settings');
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ settings: await readAll() });
  }),
);

router.put(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = settingsSchema.parse(req.body);
    await withTransaction(async (client) => {
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) continue;
        await client.query(
          `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, now())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
          [key, value.trim()],
        );
      }
    });
    res.json({ settings: await readAll() });
  }),
);

export default router;
