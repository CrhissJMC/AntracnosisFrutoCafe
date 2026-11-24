import { Router } from 'express';
import { query } from '../db/pool.js';
import { asyncHandler, notFound, parseId } from '../lib/http.js';
import { captureDetail, historyFilters, historyWhere, seesAllCaptures } from '../lib/capturas.js';
import { canSeeCapture } from '../lib/modulo.js';
import { requireAuth } from '../middleware/auth.js';

// Historial de capturas (RF05): cada usuario ve las suyas; propietario, especialista y administrador, todas.
const router = Router();
router.use(requireAuth);

const SELECT = `
  SELECT c.id, c.tomada_en, c.latitud, c.longitud, u.name AS autor,
         f.resultado, f.prob_antracnosis, f.clase_final, f.validado,
         f.clase_confirmada, f.perfil_validador, f.validador_nombre, f.validada_en,
         (SELECT count(*)::int FROM validaciones x WHERE x.captura_id = c.id) AS n_validaciones
    FROM capturas c
    JOIN v_diagnostico_final f ON f.captura_id = c.id
    LEFT JOIN users u ON u.id = c.autor_id`;

// GET /api/historial — lista con filtros (desde, hasta, clase vigente, estado de validación)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filters = historyFilters.parse(req.query);
    const where = historyWhere(filters, req.user);
    const n = where.params.length;
    const [items, total] = await Promise.all([
      query(`${SELECT} ${where.sql} ORDER BY c.tomada_en DESC, c.id DESC LIMIT $${n + 1} OFFSET $${n + 2}`, [
        ...where.params,
        filters.limit,
        filters.offset,
      ]),
      query(
        `SELECT count(*)::int AS total FROM capturas c JOIN v_diagnostico_final f ON f.captura_id = c.id ${where.sql}`,
        where.params,
      ),
    ]);
    res.json({ capturas: items.rows, total: total.rows[0].total, alcance: seesAllCaptures(req.user) ? 'todas' : 'propias' });
  }),
);

// GET /api/historial/exportar — CSV con los mismos filtros (sin paginar); separador «;» para Excel en español
const csvCell = (v) => {
  if (v === null || v === undefined) return '';
  const s = v instanceof Date ? v.toISOString() : String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const CLASS_NAMES = { sano: 'Sano', revisar: 'Revisar', antracnosis: 'Antracnosis', otro_dano: 'Otro daño' };

router.get(
  '/exportar',
  asyncHandler(async (req, res) => {
    const filters = historyFilters.parse(req.query);
    const where = historyWhere(filters, req.user);
    const { rows } = await query(
      `SELECT c.id, c.tomada_en, u.name AS autor, c.latitud, c.longitud,
              c.altitud_m, c.humedad_pct, c.temperatura_c, c.precipitacion_mm,
              eb.version AS eb_version, eb.prob_antracnosis AS eb_prob, eb.resultado AS eb_resultado,
              mb.version AS mb_version, mb.prob_antracnosis AS mb_prob, mb.resultado AS mb_resultado,
              f.clase_final, f.validado, f.clase_confirmada, f.validador_nombre, f.perfil_validador, f.validada_en,
              vv.comentario
         FROM capturas c
         JOIN v_diagnostico_final f ON f.captura_id = c.id
         LEFT JOIN users u ON u.id = c.autor_id
         LEFT JOIN v_validacion_vigente vv ON vv.captura_id = c.id
         LEFT JOIN LATERAL (SELECT m.version, d.prob_antracnosis, d.resultado FROM diagnosticos d
                              JOIN modelo_versiones m ON m.id = d.modelo_id
                             WHERE d.captura_id = c.id AND m.modelo = 'efficientnet_b0' LIMIT 1) eb ON TRUE
         LEFT JOIN LATERAL (SELECT m.version, d.prob_antracnosis, d.resultado FROM diagnosticos d
                              JOIN modelo_versiones m ON m.id = d.modelo_id
                             WHERE d.captura_id = c.id AND m.modelo = 'mobilenet_v2' LIMIT 1) mb ON TRUE
         ${where.sql}
        ORDER BY c.tomada_en DESC, c.id DESC`,
      where.params,
    );
    const header = [
      'captura', 'fecha_hora_utc', 'autor', 'latitud', 'longitud',
      'altitud_m', 'humedad_pct', 'temperatura_c', 'lluvia_mm',
      'efficientnet_b0_version', 'efficientnet_b0_prob_antracnosis', 'efficientnet_b0_resultado',
      'mobilenet_v2_version', 'mobilenet_v2_prob_antracnosis', 'mobilenet_v2_resultado',
      'clase_vigente', 'validado', 'clase_validada', 'validador', 'perfil_validador', 'fecha_validacion_utc', 'comentario',
    ];
    const lines = rows.map((r) =>
      [
        r.id, r.tomada_en, r.autor, r.latitud, r.longitud,
        r.altitud_m, r.humedad_pct, r.temperatura_c, r.precipitacion_mm,
        r.eb_version, r.eb_prob, CLASS_NAMES[r.eb_resultado], r.mb_version, r.mb_prob, CLASS_NAMES[r.mb_resultado],
        CLASS_NAMES[r.clase_final], r.validado ? 'sí' : 'no', CLASS_NAMES[r.clase_confirmada], r.validador_nombre,
        r.perfil_validador === 'admin' ? 'administrador' : r.perfil_validador, r.validada_en, r.comentario,
      ]
        .map(csvCell)
        .join(';'),
    );
    const name = `historial-capturas-${new Date().toISOString().slice(0, 10)}.csv`;
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="${name}"`);
    // BOM: Excel reconoce las tildes en UTF-8
    res.send(`﻿${[header.join(';'), ...lines].join('\r\n')}\r\n`);
  }),
);

// GET /api/historial/:id — detalle (solo lectura) de una captura que el usuario puede ver
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const capture = await captureDetail(parseId(req.params.id, 'Captura'));
    if (!canSeeCapture(req.user, capture)) throw notFound('Captura');
    delete capture.autor_id;
    res.json({ captura: capture });
  }),
);

export default router;
