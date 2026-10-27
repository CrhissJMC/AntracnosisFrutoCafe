import { Icon } from '../atoms';
import './ChipList.css';

/** Lista de etiquetas pequeñas con icono (p. ej., la guía de captura). */
export function ChipList({ items, label }) {
  return (
    <ul className="chip-list" aria-label={label}>
      {items.map((i) => (
        <li key={i.label} className="chip-list__item">
          {i.icon && <Icon name={i.icon} size={14} />}
          {i.label}
        </li>
      ))}
    </ul>
  );
}
