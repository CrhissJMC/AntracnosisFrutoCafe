import { useEffect, useState } from 'react';
import { Button, Icon } from '../atoms';

/** Acción destructiva en dos pasos: el primer clic pide confirmación, el segundo ejecuta. */
export function ConfirmButton({ onConfirm, confirmText = '¿Confirmar?', icon, children, variant = 'danger', size = 'sm', ...rest }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!armed) return undefined;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  const handle = async () => {
    if (!armed) return setArmed(true);
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setArmed(false);
    }
  };

  return (
    <Button variant={armed ? 'danger' : variant} size={size} onClick={handle} loading={busy} aria-live="polite" {...rest}>
      {icon && !busy && <Icon name={icon} size={15} />}
      {armed ? confirmText : children}
    </Button>
  );
}
