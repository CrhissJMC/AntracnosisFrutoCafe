import { Router } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../db/pool.js';
import { asyncHandler, HttpError, notFound, parseId } from '../lib/http.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

export const SECI_PHASES = ['socializacion', 'externalizacion', 'combinacion', 'internalizacion'];

const note = z.string().trim().max(2000, 'Máximo 2000 caracteres');
const seci = z.preprocess((v) => (v === '' ? null : v), z.enum(SECI_PHASES).nullable());

const objectiveUpdateSchema = z
  .object({
    title: z.string().trim().min(1, 'Requerido').max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    weight: z.coerce.number().int().min(0, 'Mínimo 0').max(100, 'Máximo 100').optional(),
    progress: z.coerce.number().int().min(0, 'Mínimo 0 %').max(100, 'Máximo 100 %').optional(),
    note: note.optional().default(''),
    seci_phase: seci.optional().default(null),
  })
  .strict();

const noteSchema = z
  .object({
    objective_id: z.preprocess((v) => (v === '' ? null : v), z.coerce.number().int().positive().nullable()).default(null),
    note: note.min(1, 'Escribe la nota'),
    seci_phase: seci.optional().default(null),
  })
  .strict();

const LOG_SELECT = `
  SELECT l.id, l.objective_id, o.code AS objective_code, o.title AS objective_title,
         l.previous_progress, l.new_progress, l.note, l.seci_phase, l.author_name, l.created_at
    FROM progress_log l
    LEFT JOIN objectives o ON o.id = l.objective_id`;

/** Avance total = promedio de los objetivos ponderado por su peso. */
function totalProgress(objectives) {
  const weights = objectives.reduce((s, o) => s + o.weight, 0);
  if (weights === 0) return 0;
  return Math.round(objectives.reduce((s, o) => s + o.progress * o.weight, 0) / weights);
}

export const REQUIREMENT_STATUSES = ['pendiente', 'disenado', 'implementado', 'probado'];
const STATUS_LABEL = { pendiente: 'Pendiente', disenado: 'Diseñado', implementado: 'Implementado', probado: 'Probado' };

const requirementUpdateSchema = z
  .object({
    status: z.enum(REQUIREMENT_STATUSES, { message: 'Estado no válido' }),
    note: note.optional().default(''),
  })
  .strict();

async function readState(limit = 100) {
  const [objectives, log, requirements] = await Promise.all([
    query('SELECT id, code, title, description, weight, progress, updated_at FROM objectives ORDER BY code'),
    query(`${LOG_SELECT} ORDER BY l.created_at DESC, l.id DESC LIMIT $1`, [limit]),
    query(
      `SELECT r.id, r.code, r.kind, r.title, r.description, r.module, r.test_case, r.priority, r.status, r.updated_at,
              o.code AS objective_code
         FROM requirements r
         LEFT JOIN objectives o ON o.id = r.objective_id
        ORDER BY r.kind, r.position, r.code`,
    ),
  ]);
  const rows = objectives.rows;
  const updatedAt = [...rows.map((o) => o.updated_at), ...log.rows.map((l) => l.created_at)]
    .map((d) => new Date(d).getTime())
    .reduce((a, b) => Math.max(a, b), 0);
  return {
    objectives: rows,
    total: totalProgress(rows),
    updated_at: updatedAt ? new Date(updatedAt).toISOString() : null,
    log: log.rows,
    requirements: requirements.rows,
  };
}

// GET /api/traceability — público: objetivos, avance total y bitácora
router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await readState());
  }),
);

// PATCH /api/traceability/objectives/:id — admin: cambia avance/datos; el cambio de % se registra solo
router.patch(
  '/objectives/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'Objetivo');
    const data = objectiveUpdateSchema.parse(req.body);

    await withTransaction(async (client) => {
      // FOR UPDATE: dos cambios simultáneos no pueden registrar el mismo "valor anterior".
      const { rows } = await client.query('SELECT progress FROM objectives WHERE id = $1 FOR UPDATE', [id]);
      if (!rows[0]) throw notFound('Objetivo');
      const previous = rows[0].progress;

      await client.query(
        `UPDATE objectives
            SET title = COALESCE($2, title), description = COALESCE($3, description),
                weight = COALESCE($4, weight), progress = COALESCE($5, progress), updated_at = now()
          WHERE id = $1`,
        [id, data.title ?? null, data.description ?? null, data.weight ?? null, data.progress ?? null],
      );

      const progressChanged = data.progress !== undefined && data.progress !== previous;
      if (progressChanged) {
        await client.query(
          `INSERT INTO progress_log (objective_id, previous_progress, new_progress, note, seci_phase, author_id, author_name)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, previous, data.progress, data.note, data.seci_phase, req.user.id, req.user.name],
        );
      } else if (data.note) {
        // Sin cambio de %: la nota se guarda igual, asociada al objetivo.
        await client.query(
          `INSERT INTO progress_log (objective_id, note, seci_phase, author_id, author_name)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, data.note, data.seci_phase, req.user.id, req.user.name],
        );
      }
    });

    res.json(await readState());
  }),
);

// PATCH /api/traceability/requirements/:id — admin: cambia el estado de un requisito y lo registra en la bitácora
router.patch(
  '/requirements/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'Requisito');
    const data = requirementUpdateSchema.parse(req.body);

    await withTransaction(async (client) => {
      const { rows } = await client.query(
        'SELECT code, title, status, objective_id FROM requirements WHERE id = $1 FOR UPDATE',
        [id],
      );
      const r = rows[0];
      if (!r) throw notFound('Requisito');
      if (r.status === data.status) return;

      await client.query('UPDATE requirements SET status = $2, updated_at = now() WHERE id = $1', [id, data.status]);
      const text = `${r.code} · ${r.title}: ${STATUS_LABEL[r.status]} → ${STATUS_LABEL[data.status]}`;
      await client.query(
        `INSERT INTO progress_log (objective_id, note, author_id, author_name) VALUES ($1, $2, $3, $4)`,
        [r.objective_id, data.note ? `${text}. ${data.note}` : text, req.user.id, req.user.name],
      );
    });

    res.json(await readState());
  }),
);

// POST /api/traceability/log — admin: nota en la bitácora sin cambiar el avance
router.post(
  '/log',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = noteSchema.parse(req.body);
    await query(
      `INSERT INTO progress_log (objective_id, note, seci_phase, author_id, author_name)
       VALUES ($1, $2, $3, $4, $5)`,
      [data.objective_id, data.note, data.seci_phase, req.user.id, req.user.name],
    );
    res.status(201).json(await readState());
  }),
);

// DELETE /api/traceability/log/:id — admin: corrige un registro equivocado (no revierte el %)
router.delete(
  '/log/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'Registro');
    const { rowCount } = await query('DELETE FROM progress_log WHERE id = $1', [id]);
    if (!rowCount) throw new HttpError(404, 'Registro no encontrado');
    res.status(204).end();
  }),
);

export default router;
