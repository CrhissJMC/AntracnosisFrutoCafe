// Exporta la Trazabilidad actual (avance de objetivos, estado de requisitos y bitácora) a
// src/db/trazabilidad.json. Ese archivo se versiona en Git y se carga solo en una base de datos
// nueva (bitácora vacía), así quien clona el repositorio ve el mismo avance del proyecto.
//
//   docker compose exec api node src/db/export-traceability.js
//   docker compose cp api:/app/src/db/trazabilidad.json backend/src/db/trazabilidad.json
import { writeFile } from 'node:fs/promises';
import { pool } from './pool.js';

const objectives = await pool.query('SELECT code, progress FROM objectives ORDER BY code');
const requirements = await pool.query('SELECT code, status FROM requirements ORDER BY code');
const log = await pool.query(
  `SELECT o.code AS objective_code, l.previous_progress, l.new_progress, l.note, l.seci_phase, l.author_name, l.created_at
     FROM progress_log l LEFT JOIN objectives o ON o.id = l.objective_id
    ORDER BY l.created_at, l.id`,
);

const data = {
  exported_at: new Date().toISOString(),
  objectives: objectives.rows,
  requirements: requirements.rows,
  log: log.rows.map((r) => ({ ...r, created_at: new Date(r.created_at).toISOString() })),
};
const path = new URL('./trazabilidad.json', import.meta.url);
await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`Trazabilidad exportada: ${data.objectives.length} objetivos, ${data.requirements.length} requisitos, ${data.log.length} registros`);
await pool.end();
