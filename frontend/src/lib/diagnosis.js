// Datos y utilidades del módulo de diagnóstico.
import { HEALTH_COLORS } from './traceability.js';

/**
 * Resultados del diagnóstico, en el orden del semáforo. El modelo solo tiene dos clases (sano y
 * antracnosis); «revisar» es el estado de los casos cuya probabilidad queda entre los dos umbrales.
 */
export const HEALTH_CLASSES = [
  { id: 'sano', label: 'Fruto sano', short: 'Sano', color: HEALTH_COLORS[0] },
  { id: 'revisar', label: 'Revisar', short: 'Revisar', color: HEALTH_COLORS[1] },
  { id: 'antracnosis', label: 'Fruto con antracnosis', short: 'Antracnosis', color: HEALTH_COLORS[2] },
];
export const healthClass = (id) => HEALTH_CLASSES.find((c) => c.id === id);

/**
 * Resultado cuyas fichas de manejo se muestran (base de conocimiento, RF07). Con varios resultados
 * (comparar modelos) manda el más grave; si no coinciden, «revisar». «Otro daño» validado → «revisar».
 */
export function knowledgeClass(classes) {
  const list = classes.filter(Boolean).map((c) => (c === 'otro_dano' ? 'revisar' : c));
  if (!list.length) return null;
  if (list.includes('antracnosis')) return 'antracnosis';
  if (list.includes('revisar') || new Set(list).size > 1) return 'revisar';
  return list[0];
}

/**
 * Recomendaciones de productos de un resultado (sección «productos» del contenido): el bloque cuyo título
 * es el nombre corto del resultado (Sano, Revisar, Antracnosis); una recomendación por línea, «Tipo: detalle».
 */
export function productAdvice(items, clase) {
  const short = healthClass(clase)?.short.toLowerCase();
  const item = items.find((i) => i.title.trim().toLowerCase() === short);
  if (!item) return [];
  return item.body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^([^:]{2,60}):\s*(.+)$/);
      return m ? { label: m[1], text: m[2] } : { label: '', text: l };
    });
}

/**
 * Condiciones del lugar (variables de influencia) que el productor puede indicar con la foto. Todas opcionales:
 * vacío = no lo sabe. Mismos rangos que la API y la base de datos.
 */
export const SITE_FIELDS = [
  { key: 'altitud_m', label: 'Altitud', unit: 'm s. n. m.', min: 0, max: 5000, int: true, placeholder: 'p. ej., 1650', hint: 'Altura de la parcela sobre el nivel del mar.' },
  { key: 'temperatura_c', label: 'Temperatura', unit: '°C', min: -5, max: 45, placeholder: 'p. ej., 21', hint: 'Del momento o la media del día.' },
  { key: 'humedad_pct', label: 'Humedad relativa', unit: '%', min: 0, max: 100, placeholder: 'p. ej., 85', hint: 'Si tienes un higrómetro o la consultas en el teléfono.' },
  { key: 'precipitacion_mm', label: 'Lluvia', unit: 'mm', min: 0, max: 500, placeholder: 'p. ej., 5', hint: 'Lluvia de las últimas 24 horas, si tienes pluviómetro.' },
];

/** Valida las condiciones: devuelve { values, errors } con números o null. */
export function parseSiteConditions(raw) {
  const values = {};
  const errors = {};
  for (const f of SITE_FIELDS) {
    const text = String(raw[f.key] ?? '').trim().replace(',', '.');
    if (text === '') {
      values[f.key] = null;
      continue;
    }
    const n = Number(text);
    if (!Number.isFinite(n)) errors[f.key] = 'Escribe un número o déjalo vacío.';
    else if (f.int && !Number.isInteger(n)) errors[f.key] = 'Escribe un número sin decimales.';
    else if (n < f.min || n > f.max) errors[f.key] = `Debe estar entre ${f.min} y ${f.max} ${f.unit}.`;
    else values[f.key] = n;
  }
  return { values, errors };
}

export const CAPTURE_GUIDE = [
  { icon: 'target', label: 'Un solo fruto' },
  { icon: 'image', label: 'Fondo uniforme' },
  { icon: 'ruler', label: 'A 10–20 cm' },
  { icon: 'sun', label: 'Sin contraluz' },
];

/**
 * Criterio visual y acción sugerida de cada clase, tomados de Metodología → "Estado sanitario
 * del fruto" (editable en el panel), para no repetir el texto en dos lugares.
 * Cada bloque tiene el formato "criterio. Acción: qué hacer".
 */
export function classDescriptions(items) {
  return Object.fromEntries(
    HEALTH_CLASSES.map((c, i) => {
      const body = items[i]?.body ?? '';
      const [criterion, action] = body.split(/\s*Acción:\s*/i);
      return [c.id, { criterion: criterion?.trim() ?? '', action: action?.trim() ?? '' }];
    }),
  );
}

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
export const MAX_FILE_BYTES = 8 * 1024 * 1024;

/**
 * Reduce la foto a `max` px por lado y la vuelve a codificar como JPEG.
 * Así se sube más rápido por datos móviles y se eliminan los metadatos EXIF (incluida la ubicación GPS).
 */
export async function prepareImage(file, max = 1024) {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('Usa una foto JPG o PNG.');
  if (file.size > MAX_FILE_BYTES) throw new Error('La foto supera los 8 MB.');
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.toDataURL('image/jpeg', 0.9);
}
