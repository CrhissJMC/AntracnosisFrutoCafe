import { Text } from '../atoms';
import { LegendItem } from '../molecules';
import { PHASES, SECI, objectiveColor } from '../../lib/traceability.js';
import './CycleLegend.css';

/** Leyenda de la trazabilidad: tramos del ciclo por objetivo y fases del modelo SECI. */
export function CycleLegend() {
  return (
    <div className="cycle-legend">
      <div>
        <p className="cycle-legend__title">Cómo leer el ciclo</p>
        <ul className="cycle-legend__list">
          {PHASES.map((p) => (
            <LegendItem key={p.code} color={objectiveColor(p.code)}>
              <strong>{p.name}</strong> · etapas {p.stages} · objetivo {p.code}
            </LegendItem>
          ))}
        </ul>
        <Text size="sm">
          Cada etapa equivale a 5 % del avance total. El anillo exterior muestra el avance de cada objetivo según su peso.
        </Text>
      </div>
      <div>
        <p className="cycle-legend__title">Gestión del conocimiento (SECI)</p>
        <ul className="cycle-legend__list cycle-legend__seci">
          {Object.entries(SECI).map(([key, v]) => (
            <li key={key}>
              <strong>{v.label}:</strong> {v.hint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
