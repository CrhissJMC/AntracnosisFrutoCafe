import './Label.css';

export function Label({ htmlFor, children, optional }) {
  return (
    <label htmlFor={htmlFor} className="label">
      {children}
      {optional && <span className="label__optional"> (opcional)</span>}
    </label>
  );
}
