import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { asyncHandler, notFound, parseId } from '../lib/http.js';
import { contentItemSchema, SECTIONS } from '../lib/schemas.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const sectionFilter = z.object({ section: z.enum(SECTIONS).optional() });

// GET /api/content?section=servicios — público
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { section } = sectionFilter.parse(req.query);
    const { rows } = await query(
      `SELECT id, section, title, body, position, updated_at
         FROM content_items
        WHERE ($1::text IS NULL OR section = $1)
        ORDER BY section, position, id`,
      [section ?? null],
    );
    res.json({ items: rows });
  }),
);

router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const d = contentItemSchema.parse(req.body);
    const { rows } = await query(
      `INSERT INTO content_items (section, title, body, position)
       VALUES ($1, $2, $3, $4)
       RETURNING id, section, title, body, position, updated_at`,
      [d.section, d.title, d.body, d.position],
    );
    res.status(201).json({ item: rows[0] });
  }),
);

router.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'Elemento');
    const d = contentItemSchema.parse(req.body);
    const { rows } = await query(
      `UPDATE content_items
          SET section = $1, title = $2, body = $3, position = $4, updated_at = now()
        WHERE id = $5
        RETURNING id, section, title, body, position, updated_at`,
      [d.section, d.title, d.body, d.position, id],
    );
    if (!rows[0]) throw notFound('Elemento');
    res.json({ item: rows[0] });
  }),
);

router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('DELETE FROM content_items WHERE id = $1', [parseId(req.params.id, 'Elemento')]);
    if (!rowCount) throw notFound('Elemento');
    res.status(204).end();
  }),
);

export default router;
