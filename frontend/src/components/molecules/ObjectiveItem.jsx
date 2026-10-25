import { NumberBadge, ProgressBar, Text } from '../atoms';
import './ObjectiveItem.css';

/** Un objetivo con su número, avance, barra, descripción y estado. */
export function ObjectiveItem({ code, title, description, progress, weight, status, color, highlighted = false }) {
  return (
    <div className={`objective-item ${highlighted ? 'is-current' : ''}`}>
      <div className="objective-item__head">
        <NumberBadge size="sm" color={color}>
          {code}
        </NumberBadge>
        <p className="objective-item__title">{title}</p>
        <strong className="objective-item__value">{progress} %</strong>
      </div>
      <ProgressBar value={progress} color={color} label={`Avance del objetivo ${code}`} />
      {description && (
        <Text size="sm" className="objective-item__desc">
          {description}
        </Text>
      )}
      <p className="objective-item__meta">
        {status} · peso {weight} %
      </p>
    </div>
  );
}
