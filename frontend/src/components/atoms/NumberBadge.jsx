import './NumberBadge.css';

/** Número dentro de un círculo de color (código de objetivo, paso…). size: sm | md */
export function NumberBadge({ children, color = 'var(--color-forest-700)', size = 'md' }) {
  return (
    <span className={`number-badge number-badge--${size}`} style={{ background: color }}>
      {children}
    </span>
  );
}
