import './FormActions.css';

/** Barra al pie de un formulario: un aviso (Alert) que ocupa el espacio libre + botones a la derecha. */
export function FormActions({ children }) {
  return <div className="form-actions">{children}</div>;
}
