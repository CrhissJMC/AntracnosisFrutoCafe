import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { asyncHandler, notFound, parseId } from '../lib/http.js';
import { contactSchema, paginationSchema } from '../lib/schemas.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Has enviado varios mensajes seguidos. Inténtalo más tarde.' },
});

// POST /api/messages — formulario de contacto (público)
router.post(
  '/',
  contactLimiter,
  asyncHandler(async (req, res) => {
    const data = contactSchema.parse(req.body);
    if (data.website) return res.status(201).json({ ok: true }); // bot: se descarta en silencio
    await query('INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)', [
      data.name,
      data.email,
      data.message,
    ]);
    res.status(201).json({ ok: true });
  }),
);

router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { limit, offset } = paginationSchema.parse(req.query);
    const { rows } = await query(
      `SELECT id, name, email, message, is_read, created_at
         FROM contact_messages
        ORDER BY created_at DESC, id DESC
        LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    res.json({ messages: rows });
  }),
);

router.patch(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'Mensaje');
    const { is_read } = z.object({ is_read: z.boolean() }).strict().parse(req.body);
    const { rows } = await query(
      'UPDATE contact_messages SET is_read = $1 WHERE id = $2 RETURNING id, is_read',
      [is_read, id],
    );
    if (!rows[0]) throw notFound('Mensaje');
    res.json({ message: rows[0] });
  }),
);

router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('DELETE FROM contact_messages WHERE id = $1', [parseId(req.params.id, 'Mensaje')]);
    if (!rowCount) throw notFound('Mensaje');
    res.status(204).end();
  }),
);

export default router;
