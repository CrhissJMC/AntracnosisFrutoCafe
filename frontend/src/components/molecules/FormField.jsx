import { cloneElement, isValidElement, useId } from 'react';
import { Label } from '../atoms';
import './FormField.css';

/** Label + control + ayuda + error, con los atributos de accesibilidad conectados. */
export function FormField({ label, hint, error, optional, children, className = '' }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id ?? id,
        invalid: Boolean(error),
        'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
      })
    : children;

  return (
    <div className={`field ${className}`}>
      <Label htmlFor={children?.props?.id ?? id} optional={optional}>
        {label}
      </Label>
      {control}
      {hint && !error && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
