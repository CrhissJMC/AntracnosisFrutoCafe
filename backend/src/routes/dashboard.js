import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { asyncHandler, HttpError } from '../lib/http.js';
import { seesAllCaptures } from '../lib/capturas.js';
import { climateByMonth, climateConfig } from '../lib/clima.js';
import { requireAuth } from '../middleware/auth.js';

// Tablero de incidencia (RF08): especialista y administrador.
// Usa la clase vigente de cada captura: la validada si existe; si no, el resultado del modelo.
const router = Router();
router.use(requireAuth, (req, res, next) => {
  if (!seesAllCaptures(req.user)) {
    return next(new HttpError(403, 'El tablero está disponible para el especialista y el administrador'));
  }
  next();
});

const date = z.preprocess((v) => (v === '' ? undefined : v), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida').optional());
const filtersSchema = z
  .object({ desde: date, hasta: date })
  .refine((f) => !f.desde || !f.hasta || f.desde <= f.hasta, { message: '«Desde» no puede ser posterior a «hasta»' });

const LOCAL_DATE = "(c.tomada_en AT TIME ZONE 'America/Lima')";

// GET /api/tablero?desde=AAAA-MM-DD&hasta=AAAA-MM-DD
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const f = filtersSchema.parse(req.query);
    const params = [f.desde ?? null, f.hasta ?? null];
    const range = `($1::date IS NULL OR ${LOCAL_DATE}::date >= $1::date) AND ($2::date IS NULL OR ${LOCAL_DATE}::date <= $2::date)`;
    const base = `FROM capturas c JOIN v_diagnostico_final f ON f.captura_id = c.id WHERE ${range}`;

    const [summary, monthly] = await Promise.all([
      query(
        `SELECT count(*)::int AS capturas,
                count(*) FILTER (WHERE f.clase_final = 'sano')::int        AS sano,
                count(*) FILTER (WHERE f.clase_final = 'revisar')::int     AS revisar,
                count(*) FILTER (WHERE f.clase_final = 'antracnosis')::int AS antracnosis,
                count(*) FILTER (WHERE f.clase_final = 'otro_dano')::int   AS otro_dano,
                count(*) FILTER (WHERE f.validado)::int                    AS validadas,
                count(*) FILTER (WHERE NOT f.validado)::int                AS pendientes,
                -- Concordancia: capturas validadas como sano o antracnosis en las que el modelo dio una respuesta
                -- firme (no «revisar»); cuántas coinciden con el especialista.
                count(*) FILTER (WHERE f.validado AND f.resultado <> 'revisar'
                                   AND f.clase_confirmada IN ('sano', 'antracnosis'))::int AS comparables,
                count(*) FILTER (WHERE f.validado AND f.resultado <> 'revisar'
                                   AND f.clase_confirmada = f.resultado)::int               AS concordantes,
                to_char(min(${LOCAL_DATE}), 'YYYY-MM-DD') AS primera, to_char(max(${LOCAL_DATE}), 'YYYY-MM-DD') AS ultima
           ${base}`,
        params,
      ),
      // Todos los meses del periodo, también los que no tienen capturas (el eje del tiempo no salta meses).
      query(
        `WITH datos AS (
           SELECT date_trunc('month', ${LOCAL_DATE})::date AS mes, f.clase_final, f.validado ${base}
         ), limites AS (
           SELECT date_trunc('month', COALESCE($1::date, min(mes)))::date AS ini,
                  date_trunc('month', COALESCE($2::date, max(mes)))::date AS fin
             FROM datos
         )
         SELECT to_char(m.mes, 'YYYY-MM') AS mes,
                count(d.mes)::int                                          AS total,
                count(*) FILTER (WHERE d.clase_final = 'sano')::int        AS sano,
                count(*) FILTER (WHERE d.clase_final = 'revisar')::int     AS revisar,
                count(*) FILTER (WHERE d.clase_final = 'antracnosis')::int AS antracnosis,
                count(*) FILTER (WHERE d.clase_final = 'otro_dano')::int   AS otro_dano,
                count(*) FILTER (WHERE d.validado)::int                    AS validadas
           FROM limites l
           CROSS JOIN LATERAL generate_series(l.ini, l.fin, interval '1 month') AS m(mes)
           LEFT JOIN datos d ON d.mes = m.mes
          WHERE l.ini IS NOT NULL
          GROUP BY m.mes
          ORDER BY m.mes`,
        params,
      ),
    ]);

    const s = summary.rows[0];
    const pct = (a, b) => (b ? Math.round((1000 * a) / b) / 10 : null);

    // Lluvia y días favorables a la antracnosis de cada mes (Open-Meteo); si no hay conexión, lo guardado.
    const months = monthly.rows.map((m) => m.mes);
    let clima = { meses: {}, completo: false };
    if (months.length) {
      const last = months.at(-1);
      const end = new Date(Date.UTC(Number(last.slice(0, 4)), Number(last.slice(5, 7)), 0)).toISOString().slice(0, 10);
      clima = await climateByMonth(`${months[0]}-01`, end).catch(() => clima);
    }
    const cfg = await climateConfig();
    res.json({
      periodo: { desde: f.desde ?? null, hasta: f.hasta ?? null, primera: s.primera, ultima: s.ultima },
      resumen: {
        ...s,
        incidencia_pct: pct(s.antracnosis, s.capturas),
        validadas_pct: pct(s.validadas, s.capturas),
        concordancia_pct: pct(s.concordantes, s.comparables),
      },
      mensual: monthly.rows.map((m) => ({
        ...m,
        incidencia_pct: pct(m.antracnosis, m.total),
        lluvia_mm: clima.meses[m.mes]?.lluvia_mm ?? null,
        dias_favorables: clima.meses[m.mes]?.dias_favorables ?? null,
        dias_clima: clima.meses[m.mes]?.dias ?? 0,
      })),
      clima: { ubicacion: cfg.nombre, completo: clima.completo, fuente: 'Open-Meteo' },
    });
  }),
);

export default router;
