import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { asyncHandler, HttpError, notFound, parseId } from '../lib/http.js';
import { captureDetail } from '../lib/capturas.js';
import { requireValidator, validatorProfile } from '../lib/modulo.js';

// Validación experta (RF06): solo especialistas y el administrador.
// Las validaciones son un historial: cada una es un registro nuevo y vale la más reciente.
const router = Router();
router.use(requireValidator);

const listSchema = z.object({
  estado: z.enum(['pendientes', 'validados', 'todos']).default('pendientes'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const validationSchema = z
  .object({
    clase_confirmada: z.enum(['sano', 'antracnosis', 'otro_dano'], { message: 'Elige la clase' }),
    comentario: z.string().trim().max(2000, 'Máximo 2000 caracteres').default(''),
  })
  .strict();

// GET /api/validacion/casos — cola: primero los pendientes y, entre ellos, los «revisar»
router.get(
  '/casos',
  asyncHandler(async (req, res) => {
    const { estado, limit, offset } = listSchema.parse(req.query);
    const [cases, counts] = await Promise.all([
      query(
        `SELECT c.id, c.tomada_en, (c.latitud IS NOT NULL) AS con_ubicacion, u.name AS autor,
                f.resultado, f.prob_antracnosis, f.clase_final, f.validado,
                f.clase_confirmada, f.perfil_validador, f.validador_nombre, f.validada_en,
                (SELECT count(*)::int FROM validaciones x WHERE x.captura_id = c.id) AS n_validaciones
           FROM capturas c
           JOIN v_diagnostico_final f ON f.captura_id = c.id
           LEFT JOIN users u ON u.id = c.autor_id
          WHERE $1 = 'todos' OR ($1 = 'pendientes' AND NOT f.validado) OR ($1 = 'validados' AND f.validado)
          ORDER BY f.validado,
                   CASE f.resultado WHEN 'revisar' THEN 0 WHEN 'antracnosis' THEN 1 ELSE 2 END,
                   c.tomada_en DESC, c.id DESC
          LIMIT $2 OFFSET $3`,
        [estado, limit, offset],
      ),
      query(
        `SELECT count(*) FILTER (WHERE NOT validado)::int AS pendientes,
                count(*) FILTER (WHERE validado)::int     AS validados,
                count(*)::int                             AS todos
           FROM v_diagnostico_final`,
      ),
    ]);
    res.json({ casos: cases.rows, totales: counts.rows[0], perfil: validatorProfile(req.user) });
  }),
);

// GET /api/validacion/casos/:id — detalle: diagnósticos de cada modelo e historial de validaciones
router.get(
  '/casos/:id',
  asyncHandler(async (req, res) => {
    res.json({ caso: await captureDetail(parseId(req.params.id, 'Caso')) });
  }),
);

// POST /api/validacion/casos/:id — registra una validación nueva (no reemplaza las anteriores)
router.post(
  '/casos/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'Caso');
    const data = validationSchema.parse(req.body);
    const perfil = validatorProfile(req.user);
    const { rows } = await query('SELECT 1 FROM capturas WHERE id = $1', [id]);
    if (!rows[0]) throw notFound('Caso');
    try {
      // validador_nombre lo completa la base de datos con el nombre real de la cuenta.
      await query(
        `INSERT INTO validaciones (captura_id, validador_id, validador_nombre, perfil_validador, clase_confirmada, comentario)
         VALUES ($1, $2, '', $3, $4, $5)`,
        [id, req.user.id, perfil, data.clase_confirmada, data.comentario],
      );
    } catch (err) {
      if (err.code === '23514') throw new HttpError(403, err.message);
      throw err;
    }
    res.status(201).json({ caso: await captureDetail(id) });
  }),
);

export default router;
