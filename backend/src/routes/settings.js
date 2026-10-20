import { Router } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../db/pool.js';
import { asyncHandler } from '../lib/http.js';
import { requireAdmin } from '../middleware/auth.js';
import { SETTINGS } from '../db/seed-data.js';

const router = Router();

// Solo se aceptan las claves conocidas (evita que se inyecten claves arbitrarias).
const KEYS = Object.keys(SETTINGS);
const settingsSchema = z
  .object(Object.fromEntries(KEYS.map((k) => [k, z.string().max(5000).optional()])))
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
