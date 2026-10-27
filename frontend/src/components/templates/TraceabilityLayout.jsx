import { Section } from '../organisms';
import { MainLayout } from './MainLayout.jsx';
import './TraceabilityLayout.css';

/**
 * Plantilla de la página de trazabilidad (sin datos): cabecera + tres zonas
 * (objetivos | anillo | bitácora) + matriz de requisitos + leyenda. `children` muestra estados de carga o error.
 * Escritorio: 3 columnas · tableta: anillo arriba y 2 columnas · móvil: una columna.
 */
export function TraceabilityLayout({ hero, ring, objectives, log, matrix, legend, children }) {
  return (
    <MainLayout>
      {hero}
      <Section tone="alt" className="traz-layout">
        {children}
        {ring && (
          <div className="traz-layout__grid">
            <div className="traz-layout__ring">{ring}</div>
            <div className="traz-layout__objectives">{objectives}</div>
            <div className="traz-layout__log">{log}</div>
          </div>
        )}
        {matrix && <div className="traz-layout__matrix">{matrix}</div>}
        {legend && <div className="traz-layout__legend">{legend}</div>}
      </Section>
    </MainLayout>
  );
}
