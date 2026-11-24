import { readFile } from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import { pool, withTransaction } from './pool.js';
import { config } from '../config.js';
import { readingMinutes } from '../lib/readingTime.js';
import {
  SETTINGS,
  CONTENT_ITEMS,
  ARTICLES,
  OBJECTIVES,
  UNIVERSITY_ITEMS,
  LEGACY_DEFAULTS,
  METHOD_ITEMS,
  LEGACY_METHOD_VERSIONS,
  REMOVED_SETTINGS,
  REQUIREMENTS,
  MODEL_VERSIONS,
  KNOWLEDGE_ARTICLES,
  KNOWLEDGE_ARTICLES_V2,
  ARTICLE_CLASS_LINKS,
} from './seed-data.js';

const log = (msg, extra = {}) => console.log(JSON.stringify({ level: 'info', msg, ...extra }));

async function waitForDatabase(retries = 30) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      log('db_not_ready', { attempt });
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function isEmpty(client, table) {
  const { rows } = await client.query(`SELECT NOT EXISTS (SELECT 1 FROM ${table}) AS empty`);
  return rows[0].empty;
}

async function seed(client) {
  // Textos del sitio: inserta las claves que falten, nunca sobrescribe lo editado.
  for (const [key, value] of Object.entries(SETTINGS)) {
    await client.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
      [key, value],
    );
  }

  if (await isEmpty(client, 'content_items')) {
    const positions = {};
    for (const [section, title, body] of CONTENT_ITEMS) {
      positions[section] = (positions[section] ?? 0) + 1;
      await client.query(
        'INSERT INTO content_items (section, title, body, position) VALUES ($1, $2, $3, $4)',
        [section, title, body, positions[section]],
      );
    }
    log('seed_content_items', { count: CONTENT_ITEMS.length });
  }

  if (await isEmpty(client, 'articles')) {
    for (const a of ARTICLES) {
      await client.query(
        `INSERT INTO articles
           (slug, category, title, subtitle, content, image_url, read_minutes, source_text, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [a.slug, a.category, a.title, a.subtitle, a.content, a.image_url, readingMinutes(a.content), a.source_text, a.published_at],
      );
    }
    log('seed_articles', { count: ARTICLES.length });
  }

  // Datos de la universidad: se cargan si la sección aún no tiene bloques.
  const { rows: univ } = await client.query("SELECT 1 FROM content_items WHERE section = 'universidad' LIMIT 1");
  if (univ.length === 0) {
    let position = 0;
    for (const [title, body] of UNIVERSITY_ITEMS) {
      await client.query("INSERT INTO content_items (section, title, body, position) VALUES ('universidad', $1, $2, $3)", [title, body, ++position]);
    }
    log('seed_university_items', { count: UNIVERSITY_ITEMS.length });
  }

  // Metodología: cada sección se carga si está vacía, o se actualiza si sigue
  // exactamente igual a la versión anterior (así no se pisan ediciones del admin).
  const sameItems = (rows, items) =>
    rows.length === items.length && rows.every((r, i) => r.title === items[i][1] && r.body === items[i][2]);
  for (const section of [...new Set(METHOD_ITEMS.map(([s]) => s))]) {
    const items = METHOD_ITEMS.filter(([s]) => s === section);
    const previousVersions = LEGACY_METHOD_VERSIONS.map((v) => v.filter(([s]) => s === section));
    const { rows: existing } = await client.query(
      'SELECT title, body FROM content_items WHERE section = $1 ORDER BY position, id',
      [section],
    );
    const matchesPrevious = previousVersions.some((p) => p.length && sameItems(existing, p));
    if (existing.length && !matchesPrevious) continue;
    if (sameItems(existing, items)) continue;
    await client.query('DELETE FROM content_items WHERE section = $1', [section]);
    for (const [i, [, title, body]] of items.entries()) {
      await client.query('INSERT INTO content_items (section, title, body, position) VALUES ($1, $2, $3, $4)', [section, title, body, i + 1]);
    }
    log(existing.length ? 'update_method_items' : 'seed_method_items', { section, count: items.length });
  }
  await client.query('DELETE FROM settings WHERE key = ANY($1::text[])', [REMOVED_SETTINGS]);

  // Textos por defecto antiguos: se actualizan solo si nadie los editó.
  for (const [key, oldValues] of Object.entries(LEGACY_DEFAULTS.settings)) {
    await client.query('UPDATE settings SET value = $3, updated_at = now() WHERE key = $1 AND value = ANY($2::text[])', [key, oldValues, SETTINGS[key]]);
  }
  await client.query("UPDATE content_items SET body = $2, updated_at = now() WHERE section = 'equipo' AND body = $1", [
    LEGACY_DEFAULTS.teamRole.from,
    LEGACY_DEFAULTS.teamRole.to,
  ]);

  // Objetivos: se cargan si no hay; si siguen siendo los de la presentación inicial
  // (mismos títulos, sin avances registrados), se reemplazan por los del tercer avance.
  const weight = Math.round(100 / OBJECTIVES.length);
  const { rows: currentObjectives } = await client.query('SELECT code, title FROM objectives ORDER BY code');
  const { rows: logRows } = await client.query('SELECT 1 FROM progress_log LIMIT 1');
  const oldTitles = LEGACY_DEFAULTS.objectiveTitles;
  const isLegacy =
    currentObjectives.length === oldTitles.length &&
    currentObjectives.every((o, i) => o.title === oldTitles[i]) &&
    logRows.length === 0;
  if (currentObjectives.length === 0 || isLegacy) {
    await client.query('DELETE FROM objectives');
    for (const [code, title, description] of OBJECTIVES) {
      await client.query('INSERT INTO objectives (code, title, description, weight) VALUES ($1, $2, $3, $4)', [
        code,
        title,
        description,
        weight,
      ]);
    }
    log(isLegacy ? 'update_objectives' : 'seed_objectives', { count: OBJECTIVES.length });
  }
  // Descripciones de objetivos anteriores: se actualizan solo si nadie las editó.
  for (const [code, , description] of OBJECTIVES) {
    const previous = LEGACY_DEFAULTS.objectiveDescriptions[code];
    if (!previous) continue;
    await client.query('UPDATE objectives SET description = $3, updated_at = now() WHERE code = $1 AND description = $2', [code, previous, description]);
  }

  // Matriz de requisitos: se carga si está vacía (cada requisito, ligado a su objetivo por código).
  if (await isEmpty(client, 'requirements')) {
    for (const [i, [code, title, description, objectiveCode, module, testCase, priority, status]] of REQUIREMENTS.entries()) {
      await client.query(
        `INSERT INTO requirements (code, kind, title, description, objective_id, module, test_case, priority, status, position)
         VALUES ($1, $2, $3, $4, (SELECT id FROM objectives WHERE code = $5), $6, $7, $8, $9, $10)`,
        [code, code.startsWith('RNF') ? 'RNF' : 'RF', title, description, objectiveCode, module, testCase, priority, status, i + 1],
      );
    }
    log('seed_requirements', { count: REQUIREMENTS.length });
  }
  // Títulos y descripciones de requisitos anteriores (tres clases, perfiles antiguos, parcelas):
  // se actualizan solo si nadie los editó. Cada valor puede ser un texto o una lista de textos anteriores.
  const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  for (const [code, title, description] of REQUIREMENTS) {
    const previous = asList(LEGACY_DEFAULTS.requirementDescriptions[code]);
    if (previous.length) {
      await client.query('UPDATE requirements SET description = $3, updated_at = now() WHERE code = $1 AND description = ANY($2::text[])', [code, previous, description]);
    }
    const previousTitles = asList(LEGACY_DEFAULTS.requirementTitles?.[code]);
    if (previousTitles.length) {
      await client.query('UPDATE requirements SET title = $3, updated_at = now() WHERE code = $1 AND title = ANY($2::text[])', [code, previousTitles, title]);
    }
  }

  // Trazabilidad versionada (src/db/trazabilidad.json, generada con export-traceability.js):
  // solo en una base nueva, con la bitácora vacía, para que quien clona vea el mismo avance.
  const { rows: anyLog } = await client.query('SELECT 1 FROM progress_log LIMIT 1');
  if (anyLog.length === 0) {
    let snapshot = null;
    try {
      snapshot = JSON.parse(await readFile(new URL('./trazabilidad.json', import.meta.url), 'utf8'));
    } catch {
      // sin archivo: se queda con los valores iniciales
    }
    if (snapshot) {
      for (const o of snapshot.objectives) {
        await client.query('UPDATE objectives SET progress = $2, updated_at = now() WHERE code = $1', [o.code, o.progress]);
      }
      for (const r of snapshot.requirements) {
        await client.query('UPDATE requirements SET status = $2, updated_at = now() WHERE code = $1', [r.code, r.status]);
      }
      for (const l of snapshot.log) {
        await client.query(
          `INSERT INTO progress_log (objective_id, previous_progress, new_progress, note, seci_phase, author_name, created_at)
           VALUES ((SELECT id FROM objectives WHERE code = $1), $2, $3, $4, $5, $6, $7)`,
          [l.objective_code, l.previous_progress, l.new_progress, l.note, l.seci_phase, l.author_name, l.created_at],
        );
      }
      log('seed_traceability', { objectives: snapshot.objectives.length, log: snapshot.log.length });
    }
  }

  // Sincroniza el tiempo de lectura con el contenido real de cada artículo.
  const { rows: articles } = await client.query('SELECT id, content, read_minutes FROM articles');
  let synced = 0;
  for (const a of articles) {
    const minutes = readingMinutes(a.content);
    if (minutes !== a.read_minutes) {
      await client.query('UPDATE articles SET read_minutes = $1 WHERE id = $2', [minutes, a.id]);
      synced++;
    }
  }
  if (synced) log('read_minutes_synced', { count: synced });

  // Administrador inicial: solo si todavía no existe ningún admin.
  const { rows } = await client.query("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1");
  if (rows.length === 0) {
    const { name, email, password } = config.admin;
    if (!email || !password) {
      log('admin_not_created', { reason: 'Define ADMIN_EMAIL y ADMIN_PASSWORD para crear el administrador' });
    } else if (password.length < 8) {
      throw new Error('ADMIN_PASSWORD debe tener al menos 8 caracteres');
    } else {
      const hash = await bcrypt.hash(password, 10);
      await client.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')
         ON CONFLICT ((lower(email))) DO UPDATE SET role = 'admin'`,
        [name, email.trim().toLowerCase(), hash],
      );
      log('admin_created', { email });
    }
  }
}

