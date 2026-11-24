import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { asyncHandler } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';

// Notificaciones del usuario con sesión: cada uno ve y marca solo las suyas.
const router = Router();
router.use(requireAuth);

// GET /api/notificaciones — las 20 más recientes y cuántas no se leyeron
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [list, unread] = await Promise.all([
      query(
        `SELECT id, tipo, captura_id, mensaje, leida, created_at
           FROM notificaciones WHERE usuario_id = $1
          ORDER BY created_at DESC, id DESC LIMIT 20`,
        [req.user.id],
      ),
      query('SELECT count(*)::int AS n FROM notificaciones WHERE usuario_id = $1 AND NOT leida', [req.user.id]),
    ]);
    res.json({ notificaciones: list.rows, no_leidas: unread.rows[0].n });
  }),
);

// POST /api/notificaciones/leer — { id } marca una; sin id, todas
const readSchema = z.object({ id: z.coerce.number().int().positive().optional() }).strict();
router.post(
  '/leer',
  asyncHandler(async (req, res) => {
    const { id } = readSchema.parse(req.body ?? {});
    await query(
      `UPDATE notificaciones SET leida = TRUE
        WHERE usuario_id = $1 AND NOT leida AND ($2::int IS NULL OR id = $2::int)`,
      [req.user.id, id ?? null],
    );
    const { rows } = await query('SELECT count(*)::int AS n FROM notificaciones WHERE usuario_id = $1 AND NOT leida', [req.user.id]);
    res.json({ no_leidas: rows[0].n });
  }),
);

export default router;
