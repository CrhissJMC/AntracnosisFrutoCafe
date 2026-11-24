// Casos de prueba funcionales CP01–CP10 (informe, Tabla 23): un caso por requerimiento funcional.
//
// Se ejecuta dentro del contenedor de la API, contra el sistema real (API, base de datos y servicio de los
// modelos). Crea usuarios de prueba con los tres perfiles, registra capturas, valida, comenta y exporta;
// al terminar borra todo lo que creó (capturas con sus fotos, usuarios con sus comentarios y la versión
// de prueba del modelo). No toca los datos de nadie más.
//
//   docker compose cp pruebas api:/tmp/pruebas
//   docker compose exec api node /tmp/pruebas/casos_de_prueba.mjs
//   docker compose cp api:/tmp/pruebas/resultados.json pruebas/resultados.json
//
// Las partes que solo se ven en la pantalla (cámara del teléfono, semáforo, botón a las fichas, pestañas por
// perfil) se verifican en el navegador y se registran en pruebas/verificacion_navegador.json.
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.dirname(new URL(import.meta.url).pathname);
const IMG = path.join(DIR, 'imagenes');
const BASE = 'http://127.0.0.1:4000/api';
const ML = process.env.ML_SERVICE_URL;
const CAPTURES_DIR = process.env.CAPTURAS_DIR || '/data/capturas';
const { pool } = await import('/app/src/db/pool.js');
const sql = (text, params) => pool.query(text, params);

