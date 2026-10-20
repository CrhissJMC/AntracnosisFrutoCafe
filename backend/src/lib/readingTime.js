// Tiempo de lectura estimado a partir del contenido (Markdown).
// Se calcula siempre en el servidor para que coincida con el texto real.
const WORDS_PER_MINUTE = 200;

export function readingMinutes(markdown = '') {
  const text = String(markdown)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // imágenes
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // enlaces → solo el texto
    .replace(/[#>*_`~|-]/g, ' '); // símbolos de Markdown
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return Math.min(120, Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)));
}
