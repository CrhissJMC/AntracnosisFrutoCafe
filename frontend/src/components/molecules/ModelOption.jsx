import { Badge, Icon } from '../atoms';
import './ModelOption.css';

/** Opción de modelo como tarjeta seleccionable (radio accesible). */
export function ModelOption({ name, value, checked, onChange, title, description, icon = 'scan', badge, badgeTone = 'success', note }) {
  return (
    <label className={`model-option ${checked ? 'is-checked' : ''}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="visually-hidden" />
      <span className="model-option__icon" aria-hidden="true">
        <Icon name={icon} size={18} />
      </span>
      <span className="model-option__body">
        <span className="model-option__title">
          {title} {badge && <Badge tone={badgeTone}>{badge}</Badge>}
        </span>
        <span className="model-option__desc">{description}</span>
        {note && <span className="model-option__note">{note}</span>}
      </span>
      <span className="model-option__check" aria-hidden="true" />
    </label>
  );
}
