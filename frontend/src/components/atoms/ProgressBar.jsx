import './ProgressBar.css';

/** Barra de progreso 0–100. `color` permite teñirla (p. ej., con el color de cada objetivo). */
export function ProgressBar({ value = 0, color = 'var(--color-forest-700)', label, size = 'md', className = '' }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      className={`progress-bar progress-bar--${size} ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-label={label}
    >
      <span className="progress-bar__fill" style={{ width: `${v}%`, background: color }} />
    </div>
  );
}
