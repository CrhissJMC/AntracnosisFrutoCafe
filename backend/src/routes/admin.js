import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { asyncHandler, HttpError, notFound, parseId } from '../lib/http.js';
import { paginationSchema } from '../lib/schemas.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

// GET /api/admin/stats — resumen del panel
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const { rows } = await query(`
      SELECT
        (SELECT count(*)::int FROM articles)                                   AS articles,
        (SELECT count(*)::int FROM articles WHERE NOT published)               AS drafts,
        (SELECT count(*)::int FROM comments)                                   AS comments,
        (SELECT count(*)::int FROM users WHERE role = 'user')                  AS users,
        (SELECT count(*)::int FROM contact_messages WHERE NOT is_read)         AS unread_messages,
        (SELECT count(*)::int FROM comments WHERE created_at > now() - interval '7 days') AS comments_week`);
    res.json({ stats: rows[0] });
  }),
);

// GET /api/admin/users
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { limit, offset } = paginationSchema.parse(req.query);
    const { rows } = await query(
      `SELECT u.id, u.name, u.email, u.role, u.perfil, u.created_at,
              (SELECT count(*)::int FROM comments c WHERE c.user_id = u.id) AS comment_count
         FROM users u
        ORDER BY u.created_at DESC, u.id DESC
        LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    res.json({ users: rows });
  }),
);

// PATCH /api/admin/users/:id — cambiar rol y/o perfil del módulo (solo el administrador asigna perfiles)
router.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'Usuario');
    const data = z
      .object({
        role: z.enum(['admin', 'user']).optional(),
        perfil: z.preprocess((v) => (v === '' ? null : v), z.enum(['productor', 'propietario', 'especialista']).nullable()).optional(),
      })
      .strict()
      .refine((d) => d.role !== undefined || d.perfil !== undefined, { message: 'Nada que cambiar' })
      .parse(req.body);
    if (data.role !== undefined && id === req.user.id) throw new HttpError(400, 'No puedes cambiar tu propio rol');
    const { rows } = await query(
      `UPDATE users SET role = COALESCE($1::varchar, role),
                        perfil = CASE WHEN $3::boolean THEN $2::varchar ELSE perfil END
        WHERE id = $4 RETURNING id, name, email, role, perfil, created_at`,
      [data.role ?? null, data.perfil ?? null, data.perfil !== undefined, id],
    );
    if (!rows[0]) throw notFound('Usuario');
    res.json({ user: rows[0] });
  }),
);

// DELETE /api/admin/users/:id — borra la cuenta y sus comentarios
router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'Usuario');
    if (id === req.user.id) throw new HttpError(400, 'No puedes eliminar tu propia cuenta');
    const { rowCount } = await query('DELETE FROM users WHERE id = $1', [id]);
    if (!rowCount) throw notFound('Usuario');
    res.status(204).end();
  }),
);

export default router;
