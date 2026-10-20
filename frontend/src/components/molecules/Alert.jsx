import { Icon } from '../atoms';
import './Alert.css';

export function Alert({ tone = 'info', children, onClose }) {
  return (
    <div className={`alert alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <div className="alert__body">{children}</div>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label="Cerrar aviso">
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}
