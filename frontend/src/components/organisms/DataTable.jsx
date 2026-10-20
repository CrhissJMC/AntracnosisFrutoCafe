import { EmptyState } from '../molecules';
import './DataTable.css';

/**
 * Tabla responsiva: en pantallas pequeñas cada fila se muestra como tarjeta.
 * columns: [{ key, label, render?(row), className? }]
 */
export function DataTable({ columns, rows, rowKey = 'id', empty = 'No hay registros', caption }) {
  if (!rows.length) return <EmptyState title={empty} />;
  return (
    <div className="data-table">
      <table>
        {caption && <caption className="visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.className}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((c) => (
                <td key={c.key} data-label={c.label} className={c.className}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
