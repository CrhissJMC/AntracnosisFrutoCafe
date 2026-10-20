import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db/pool.js';
import { asyncHandler, HttpError, notFound, parseId } from '../lib/http.js';
import { articleSchema, commentSchema, paginationSchema, slugify } from '../lib/schemas.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { readingMinutes } from '../lib/readingTime.js';

const router = Router();

const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Estás comentando muy rápido. Espera un momento.' },
});

const LIST_COLUMNS = `
  a.id, a.slug, a.category, a.title, a.subtitle, a.image_url, a.read_minutes,
  a.published, a.published_at, a.updated_at,
  (SELECT count(*)::int FROM comments c WHERE c.article_id = a.id) AS comment_count`;

const isAdmin = (req) => req.user?.role === 'admin';

// GET /api/articles — públicos; el admin puede pedir ?all=1 para ver borradores
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { limit, offset } = paginationSchema.parse(req.query);
    const includeDrafts = isAdmin(req) && req.query.all === '1';
    const { rows } = await query(
      `SELECT ${LIST_COLUMNS}
         FROM articles a
        WHERE ($1::boolean OR a.published)
        ORDER BY a.published_at DESC, a.id DESC
        LIMIT $2 OFFSET $3`,
      [includeDrafts, limit, offset],
    );
    res.json({ articles: rows });
  }),
);

// GET /api/articles/:slug — detalle (incluye contenido)
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const slug = String(req.params.slug).slice(0, 160);
    // El panel de administración edita por id; acepta ambos.
    const byId = /^\d+$/.test(slug) && isAdmin(req);
    const { rows } = await query(
      `SELECT a.*, (SELECT count(*)::int FROM comments c WHERE c.article_id = a.id) AS comment_count
         FROM articles a
        WHERE ${byId ? 'a.id = $1::int' : 'a.slug = $1'}`,
      [slug],
    );
    const article = rows[0];
    if (!article || (!article.published && !isAdmin(req))) throw notFound('Artículo');
    res.json({ article });
  }),
);

async function saveArticle(req, id) {
  const data = articleSchema.parse(req.body);
  const slug = data.slug || slugify(data.title);
  if (!slug) throw new HttpError(400, 'Revisa los datos enviados', { slug: 'No se pudo generar un slug a partir del título' });

  const values = [
    slug, data.category, data.title, data.subtitle, data.content, data.image_url ?? null,
    readingMinutes(data.content), data.source_text ?? null, data.source_url ?? null, data.published,
  ];
  try {
    if (id === undefined) {
      const { rows } = await query(
        `INSERT INTO articles (slug, category, title, subtitle, content, image_url, read_minutes, source_text, source_url, published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        values,
      );
      return rows[0];
    }
    const { rows } = await query(
      `UPDATE articles
          SET slug = $1, category = $2, title = $3, subtitle = $4, content = $5, image_url = $6,
              read_minutes = $7, source_text = $8, source_url = $9, published = $10, updated_at = now()
        WHERE id = $11
        RETURNING *`,
      [...values, id],
    );
    if (!rows[0]) throw notFound('Artículo');
    return rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw new HttpError(409, 'Ya existe un artículo con ese slug', { slug: 'Elige otro slug' });
    }
    throw err;
  }
}

router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.status(201).json({ article: await saveArticle(req) });
  }),
);

router.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ article: await saveArticle(req, parseId(req.params.id, 'Artículo')) });
  }),
);

router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('DELETE FROM articles WHERE id = $1', [parseId(req.params.id, 'Artículo')]);
    if (!rowCount) throw notFound('Artículo');
    res.status(204).end();
  }),
);

// ── Comentarios de un artículo ──────────────────────────────────────────

async function findVisibleArticle(req, id) {
  const { rows } = await query('SELECT id, published FROM articles WHERE id = $1', [id]);
  const article = rows[0];
  if (!article || (!article.published && !isAdmin(req))) throw notFound('Artículo');
  return article;
}

router.get(
  '/:id/comments',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'Artículo');
    await findVisibleArticle(req, id);
    const { rows } = await query(
      `SELECT c.id, c.body, c.created_at, u.id AS user_id, u.name AS user_name
         FROM comments c
         JOIN users u ON u.id = c.user_id
        WHERE c.article_id = $1
        ORDER BY c.created_at ASC, c.id ASC
        LIMIT 500`,
      [id],
    );
    res.json({ comments: rows });
  }),
);

router.post(
  '/:id/comments',
  requireAuth,
  commentLimiter,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'Artículo');
    const { body } = commentSchema.parse(req.body);
    await findVisibleArticle(req, id);
    const { rows } = await query(
      `INSERT INTO comments (article_id, user_id, body) VALUES ($1, $2, $3)
       RETURNING id, body, created_at`,
      [id, req.user.id, body],
    );
    res.status(201).json({ comment: { ...rows[0], user_id: req.user.id, user_name: req.user.name } });
  }),
);

export default router;
