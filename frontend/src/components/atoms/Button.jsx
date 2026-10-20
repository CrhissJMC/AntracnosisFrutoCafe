import { Link } from './Link.jsx';
import { Spinner } from './Spinner.jsx';
import './Button.css';

/**
 * Botón base del sistema.
 * variant: primary | secondary | outline-light | ghost | danger
 * size: md | sm
 * Si recibe `to`, se renderiza como enlace.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  to,
  loading = false,
  disabled,
  block = false,
  iconOnly = false,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', iconOnly && 'btn--icon', className]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Spinner size={16} label="Procesando" />}
      {children}
    </button>
  );
}
