import { Badge, Dot } from '../atoms';
import { formatDateTime } from '../../lib/format.js';
import { SECI, objectiveColor } from '../../lib/traceability.js';
import './LogEntry.css';

/** Un registro de la bitácora: cambio de avance (anterior → nuevo) o nota. */
export function LogEntry({ entry, actions }) {
  const isChange = entry.new_progress !== null;
  const up = isChange && entry.new_progress >= entry.previous_progress;
  const seci = entry.seci_phase ? SECI[entry.seci_phase] : null;
  return (
    <li className="log-entry">
      <Dot
        size={12}
        color={entry.objective_code ? objectiveColor(entry.objective_code) : 'var(--color-text-muted)'}
        className="log-entry__dot"
      />
      <div className="log-entry__body">
        <div className="log-entry__head">
          <time dateTime={entry.created_at}>{formatDateTime(entry.created_at)}</time>
          <span className="log-entry__target">{entry.objective_code ? `Objetivo ${entry.objective_code}` : 'General'}</span>
        </div>
        {isChange ? (
          <p className={`log-entry__change ${up ? 'is-up' : 'is-down'}`}>
            {entry.previous_progress} % → {entry.new_progress} %
          </p>
        ) : (
          <p className="log-entry__change is-note">Nota</p>
        )}
        {entry.note && <p className="log-entry__note">{entry.note}</p>}
        <div className="log-entry__foot">
          {seci && (
            <span title={seci.hint}>
              <Badge tone="success">{seci.label}</Badge>
            </span>
          )}
          {entry.author_name && <span className="log-entry__author">{entry.author_name}</span>}
          {actions}
        </div>
      </div>
    </li>
  );
}
