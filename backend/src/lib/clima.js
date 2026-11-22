// Clima de la finca y riesgo de antracnosis, sin sensores.
//
// Los datos vienen de Open-Meteo (gratuito, sin clave): temperatura media, humedad relativa media y
// lluvia diaria, estimadas por modelos meteorológicos para la ubicación configurada en el panel. No son
// mediciones en la parcela. Se guardan en `clima_diario` como caché: si Open-Meteo no responde, el
// sistema usa lo guardado y el resto del sitio funciona igual.
//
// Solo se envían a Open-Meteo las coordenadas de la finca (configuradas por el administrador), nunca la
// ubicación de los usuarios.
//
// Riesgo: regla de conocimiento experto (no es un modelo de ML). Un día es «favorable» para la
// antracnosis si la temperatura media está en el rango indicado y llueve o la humedad es muy alta; el
// nivel depende de cuántos de los próximos 7 días son favorables. Los umbrales se editan en el panel.
import { query } from '../db/pool.js';

const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE = 'https://archive-api.open-meteo.com/v1/archive';
const DAILY = 'temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum';
const TZ = 'America/Lima';
const REFRESH_MS = 3 * 60 * 60 * 1000; // el pronóstico se renueva cada 3 horas como máximo
const TIMEOUT_MS = 8000;
const PAST_DAYS = 31; // el pronóstico trae también los últimos 31 días
const MAX_HISTORY_DAYS = 730; // historial que se pide al archivo (2 años)
const WINDOW = 7;

const log = (msg, extra = {}) => console.log(JSON.stringify({ level: 'info', msg, ...extra }));
const num = (v, def, min, max) => {
  const n = Number(String(v ?? '').trim().replace(',', '.'));
  return String(v ?? '').trim() !== '' && Number.isFinite(n) && n >= min && n <= max ? n : def;
};

export const limaToday = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
export const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Ubicación y umbrales del panel (con valores por defecto si alguno no es válido). */
export async function climateConfig() {
  const { rows } = await query("SELECT key, value FROM settings WHERE key LIKE 'clima\\_%' OR key LIKE 'riesgo\\_%'");
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const lat = num(s.clima_lat, -5.9069, -90, 90);
  const lon = num(s.clima_lon, -78.0431, -180, 180);
  const u = {
    temp_min: num(s.riesgo_temp_min, 18, -10, 50),
    temp_max: num(s.riesgo_temp_max, 26, -10, 50),
    lluvia_mm: num(s.riesgo_lluvia_mm, 2, 0, 500),
    hr: num(s.riesgo_hr, 90, 0, 100),
    dias_medio: num(s.riesgo_dias_medio, 3, 1, WINDOW),
    dias_alto: num(s.riesgo_dias_alto, 5, 1, WINDOW),
  };
  if (u.temp_min > u.temp_max) [u.temp_min, u.temp_max] = [u.temp_max, u.temp_min];
  if (u.dias_medio > u.dias_alto) u.dias_medio = u.dias_alto;
  return { nombre: s.clima_nombre?.trim() || 'Finca', lat, lon, ubicacion: `${lat.toFixed(4)},${lon.toFixed(4)}`, umbrales: u };
}

