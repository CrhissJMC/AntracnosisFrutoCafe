import { Icon } from '../atoms';
import './StatCard.css';

export function StatCard({ icon, label, value, hint }) {
  return (
    <div className="stat-card">
      <span className="stat-card__icon">
        <Icon name={icon} size={20} />
      </span>
      <div>
        <p className="stat-card__value">{value ?? '—'}</p>
        <p className="stat-card__label">{label}</p>
        {hint && <p className="stat-card__hint">{hint}</p>}
      </div>
    </div>
  );
}
