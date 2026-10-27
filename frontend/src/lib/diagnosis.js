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
