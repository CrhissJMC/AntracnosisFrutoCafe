import './Spinner.css';

export function Spinner({ size = 18, label = 'Cargando' }) {
  return <span className="spinner" style={{ width: size, height: size }} role="status" aria-label={label} />;
}
