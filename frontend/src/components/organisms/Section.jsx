import { Heading } from '../atoms';
import './Section.css';

/** Contenedor de sección con título opcional. tone: default | alt | dark */
export function Section({ title, titleTone = 'brand', tone = 'default', children, className = '', id }) {
  return (
    <section className={`section section--${tone} ${className}`} id={id} aria-labelledby={title && id ? `${id}-title` : undefined}>
      <div className="container">
        {title && (
          <Heading id={id ? `${id}-title` : undefined} size="lg" tone={tone === 'dark' ? 'inverse' : titleTone} className="section__title">
            {title}
          </Heading>
        )}
        {children}
      </div>
    </section>
  );
}

/** Rejilla responsiva: `min` es el ancho mínimo de cada columna. */
export function Grid({ min = 240, gap = 'md', children, as: Tag = 'div', className = '' }) {
  return (
    <Tag className={`grid grid--gap-${gap} ${className}`} style={{ '--grid-min': `${min}px` }}>
      {children}
    </Tag>
  );
}