// Módulo de diagnóstico: versiones de los modelos incluidas en el repositorio.
async function seedModule(client) {
  for (const v of MODEL_VERSIONS) {
    const { rowCount } = await client.query(
      `INSERT INTO modelo_versiones (modelo, version, archivo, umbral_inferior, umbral_superior, auc, recall_antracnosis,
                                     precision_antracnosis, f1_antracnosis, num_imagenes, entrenado_en, notas, activo)
       VALUES ($1::varchar, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
               NOT EXISTS (SELECT 1 FROM modelo_versiones WHERE modelo = $1::varchar AND activo))
       ON CONFLICT (modelo, version) DO NOTHING`,
      [v.modelo, v.version, v.archivo, v.umbral_inferior, v.umbral_superior, v.auc, v.recall, v.precision, v.f1, v.num_imagenes, v.entrenado_en, v.notas],
    );
    if (rowCount) log('seed_model_version', { modelo: v.modelo, version: v.version });
  }
  // MobileNetV2 v1-aumento reemplaza a v0 (24/11/2026): se activa una sola vez; después manda el panel.
  const { rowCount: once } = await client.query(
    "INSERT INTO migraciones_aplicadas (nombre) VALUES ('activar_mobilenet_v1') ON CONFLICT DO NOTHING",
  );
  if (once) {
    // En dos pasos: el índice único de «una activa por modelo» se comprueba fila por fila.
    await client.query("UPDATE modelo_versiones SET activo = FALSE WHERE modelo = 'mobilenet_v2' AND activo");
    await client.query("UPDATE modelo_versiones SET activo = TRUE WHERE modelo = 'mobilenet_v2' AND version = 'v1-aumento'");
    log('activate_model_version', { modelo: 'mobilenet_v2', version: 'v1-aumento' });
  }
}

