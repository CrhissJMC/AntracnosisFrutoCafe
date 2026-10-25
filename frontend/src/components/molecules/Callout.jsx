import { Eyebrow } from '../atoms';
import './Callout.css';

/** Recuadro destacado con etiqueta (p. ej., "Objetivo general"). */
export function Callout({ label, children, className = '' }) {
  return (
    <div className={`callout ${className}`}>
      {label && <Eyebrow className="callout__label">{label}</Eyebrow>}
      <div className="callout__body">{children}</div>
    </div>
  );
}
