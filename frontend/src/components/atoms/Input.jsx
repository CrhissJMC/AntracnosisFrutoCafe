import { forwardRef } from 'react';
import './Input.css';

export const Input = forwardRef(function Input({ invalid, className = '', ...rest }, ref) {
  return <input ref={ref} className={`input ${className}`} aria-invalid={invalid || undefined} {...rest} />;
});

export const Textarea = forwardRef(function Textarea({ invalid, className = '', rows = 5, ...rest }, ref) {
  return <textarea ref={ref} rows={rows} className={`input input--area ${className}`} aria-invalid={invalid || undefined} {...rest} />;
});

export const Select = forwardRef(function Select({ invalid, className = '', children, ...rest }, ref) {
  return (
    <select ref={ref} className={`input input--select ${className}`} aria-invalid={invalid || undefined} {...rest}>
      {children}
    </select>
  );
});

export function Checkbox({ label, className = '', ...rest }) {
  return (
    <label className={`checkbox ${className}`}>
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}