// Base de conocimiento (RF07): fichas de manejo y artículos vinculados a cada resultado.
// Se aplica una sola vez: lo que el administrador borre o cambie después no se restaura.
async function insertKnowledgeArticles(client, articles) {
  let added = 0;
  for (const a of articles) {
    const r = await client.query(
      `INSERT INTO articles
         (slug, category, title, subtitle, content, image_url, read_minutes, source_text, source_url, published_at, clase_relacionada)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (slug) DO NOTHING`,
      [a.slug, a.category, a.title, a.subtitle, a.content, a.image_url, readingMinutes(a.content), a.source_text, a.source_url, a.published_at, a.clase_relacionada],
    );
    added += r.rowCount;
  }
  return added;
}

const applyOnce = async (client, name) =>
  (await client.query('INSERT INTO migraciones_aplicadas (nombre) VALUES ($1) ON CONFLICT DO NOTHING', [name])).rowCount > 0;

async function seedKnowledge(client) {
  // v1: fichas de manejo y artículos existentes vinculados a cada resultado.
  if (await applyOnce(client, 'base_conocimiento_v1')) {
    const added = await insertKnowledgeArticles(client, KNOWLEDGE_ARTICLES);
    let linked = 0;
    for (const [slug, clase] of Object.entries(ARTICLE_CLASS_LINKS)) {
      const r = await client.query('UPDATE articles SET clase_relacionada = $2 WHERE slug = $1 AND clase_relacionada IS NULL', [slug, clase]);
      linked += r.rowCount;
    }
    log('seed_knowledge_base', { added, linked });
  }
  // v2: fungicidas, abonos y bioinsumos de apoyo.
  if (await applyOnce(client, 'base_conocimiento_v2')) {
    log('seed_knowledge_base_v2', { added: await insertKnowledgeArticles(client, KNOWLEDGE_ARTICLES_V2) });
  }
}

export async function migrate() {
  await waitForDatabase();
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  const moduleSchema = await readFile(new URL('./02_modulo_diagnostico.sql', import.meta.url), 'utf8');
  await withTransaction(async (client) => {
    // Evita que dos instancias de la API migren a la vez.
    await client.query('SELECT pg_advisory_xact_lock(724001)');
    await client.query(schema);
    await client.query(moduleSchema);
    await seed(client);
    await seedModule(client);
    await seedKnowledge(client);
  });
  log('migrations_done');
}
