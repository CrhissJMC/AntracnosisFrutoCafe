import { Eyebrow } from '../atoms';
import './Panel.css';

/** Tarjeta con un título pequeño en mayúsculas (átomo Eyebrow como encabezado). */
export function Panel({ title, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <Eyebrow as="h2" className="panel__title">
          {title}
        </Eyebrow>
      )}
      {children}
    </section>
  );
}