// ── utilidades ──────────────────────────────────────────────────────────
function session(name) {
  let cookie = '';
  const req = async (method, url, body, raw = false) => {
    const res = await fetch(BASE + url, {
      method,
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    if (raw) return { status: res.status, type: res.headers.get('content-type'), buf: Buffer.from(await res.arrayBuffer()) };
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text.slice(0, 200) };
    }
    return { status: res.status, body: json };
  };
  req.label = name;
  return req;
}
const dataUrl = async (file) => {
  const buf = await readFile(path.join(IMG, file));
  return `data:image/${file.endsWith('.png') ? 'png' : 'jpeg'};base64,${buf.toString('base64')}`;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// La API admite 20 análisis por minuto: se espalda cada análisis.
let lastAnalysis = 0;
async function analyze(sess, body) {
  const wait = lastAnalysis + 3200 - Date.now();
  if (wait > 0) await sleep(wait);
  lastAnalysis = Date.now();
  const r = await sess('POST', '/diagnostico/analizar', body);
  if (r.body?.captura?.id) created.captures.push(r.body.captura.id);
  return r;
}
/** Ancho y alto de una imagen PNG o JPEG en data URL. */
function imageSize(url) {
  const b = Buffer.from(url.split(',', 2)[1], 'base64');
  if (b[0] === 0x89) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  let i = 2;
  while (i < b.length) {
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
    i += 2 + len;
  }
  return null;
}
const decide = (p, lo, hi) => (p < lo ? 'sano' : p >= hi ? 'antracnosis' : 'revisar');
const limaToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

const created = { captures: [], users: [], versions: [] };
const results = [];
let current;
function caso(codigo, rf, procedimiento, esperado) {
  current = { codigo, rf, procedimiento, esperado, pasos: [] };
  results.push(current);
  console.log(`\n${codigo} · ${rf}`);
}
function check(ok, desc, detalle = '') {
  current.pasos.push({ ok: Boolean(ok), desc, detalle: String(detalle) });
  console.log(`  ${ok ? 'OK   ' : 'FALLA'} ${desc}${detalle !== '' ? ' — ' + detalle : ''}`);
}

// ── preparación: administrador y un usuario por perfil ──────────────────
const admin = session('admin');
await admin('POST', '/auth/login', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
const stamp = Date.now();
const users = {};
for (const perfil of ['productor', 'propietario', 'especialista']) {
  const s = session(perfil);
  const email = `cp-${perfil}-${stamp}@ejemplo.test`;
  const r = await s('POST', '/auth/register', { name: `Prueba ${perfil}`, email, password: randomBytes(12).toString('base64url') });
  created.users.push(r.body.user.id);
  users[perfil] = { s, id: r.body.user.id, name: r.body.user.name };
}
const articlesBefore = (await sql('SELECT count(*)::int AS n FROM articles')).rows[0].n;

try {
  // ── CP10 · perfiles (primero: los demás casos los usan) ───────────────
  caso('CP10', 'RF10 · Gestión de usuarios y perfiles', 'Asignar cada perfil a usuarios distintos', 'Cada perfil ve solo sus pestañas y rutas');
  for (const perfil of ['productor', 'propietario', 'especialista']) {
    const r = await admin('PATCH', `/admin/users/${users[perfil].id}`, { perfil });
    check(r.status === 200 && r.body.user.perfil === perfil, `el administrador asigna el perfil «${perfil}»`, r.status);
  }
  for (const perfil of ['productor', 'propietario', 'especialista']) {
    const me = (await users[perfil].s('GET', '/auth/me')).body;
    check(me.user?.perfil === perfil, `la sesión de «${perfil}» incluye su perfil`);
  }
  const matrix = {
    productor: { historial: 'propias', validacion: 403, tablero: 403 },
    propietario: { historial: 'todas', validacion: 403, tablero: 200 },
    especialista: { historial: 'todas', validacion: 200, tablero: 200 },
  };
  for (const [perfil, exp] of Object.entries(matrix)) {
    const s = users[perfil].s;
    const h = await s('GET', '/historial?limit=1');
    const v = await s('GET', '/validacion/casos');
    const t = await s('GET', '/tablero');
    const a = await s('GET', '/admin/users');
    check(
      h.status === 200 && h.body.alcance === exp.historial && v.status === exp.validacion && t.status === exp.tablero && a.status === 403,
      `«${perfil}»: historial ${exp.historial}, validación ${exp.validacion}, tablero ${exp.tablero}, panel 403`,
      `historial ${h.body.alcance}, validación ${v.status}, tablero ${t.status}, panel ${a.status}`,
    );
  }
  const self = await users.productor.s('PATCH', `/admin/users/${users.productor.id}`, { perfil: 'especialista' });
  check(self.status === 403, 'un productor no puede cambiarse el perfil (403)', self.status);

  // ── CP01 · ingesta ────────────────────────────────────────────────────
  caso('CP01', 'RF01 · Ingesta de imagen del fruto', 'Cargar una JPG y una PNG, y luego un archivo que no es imagen o pesa más de 8 MB', 'La foto se acepta; el archivo inválido se rechaza con un mensaje claro');
  const prod = users.productor.s;
  let r = await analyze(prod, { image: await dataUrl('sano.jpg'), model: 'mobilenet_v2' });
  check(r.status === 201 && r.body.captura?.id, 'una foto JPG se acepta y se analiza', `captura N.º ${r.body.captura?.id}`);
  r = await analyze(prod, { image: await dataUrl('sano.png'), model: 'mobilenet_v2' });
  check(r.status === 201 && r.body.captura?.id, 'una foto PNG se acepta y se analiza', `captura N.º ${r.body.captura?.id}`);
  const text = Buffer.from('Esto no es una imagen.\n'.repeat(50)).toString('base64');
  r = await analyze(prod, { image: `data:text/plain;base64,${text}`, model: 'mobilenet_v2' });
  check(r.status === 400 && /JPG o PNG/.test(JSON.stringify(r.body)), 'un archivo de texto se rechaza', `${r.status}: ${r.body?.details?.image ?? r.body?.error}`);
  r = await analyze(prod, { image: `data:image/jpeg;base64,${text}`, model: 'mobilenet_v2' });
  check(r.status === 400 && !r.body?.captura, 'un texto con extensión de imagen se rechaza y no se registra', `${r.status}: ${r.body?.error}`);
  const big = randomBytes(Math.round(8.5 * 1024 * 1024)).toString('base64');
  r = await analyze(prod, { image: `data:image/jpeg;base64,${big}`, model: 'mobilenet_v2' });
  check(r.status === 400 && /8 MB/.test(JSON.stringify(r.body)), 'un archivo de 8,5 MB se rechaza', `${r.status}: ${r.body?.details?.image ?? r.body?.error}`);

  // ── CP02 · preprocesamiento ───────────────────────────────────────────
  caso('CP02', 'RF02 · Preprocesamiento', 'Enviar fotos de distinta resolución y orientación', 'La imagen llega al modelo en 224 × 224');
  const probs = {};
  for (const f of ['res_2400x2400.jpg', 'res_120x120.jpg', 'horizontal_1600x1200.jpg', 'vertical_1200x1600.jpg', 'orient_base.jpg', 'orient_exif6.jpg']) {
    r = await analyze(prod, { image: await dataUrl(f), model: 'mobilenet_v2' });
    const res0 = r.body?.results?.[0];
    const size = res0?.gradcam ? imageSize(res0.gradcam) : null;
    probs[f] = res0?.probability;
    check(r.status === 201 && size?.w === 224 && size?.h === 224, `${f}: se analiza y la imagen que vio el modelo mide 224 × 224`, size ? `${size.w} × ${size.h}, p = ${res0.probability}` : r.status);
  }
  const d = Math.abs(probs['orient_exif6.jpg'] - probs['orient_base.jpg']);
  check(d <= 0.02, 'una foto girada solo con la etiqueta EXIF da el mismo resultado que la original (se respeta la orientación)', `diferencia de probabilidad ${d.toFixed(4)}`);

  // ── CP03 · clasificación ──────────────────────────────────────────────
  caso('CP03', 'RF03 · Clasificación con CNN', 'Clasificar imágenes con etiqueta conocida', 'Cada imagen recibe sano, revisar o antracnosis según los umbrales');
  const known = (await readdir(path.join(IMG, 'conocidas'))).sort();
  let consistent = 0;
  let total = 0;
  const agree = { mobilenet_v2: 0, efficientnet_b0: 0 };
  const detail = [];
  for (const f of known) {
    const label = f.startsWith('sano') ? 'sano' : 'antracnosis';
    const res = await fetch(`${ML}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: await dataUrl(`conocidas/${f}`), models: ['mobilenet_v2', 'efficientnet_b0'], gradcam: false }),
    }).then((x) => x.json());
    for (const m of res.results) {
      total += 1;
      if (['sano', 'revisar', 'antracnosis'].includes(m.class) && m.class === decide(m.probability, m.thresholds.inferior, m.thresholds.superior)) consistent += 1;
      if (m.class === label) agree[m.model] += 1;
    }
    detail.push(`${f}: ${res.results.map((m) => `${m.model === 'mobilenet_v2' ? 'MNV2' : 'EffB0'} ${m.class} (${m.probability})`).join(', ')}`);
  }
  check(consistent === total, `las ${total} clasificaciones (12 imágenes × 2 modelos) siguen los umbrales de su versión`, `${consistent} de ${total}`);
  check(true, 'coincidencia con la etiqueta (informativo)', `MobileNetV2 ${agree.mobilenet_v2}/12, EfficientNet-B0 ${agree.efficientnet_b0}/12; el resto queda en «revisar» o es un error del modelo`);
  check(true, 'detalle por imagen', detail.join(' | '));
  const ev = JSON.parse(await readFile(path.join(DIR, 'evaluacion_prueba.json'), 'utf8'));
  check(ev.mobilenet_v2.recall >= 0.85, 'evidencia: evaluación de las versiones activas en el conjunto de prueba (568 imágenes)', `MobileNetV2 ${ev.mobilenet_v2.version} recall ${ev.mobilenet_v2.recall}, AUC ${ev.mobilenet_v2.auc}; EfficientNet-B0 ${ev.efficientnet_b0.version} recall ${ev.efficientnet_b0.recall}, AUC ${ev.efficientnet_b0.auc}`);

  // ── CP04 · diagnóstico visual ─────────────────────────────────────────
  caso('CP04', 'RF04 · Diagnóstico visual inmediato', 'Diagnosticar un fruto sano, uno con antracnosis y uno dudoso', 'Semáforo, probabilidad, Grad-CAM, recomendación y botón a fichas');
  const products = (await sql("SELECT title FROM content_items WHERE section = 'productos'")).rows.map((x) => x.title.toLowerCase());
  const seen = new Set();
  for (const [f, tipo] of [['sano.jpg', 'sano'], ['antracnosis.jpg', 'con antracnosis'], ['dudoso.jpg', 'dudoso']]) {
    r = await analyze(prod, { image: await dataUrl(f), model: 'mobilenet_v2' });
    const x = r.body?.results?.[0];
    seen.add(x?.class);
    const fichas = x ? (await prod('GET', `/articles?clase=${x.class}&limit=3`)).body.articles : [];
    const short = { sano: 'sano', revisar: 'revisar', antracnosis: 'antracnosis' }[x?.class];
    check(
      r.status === 201 && x.class && typeof x.probability === 'number' && x.thresholds && x.gradcam?.startsWith('data:image/') && fichas.length > 0 && fichas[0].category === 'FICHA DE MANEJO' && products.includes(short),
      `fruto ${tipo}: resultado, probabilidad, umbrales, Grad-CAM, productos de apoyo y fichas de su clase`,
      `${x?.class} (p = ${x?.probability}), ficha «${fichas[0]?.title}»`,
    );
  }
  check(seen.size === 3, 'los tres resultados del semáforo aparecen (sano, revisar y antracnosis)', [...seen].join(', '));

  // ── CP05 · registro de capturas ───────────────────────────────────────
  caso('CP05', 'RF05 · Registro de capturas', 'Buscar en la base de datos la captura recién registrada', 'Foto, fecha, autor, versión del modelo y ubicación si se autorizó');
  const activas = Object.fromEntries((await sql('SELECT modelo, version FROM modelo_versiones WHERE activo')).rows.map((x) => [x.modelo, x.version]));
  const withLoc = await analyze(prod, { image: await dataUrl('antracnosis.jpg'), model: 'ambos', latitud: -5.9069, longitud: -78.0431, altitud_m: '1650', temperatura_c: '21,5' });
  const noLoc = await analyze(prod, { image: await dataUrl('sano.jpg'), model: 'mobilenet_v2' });
  for (const [cap, loc] of [[withLoc.body.captura.id, true], [noLoc.body.captura.id, false]]) {
    const row = (
      await sql(
        `SELECT c.imagen, c.tomada_en, c.autor_id, c.latitud, c.longitud,
                c.altitud_m, c.temperatura_c, array_agg(m.modelo || ':' || m.version ORDER BY m.modelo) AS versiones
           FROM capturas c JOIN diagnosticos d ON d.captura_id = c.id JOIN modelo_versiones m ON m.id = d.modelo_id
          WHERE c.id = $1 GROUP BY c.id`,
        [cap],
      )
    ).rows[0];
    const fileOk = existsSync(path.join(CAPTURES_DIR, row.imagen));
    const locOk = loc ? Number(row.latitud) === -5.9069 && Number(row.longitud) === -78.0431 : row.latitud === null && row.longitud === null;
    check(
      fileOk && row.tomada_en && row.autor_id === users.productor.id && row.versiones.every((v) => activas[v.split(':')[0]] === v.split(':')[1]) && locOk && (loc ? row.altitud_m === 1650 && Number(row.temperatura_c) === 21.5 : row.altitud_m === null),
      `captura N.º ${cap} ${loc ? 'con' : 'sin'} ubicación: foto guardada, fecha, autor, versión activa del modelo, ubicación ${loc ? 'guardada' : 'vacía'} y condiciones del lugar ${loc ? 'guardadas' : 'vacías (opcionales)'}`,
      `${row.versiones.join(', ')}; ${new Date(row.tomada_en).toISOString()}; ubicación ${row.latitud ?? '—'}, ${row.longitud ?? '—'}; altitud ${row.altitud_m ?? '—'}, temperatura ${row.temperatura_c ?? '—'}`,
    );
  }

  // ── CP06 · validación experta ─────────────────────────────────────────
  caso('CP06', 'RF06 · Validación experta', 'Validar con un especialista y repetir con un productor', 'El especialista registra; al productor se le niega (403) y la base de datos rechaza el intento');
  const capA = withLoc.body.captura.id;
  const capS = noLoc.body.captura.id;
  r = await users.especialista.s('POST', `/validacion/casos/${capA}`, { clase_confirmada: 'antracnosis', comentario: 'Lesión hundida y oscura (prueba CP06).' });
  const h0 = r.body?.caso?.historial?.[0];
  check(r.status === 201 && h0?.perfil_validador === 'especialista' && h0?.validador_nombre === users.especialista.name, 'el especialista valida y queda registrado quién y con qué perfil', `${r.status}, ${h0?.perfil_validador}, ${h0?.validador_nombre}`);
  r = await users.productor.s('POST', `/validacion/casos/${capA}`, { clase_confirmada: 'sano', comentario: 'intento' });
  check(r.status === 403, 'al productor se le niega la validación (403)', r.status);
  try {
    await sql(`INSERT INTO validaciones (captura_id, validador_id, validador_nombre, perfil_validador, clase_confirmada) VALUES ($1, $2, 'x', 'especialista', 'sano')`, [capA, users.productor.id]);
    check(false, 'la base de datos rechaza una validación de un productor aunque se inserte directamente');
  } catch (err) {
    check(true, 'la base de datos rechaza una validación de un productor aunque se inserte directamente', err.message);
  }
  try {
    await sql("UPDATE validaciones SET clase_confirmada = 'sano' WHERE captura_id = $1", [capA]);
    check(false, 'una validación no se puede editar');
  } catch (err) {
    check(true, 'una validación no se puede editar', err.message);
  }
  r = await admin('POST', `/validacion/casos/${capS}`, { clase_confirmada: 'sano', comentario: 'Sin lesiones (prueba CP06).' });
  check(r.status === 201 && r.body.caso.historial[0].perfil_validador === 'admin', 'el administrador también valida y queda registrado como administrador', r.body?.caso?.historial?.[0]?.perfil_validador);

  // ── CP07 · base de conocimiento ───────────────────────────────────────
  caso('CP07', 'RF07 · Base de conocimiento', 'Publicar fichas de las tres clases, diagnosticar un fruto «antracnosis», pulsar el botón y comentar una ficha', 'El blog muestra solo fichas de antracnosis; el comentario se publica; el número de artículos no cambia con nuevos diagnósticos');
  const perClass = (await sql("SELECT clase_relacionada AS c, count(*)::int AS n FROM articles WHERE published AND category = 'FICHA DE MANEJO' AND clase_relacionada IS NOT NULL GROUP BY 1 ORDER BY 1")).rows;
  check(perClass.length === 3 && perClass.every((x) => x.n >= 1), 'hay fichas de manejo publicadas de las tres clases', perClass.map((x) => `${x.c}: ${x.n}`).join(', '));
  const listA = (await prod('GET', '/articles?clase=antracnosis&limit=100')).body.articles;
  check(listA.length > 0 && listA.every((a) => a.clase_relacionada === 'antracnosis'), '/articles?clase=antracnosis (lo que pide el blog filtrado) devuelve solo artículos de antracnosis', `${listA.length} artículos`);
  const ficha = listA.find((a) => a.category === 'FICHA DE MANEJO');
  r = await prod('POST', `/articles/${ficha.id}/comments`, { body: 'Retiramos los frutos afectados de la zona baja (prueba CP07).' });
  check(r.status === 201, 'un productor comenta la ficha de antracnosis', `${r.status}, «${ficha.title}»`);
  const anonC = await session('anon')('POST', `/articles/${ficha.id}/comments`, { body: 'sin sesión' });
  check(anonC.status === 401, 'sin iniciar sesión no se puede comentar (401)', anonC.status);
  const articlesAfter = (await sql('SELECT count(*)::int AS n FROM articles')).rows[0].n;
  check(articlesAfter === articlesBefore, `el número de artículos no cambió después de ${created.captures.length} diagnósticos nuevos`, `${articlesBefore} → ${articlesAfter}`);

  // ── CP08 · tablero ────────────────────────────────────────────────────
  caso('CP08', 'RF08 · Tablero de incidencia', 'Registrar capturas de prueba y abrir el tablero', 'Los totales coinciden con un conteo directo en la base de datos');
  const today = limaToday();
  const t = (await users.propietario.s('GET', `/tablero?desde=${today}&hasta=${today}`)).body;
  const db = (
    await sql(
      `SELECT count(*)::int AS capturas,
              count(*) FILTER (WHERE f.clase_final = 'sano')::int AS sano,
              count(*) FILTER (WHERE f.clase_final = 'revisar')::int AS revisar,
              count(*) FILTER (WHERE f.clase_final = 'antracnosis')::int AS antracnosis,
              count(*) FILTER (WHERE f.clase_final = 'otro_dano')::int AS otro_dano,
              count(*) FILTER (WHERE f.validado)::int AS validadas
         FROM capturas c JOIN v_diagnostico_final f ON f.captura_id = c.id
        WHERE (c.tomada_en AT TIME ZONE 'America/Lima')::date = $1::date`,
      [today],
    )
  ).rows[0];
  const keys = ['capturas', 'sano', 'revisar', 'antracnosis', 'otro_dano', 'validadas'];
  check(keys.every((k) => t.resumen[k] === db[k]), 'los totales del tablero de hoy coinciden con el conteo en la base de datos', keys.map((k) => `${k} ${t.resumen[k]}=${db[k]}`).join(', '));
  check(t.resumen.capturas >= created.captures.length, 'el tablero incluye las capturas de prueba', `${created.captures.length} de prueba, ${t.resumen.capturas} en total hoy`);
  const sumMonth = t.mensual.reduce((a, m) => a + m.total, 0);
  check(sumMonth === t.resumen.capturas, 'la suma por mes coincide con el total', `${sumMonth}`);

  // ── CP09 · reentrenamiento y versionado ───────────────────────────────
  caso('CP09', 'RF09 · Reentrenamiento y versionado', 'Exportar el ZIP, verificar su estructura y activar otra versión', 'La estructura coincide con la que espera entrenar.py; solo una versión activa por arquitectura');
  const zip = await admin('GET', '/admin/modelos/reentrenamiento', null, true);
  const names = [];
  for (let i = 0; i + 30 < zip.buf.length; i++) {
    if (zip.buf.readUInt32LE(i) === 0x04034b50) {
      const nlen = zip.buf.readUInt16LE(i + 26);
      const elen = zip.buf.readUInt16LE(i + 28);
      const size = zip.buf.readUInt32LE(i + 18);
      names.push(zip.buf.subarray(i + 30, i + 30 + nlen).toString('utf8'));
      i += 30 + nlen + elen + size - 1;
    }
  }
  const imgs = names.filter((n) => !['manifiesto.csv', 'LEEME.txt'].includes(n));
  check(zip.status === 200 && zip.type === 'application/zip' && names.includes('manifiesto.csv') && imgs.every((n) => /^(sano|antracnosis)\/captura_\d+\.(jpg|png)$/.test(n)), 'el ZIP tiene sano/, antracnosis/, manifiesto.csv y LEEME.txt, como espera entrenar.py', `${imgs.length} fotos; ${names.length} archivos`);
  check(names.includes(`antracnosis/captura_${capA}.jpg`) && names.includes(`sano/captura_${capS}.jpg`), 'incluye las capturas validadas en CP06, en la carpeta de su clase', `captura_${capA} y captura_${capS}`);
  const ins = await sql(
    `INSERT INTO modelo_versiones (modelo, version, archivo, umbral_inferior, umbral_superior, notas, activo)
     VALUES ('mobilenet_v2', 'prueba-cp09', 'mobilenet_v2.keras', 0.07, 0.74, 'Versión de prueba (CP09)', false) RETURNING id`,
  );
  created.versions.push(ins.rows[0].id);
  const prev = (await sql("SELECT id, version FROM modelo_versiones WHERE modelo = 'mobilenet_v2' AND activo")).rows[0];
  r = await admin('PATCH', `/admin/modelos/${ins.rows[0].id}`, { activo: true });
  let act = (await sql("SELECT version FROM modelo_versiones WHERE modelo = 'mobilenet_v2' AND activo")).rows;
  check(r.status === 200 && act.length === 1 && act[0].version === 'prueba-cp09', 'al activar otra versión, queda una sola activa en MobileNetV2', act.map((x) => x.version).join(', '));
  r = await admin('PATCH', `/admin/modelos/${prev.id}`, { activo: true });
  act = (await sql("SELECT modelo, count(*) FILTER (WHERE activo)::int AS activas FROM modelo_versiones GROUP BY modelo ORDER BY modelo")).rows;
  check(r.status === 200 && act.every((x) => x.activas === 1), `se vuelve a activar ${prev.version}; cada arquitectura tiene una versión activa`, act.map((x) => `${x.modelo}: ${x.activas}`).join(', '));
  const list = (await admin('GET', '/admin/modelos')).body.versiones.filter((x) => x.activo);
  check(list.length === 2 && list.every((x) => x.auc && x.recall_antracnosis && x.f1_antracnosis), 'cada versión registra sus métricas (AUC, recall, F1)', list.map((x) => `${x.modelo}: AUC ${x.auc}, recall ${x.recall_antracnosis}`).join('; '));
} finally {
  // ── limpieza: solo lo creado por esta prueba ──────────────────────────
  for (const id of created.captures) {
    const row = (await sql('SELECT imagen FROM capturas WHERE id = $1', [id])).rows[0];
    if (row) await unlink(path.join(CAPTURES_DIR, row.imagen)).catch(() => {});
    await sql('DELETE FROM capturas WHERE id = $1', [id]);
  }
  for (const id of created.versions) await sql("DELETE FROM modelo_versiones WHERE id = $1 AND version = 'prueba-cp09'", [id]);
  for (const id of created.users) await sql("DELETE FROM users WHERE id = $1 AND email LIKE 'cp-%@ejemplo.test'", [id]);
  console.log(`\nLimpieza: ${created.captures.length} capturas, ${created.versions.length} versión de prueba y ${created.users.length} usuarios borrados.`);
}

for (const c of results) c.estado = c.pasos.every((p) => p.ok) ? 'Aprobado' : 'No aprobado';
const out = { fecha: new Date().toISOString(), casos: results.sort((a, b) => a.codigo.localeCompare(b.codigo)) };
await writeFile(path.join(DIR, 'resultados.json'), JSON.stringify(out, null, 2));
console.log('\nResumen:', results.map((c) => `${c.codigo} ${c.estado}`).join(' · '));
await pool.end();
