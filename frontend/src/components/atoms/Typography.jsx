import './Typography.css';

/**
 * Heading: `as` define la etiqueta semántica (h1…h4) y `size` el tamaño visual.
 * size: display | xl | lg | md | sm   —   tone: default | brand | inverse
 */
export function Heading({ as: Tag = 'h2', size = 'lg', tone = 'default', serif = true, className = '', children, ...rest }) {
  return (
    <Tag className={`heading heading--${size} tone--${tone} ${serif ? 'heading--serif' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/** Text: párrafos y textos de apoyo. size: sm | md | lg — tone: default | muted | inverse | brand */
export function Text({ as: Tag = 'p', size = 'md', tone = 'muted', className = '', children, ...rest }) {
  return (
    <Tag className={`text text--${size} tone--${tone} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/** Etiqueta pequeña en mayúsculas sobre los títulos ("NOSOTROS", "CONTACTO"). */
export function Eyebrow({ as: Tag = 'p', tone = 'muted', className = '', children }) {
  return <Tag className={`eyebrow tone--${tone} ${className}`}>{children}</Tag>;
}
