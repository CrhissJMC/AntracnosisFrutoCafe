import { Router } from 'express';
import { query } from '../db/pool.js';
import { asyncHandler, notFound, parseId } from '../lib/http.js';
import { paginationSchema } from '../lib/schemas.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/comments — moderación (admin)
router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { limit, offset } = paginationSchema.parse(req.query);
    const { rows } = await query(
      `SELECT c.id, c.body, c.created_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email,
              a.id AS article_id, a.title AS article_title, a.slug AS article_slug
         FROM comments c
         JOIN users u    ON u.id = c.user_id
         JOIN articles a ON a.id = c.article_id
        ORDER BY c.created_at DESC, c.id DESC
        LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    res.json({ comments: rows });
  }),
);

// DELETE /api/comments/:id — el autor o un admin
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'Comentario');
    const { rowCount } = await query(
      'DELETE FROM comments WHERE id = $1 AND (user_id = $2 OR $3::boolean)',
      [id, req.user.id, req.user.role === 'admin'],
    );
    // 404 tanto si no existe como si es de otra persona (no revela cuál de los dos).
    if (!rowCount) throw notFound('Comentario');
    res.status(204).end();
  }),
);

export default router;
