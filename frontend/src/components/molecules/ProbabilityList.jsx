import { ProgressBar } from '../atoms';
import { HEALTH_CLASSES } from '../../lib/diagnosis.js';
import './ProbabilityList.css';

const pct = (p) => `${Math.round((p ?? 0) * 100)} %`;

/** Probabilidad que el modelo asignó a cada clase (sano y antracnosis; «revisar» no es una clase). */
export function ProbabilityList({ probabilities = {} }) {
  return (
    <dl className="prob-list">
      {HEALTH_CLASSES.filter((c) => c.id in probabilities).map((c) => (
        <div key={c.id} className="prob-list__row">
          <dt>{c.short}</dt>
          <dd>
            <ProgressBar value={(probabilities[c.id] ?? 0) * 100} color={c.color} size="sm" label={`Probabilidad de ${c.short}`} />
          </dd>
          <dd className="prob-list__value">{pct(probabilities[c.id])}</dd>
        </div>
      ))}
    </dl>
  );
}
