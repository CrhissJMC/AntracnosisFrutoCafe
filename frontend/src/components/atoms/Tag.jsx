import './Tag.css';

/** Tag: categoría del artículo. Badge: estado (publicado, borrador, admin…). */
export function Tag({ children }) {
  return <span className="tag">{children}</span>;
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

/** Punto de color. `color` y `size` (px) son opcionales para leyendas y líneas de tiempo. */
export function Dot({ tone = 'brand', color, size, className = '' }) {
  const style = color || size ? { background: color, width: size, height: size } : undefined;
  return <span className={`dot dot--${tone} ${className}`} style={style} aria-hidden="true" />;
}
