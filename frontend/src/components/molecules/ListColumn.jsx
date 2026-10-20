import './ListColumn.css';

/** Columna con título y lista de prácticas (fondo oscuro, sección "Manejo integrado"). */
export function ListColumn({ title, items }) {
  return (
    <div className="list-column">
      <h3 className="list-column__title">{title}</h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}>
            <span aria-hidden="true">→</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