async function fetchDaily(base, cfg, extra) {
  const params = new URLSearchParams({ latitude: String(cfg.lat), longitude: String(cfg.lon), daily: DAILY, timezone: TZ, ...extra });
  const res = await fetch(`${base}?${params}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
  const d = (await res.json()).daily;
  if (!d?.time) throw new Error('Open-Meteo no devolvió datos diarios');
  return d.time.map((fecha, i) => ({
    fecha,
    temp: d.temperature_2m_mean[i],
    hr: d.relative_humidity_2m_mean[i],
    lluvia: d.precipitation_sum[i],
  }));
}

async function store(rows, cfg) {
  const today = limaToday();
  const ok = rows.filter((r) => r.temp !== null || r.hr !== null || r.lluvia !== null);
  if (!ok.length) return 0;
  await query(
    `INSERT INTO clima_diario (fecha, temp_media, hr_media, lluvia_mm, pronostico, ubicacion, actualizado_en)
     SELECT f, t, h, l, p, $6, now()
       FROM unnest($1::date[], $2::numeric[], $3::numeric[], $4::numeric[], $5::boolean[]) AS x(f, t, h, l, p)
     ON CONFLICT (fecha) DO UPDATE
       SET temp_media = EXCLUDED.temp_media, hr_media = EXCLUDED.hr_media, lluvia_mm = EXCLUDED.lluvia_mm,
           pronostico = EXCLUDED.pronostico, ubicacion = EXCLUDED.ubicacion, actualizado_en = now()`,
    [ok.map((r) => r.fecha), ok.map((r) => r.temp), ok.map((r) => r.hr), ok.map((r) => r.lluvia), ok.map((r) => r.fecha > today), cfg.ubicacion],
  );
  return ok.length;
}

// Si cambió la ubicación en el panel, lo guardado ya no corresponde a la finca.
const dropOtherLocations = (cfg) => query('DELETE FROM clima_diario WHERE ubicacion <> $1', [cfg.ubicacion]);

let inflight = null;
/** Renueva los últimos 31 días y el pronóstico de 7 días si lo guardado tiene más de 3 horas. */
export async function refreshForecast(cfg, { force = false } = {}) {
  await dropOtherLocations(cfg);
  if (!force) {
    const { rows } = await query(
      `SELECT max(actualizado_en) AS t, count(*) FILTER (WHERE fecha > $1::date)::int AS futuros
         FROM clima_diario WHERE fecha >= $1::date - 1`,
      [limaToday()],
    );
    const fresh = rows[0].t && Date.now() - new Date(rows[0].t).getTime() < REFRESH_MS && rows[0].futuros >= WINDOW - 1;
    if (fresh) return true;
  }
  inflight ??= (async () => {
    try {
      const n = await store(await fetchDaily(FORECAST, cfg, { past_days: String(PAST_DAYS), forecast_days: String(WINDOW + 1) }), cfg);
      log('clima_actualizado', { dias: n });
      return true;
    } catch (err) {
      log('clima_sin_conexion', { error: err.message });
      return false;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Completa los días que falten entre dos fechas (archivo histórico + pronóstico). Nunca lanza error. */
export async function ensureRange(cfg, desde, hasta) {
  const today = limaToday();
  const ini = desde < addDays(today, -MAX_HISTORY_DAYS) ? addDays(today, -MAX_HISTORY_DAYS) : desde;
  const fin = hasta > addDays(today, -1) ? addDays(today, -1) : hasta;
  if (hasta < addDays(today, -MAX_HISTORY_DAYS)) return false; // fuera del historial que se pide
  if (ini > fin) return refreshForecast(cfg); // solo hoy o días futuros
  await dropOtherLocations(cfg);
  const { rows } = await query(
    `SELECT to_char(min(d), 'YYYY-MM-DD') AS desde, to_char(max(d), 'YYYY-MM-DD') AS hasta
       FROM generate_series($1::date, $2::date, interval '1 day') AS g(d)
      WHERE NOT EXISTS (SELECT 1 FROM clima_diario c WHERE c.fecha = g.d::date)`,
    [ini, fin],
  );
  const missing = rows[0];
  if (!missing.desde) return true;
  let ok = true;
  // Lo reciente viene con el pronóstico; lo anterior, del archivo (que tiene unos 5 días de retraso).
  if (missing.hasta >= addDays(today, -PAST_DAYS)) ok = (await refreshForecast(cfg, { force: true })) && ok;
  const archiveEnd = missing.hasta < addDays(today, -PAST_DAYS) ? missing.hasta : addDays(today, -PAST_DAYS);
  if (missing.desde <= archiveEnd) {
    try {
      const n = await store(await fetchDaily(ARCHIVE, cfg, { start_date: missing.desde, end_date: archiveEnd }), cfg);
      log('clima_historial', { desde: missing.desde, hasta: archiveEnd, dias: n });
    } catch (err) {
      log('clima_sin_conexion', { error: err.message });
      ok = false;
    }
  }
  return ok;
}

const toNum = (v) => (v === null || v === undefined ? null : Number(v));

/** ¿El día favorece la antracnosis? (temperatura en rango y lluvia o humedad muy alta) */
export function isFavorable(d, u) {
  if (d.temp === null || (d.lluvia === null && d.hr === null)) return null;
  const wet = (d.lluvia ?? 0) >= u.lluvia_mm || (d.hr ?? 0) >= u.hr;
  return d.temp >= u.temp_min && d.temp <= u.temp_max && wet;
}

const MESSAGES = {
  alto: 'Condiciones muy favorables para la antracnosis. Refuerza los recorridos de vigilancia, retira los frutos enfermos y momificados, y si la parcela tiene antecedentes, consulta al técnico por la protección con cobre antes de las lluvias.',
  medio: 'Algunos días favorables para la antracnosis. Revisa los frutos después de las lluvias y mantén la parcela aireada con poda y sombra regulada.',
  bajo: 'Pocas condiciones favorables para la antracnosis. Mantén la vigilancia de rutina.',
};

/** Nivel de riesgo de los próximos 7 días (desde hoy). */
export function riskLevel(days, u, today = limaToday()) {
  const next = days.filter((d) => d.fecha >= today).slice(0, WINDOW);
  const known = next.filter((d) => d.favorable !== null);
  if (known.length < 4) return { nivel: null, dias_favorables: null, dias: known.length, mensaje: 'No hay pronóstico suficiente para estimar el riesgo.' };
  const fav = known.filter((d) => d.favorable).length;
  const nivel = fav >= u.dias_alto ? 'alto' : fav >= u.dias_medio ? 'medio' : 'bajo';
  return { nivel, dias_favorables: fav, dias: known.length, mensaje: MESSAGES[nivel] };
}

async function readDays(desde, hasta, u) {
  const { rows } = await query(
    `SELECT to_char(fecha, 'YYYY-MM-DD') AS fecha, temp_media, hr_media, lluvia_mm, pronostico, actualizado_en
       FROM clima_diario WHERE fecha BETWEEN $1::date AND $2::date ORDER BY fecha`,
    [desde, hasta],
  );
  return rows.map((r) => {
    const d = { fecha: r.fecha, temp: toNum(r.temp_media), hr: toNum(r.hr_media), lluvia: toNum(r.lluvia_mm), pronostico: r.pronostico };
    return { ...d, favorable: isFavorable(d, u), actualizado_en: r.actualizado_en };
  });
}

/** Últimos 7 días, pronóstico de 7 días y riesgo. */
export async function currentClimate() {
  const cfg = await climateConfig();
  const online = await refreshForecast(cfg);
  const today = limaToday();
  const days = await readDays(addDays(today, -WINDOW), addDays(today, WINDOW), cfg.umbrales);
  const updated = days.reduce((m, d) => (!m || d.actualizado_en > m ? d.actualizado_en : m), null);
  return {
    ubicacion: { nombre: cfg.nombre, lat: cfg.lat, lon: cfg.lon },
    fuente: 'Open-Meteo (datos estimados por modelos meteorológicos, no medidos en la parcela)',
    al_dia: online, // false: no se pudo actualizar y se muestran los últimos datos guardados
    actualizado_en: updated,
    hoy: today,
    umbrales: cfg.umbrales,
    riesgo: riskLevel(days, cfg.umbrales, today),
    dias: days.map(({ actualizado_en, ...d }) => d),
  };
}

/** Resumen de los 7 días que terminan en `fecha` (clima en el que se tomó una captura). */
export async function climateBefore(fecha) {
  const cfg = await climateConfig();
  const desde = addDays(fecha, -(WINDOW - 1));
  await ensureRange(cfg, desde, fecha);
  const days = (await readDays(desde, fecha, cfg.umbrales)).filter((d) => !d.pronostico || d.fecha <= limaToday());
  if (!days.length) return null;
  const avg = (k) => {
    const v = days.map((d) => d[k]).filter((x) => x !== null);
    return v.length ? Math.round((10 * v.reduce((a, b) => a + b, 0)) / v.length) / 10 : null;
  };
  return {
    desde,
    hasta: fecha,
    dias: days.length,
    lluvia_mm: Math.round(10 * days.reduce((a, d) => a + (d.lluvia ?? 0), 0)) / 10,
    temp_media: avg('temp'),
    hr_media: avg('hr'),
    dias_favorables: days.filter((d) => d.favorable).length,
  };
}

/** Lluvia y días favorables por mes ('YYYY-MM'), para el tablero. Solo días ya ocurridos. */
export async function climateByMonth(desde, hasta) {
  const cfg = await climateConfig();
  const today = limaToday();
  const fin = hasta > today ? today : hasta;
  if (desde > fin) return { meses: {}, completo: true };
  const complete = await ensureRange(cfg, desde, fin);
  const days = await readDays(desde, fin, cfg.umbrales);
  const meses = {};
  for (const d of days) {
    const m = d.fecha.slice(0, 7);
    meses[m] ??= { lluvia_mm: 0, dias: 0, dias_favorables: 0 };
    meses[m].lluvia_mm += d.lluvia ?? 0;
    meses[m].dias += 1;
    if (d.favorable) meses[m].dias_favorables += 1;
  }
  for (const m of Object.values(meses)) m.lluvia_mm = Math.round(m.lluvia_mm * 10) / 10;
  return { meses, completo: complete };
}
