import { Icon } from '../atoms';
import './ContactItem.css';

export function ContactItem({ icon, label, children }) {
  return (
    <div className="contact-item">
      <span className="contact-item__icon">
        <Icon name={icon} size={20} />
      </span>
      <div>
        <p className="contact-item__label">{label}</p>
        <div className="contact-item__value">{children}</div>
      </div>
    </div>
  );
}
