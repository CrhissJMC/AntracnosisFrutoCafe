import { HEALTH_CLASSES } from '../../lib/diagnosis.js';
import './HealthLight.css';

/** Semáforo del estado sanitario: resalta la clase `value` (o ninguna). */
export function HealthLight({ value }) {
  return (
    <ol className="health-light" aria-label="Semáforo del estado sanitario">
      {HEALTH_CLASSES.map((c) => {
        const on = c.id === value;
        return (
          <li
            key={c.id}
            className={`health-light__seg ${on ? 'is-on' : ''}`}
            style={on ? { '--seg-color': c.color } : undefined}
            aria-current={on ? 'true' : undefined}
          >
            <span className="health-light__dot" style={{ background: c.color }} aria-hidden="true" />
            {c.short}
          </li>
        );
      })}
    </ol>
  );
}
