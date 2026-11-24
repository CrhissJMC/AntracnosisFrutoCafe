import { z } from 'zod';
import { query } from '../db/pool.js';
import { notFound } from './http.js';
import { climateBefore } from './clima.js';

/**
 * Quién ve qué en el historial (RF05): cada usuario, sus capturas;
 * el especialista y el administrador, todas.
 */
export const seesAllCaptures = (user) => Boolean(user && (user.role === 'admin' || user.perfil === 'especialista'));

const date = z.preprocess((v) => (v === '' ? undefined : v), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida').optional());

export const historyFilters = z.object({
  desde: date,
  hasta: date,
  clase: z.preprocess((v) => (v === '' ? undefined : v), z.enum(['sano', 'revisar', 'antracnosis', 'otro_dano']).optional()),
  estado: z.preprocess((v) => (v === '' ? undefined : v), z.enum(['validados', 'pendientes']).optional()),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
});

/** Condiciones SQL del historial sobre v_diagnostico_final (alias f) y capturas (alias c). Fechas en hora de Perú. */
export function historyWhere(filters, user) {
  const where = [];
  const params = [];
  const add = (sql, value) => {
    params.push(value);
    where.push(sql.replace('?', `$${params.length}`));
  };
  if (!seesAllCaptures(user)) add('c.autor_id = ?', user.id);
  if (filters.desde) add("(c.tomada_en AT TIME ZONE 'America/Lima')::date >= ?::date", filters.desde);
  if (filters.hasta) add("(c.tomada_en AT TIME ZONE 'America/Lima')::date <= ?::date", filters.hasta);
  if (filters.clase) add('f.clase_final = ?', filters.clase);
  if (filters.estado === 'validados') where.push('f.validado');
  if (filters.estado === 'pendientes') where.push('NOT f.validado');
  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

/** Detalle de una captura: diagnósticos de cada modelo e historial de validaciones (la primera es la vigente). */
export async function captureDetail(id) {
  const { rows } = await query(
    `SELECT c.id, c.autor_id, c.tomada_en, c.latitud, c.longitud, u.name AS autor,
            c.altitud_m, c.humedad_pct, c.temperatura_c, c.precipitacion_mm,
            to_char(c.tomada_en AT TIME ZONE 'America/Lima', 'YYYY-MM-DD') AS fecha_local,
            f.resultado, f.clase_final, f.validado
       FROM capturas c
       JOIN v_diagnostico_final f ON f.captura_id = c.id
       LEFT JOIN users u ON u.id = c.autor_id
      WHERE c.id = $1`,
    [id],
  );
  if (!rows[0]) throw notFound('Captura');
  const [diagnoses, history] = await Promise.all([
    query(
      `SELECT d.id, m.modelo, m.version, d.prob_antracnosis, d.resultado, d.tiempo_ms,
              m.umbral_inferior, m.umbral_superior
         FROM diagnosticos d JOIN modelo_versiones m ON m.id = d.modelo_id
        WHERE d.captura_id = $1 ORDER BY d.id`,
      [id],
    ),
    query(
      `SELECT id, clase_confirmada, comentario, perfil_validador, validador_nombre, created_at
         FROM validaciones WHERE captura_id = $1 ORDER BY created_at DESC, id DESC`,
      [id],
    ),
  ]);
  // Clima de los 7 días previos a la captura (si no hay conexión ni datos guardados, queda en null).
  const clima = await climateBefore(rows[0].fecha_local).catch(() => null);
  return { ...rows[0], diagnosticos: diagnoses.rows, historial: history.rows, clima };
}
