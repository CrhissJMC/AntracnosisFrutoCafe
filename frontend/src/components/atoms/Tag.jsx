import './Tag.css';

/** Tag: categoría del artículo. Badge: estado (publicado, borrador, admin…). */
export function Tag({ children }) {
  return <span className="tag">{children}</span>;
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function Dot({ tone = 'brand' }) {
  return <span className={`dot dot--${tone}`} aria-hidden="true" />;
}
