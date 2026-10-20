import { Fragment } from 'react';

/*
 * Markdown mínimo y seguro → elementos React (nunca usa innerHTML).
 * Soporta: ## / ### títulos, párrafos, listas con "- ", **negrita**, *cursiva*
 * y [texto](https://enlace). Suficiente para los artículos del blog.
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;

function inline(text, keyPrefix) {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={key}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (link) {
      return (
        <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer">
          {link[1]}
        </a>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export function renderMarkdown(source = '') {
  const blocks = source.replace(/\r\n/g, '\n').split(/\n{2,}/);
  return blocks
    .map((block, i) => {
      const text = block.trim();
      if (!text) return null;
      if (text.startsWith('### ')) return <h3 key={i}>{inline(text.slice(4), i)}</h3>;
      if (text.startsWith('## ')) return <h2 key={i}>{inline(text.slice(3), i)}</h2>;
      const lines = text.split('\n');
      if (lines.every((l) => /^[-*] /.test(l.trim()))) {
        return (
          <ul key={i}>
            {lines.map((l, j) => (
              <li key={j}>{inline(l.trim().slice(2), `${i}-${j}`)}</li>
            ))}
          </ul>
        );
      }
      return <p key={i}>{inline(lines.join(' '), i)}</p>;
    })
    .filter(Boolean);
}

/** Solo el texto inline (para párrafos cortos editables, p. ej. "¿Qué es?"). */
export const renderInline = (text = '', key = 'i') => inline(text, key);
