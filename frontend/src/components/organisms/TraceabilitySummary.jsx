import { Heading, Text } from '../atoms';
import { CoffeeCycleRing } from './CoffeeCycleRing.jsx';
import './TraceabilitySummary.css';

/** Resumen del avance para el panel: anillo compacto + total + suma de pesos. */
export function TraceabilitySummary({ total, objectives }) {
  const weightSum = objectives.reduce((s, o) => s + o.weight, 0);
  return (
    <div className="traz-summary">
      <CoffeeCycleRing total={total} objectives={objectives} compact />
      <div className="traz-summary__text">
        <Heading as="h2" size="md">
          Avance total: {total} %
        </Heading>
        <Text size="sm">
          Promedio de los objetivos ponderado por su peso. Suma de pesos: <strong>{weightSum}</strong>
          {weightSum !== 100 && ' (no necesita sumar 100: se normaliza).'}
        </Text>
        <Text size="sm">
          Los textos de la página (título, descripción y objetivo general) se editan en <strong>Textos del sitio</strong>.
        </Text>
      </div>
    </div>
  );
}
