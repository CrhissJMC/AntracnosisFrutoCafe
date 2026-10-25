import { Dot } from '../atoms';
import './LegendItem.css';

/** Elemento de leyenda: punto de color + texto. */
export function LegendItem({ color, children }) {
  return (
    <li className="legend-item">
      <Dot size={14} color={color} />
      <span>{children}</span>
    </li>
  );
}
