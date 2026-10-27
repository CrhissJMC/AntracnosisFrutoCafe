import { useState } from 'react';
import { Badge, Button, NumberBadge, ProgressBar } from '../atoms';
import { REQUIREMENT_STATUS, objectiveColor, requirementSummary } from '../../lib/traceability.js';
import { DataTable } from './DataTable.jsx';
import './RequirementMatrix.css';

const FILTERS = [
  ['all', 'Todos'],
  ['RF', 'Funcionales'],
  ['RNF', 'No funcionales'],
];

export const RequirementStatusBadge = ({ status }) => {
  const s = REQUIREMENT_STATUS[status] ?? REQUIREMENT_STATUS.pendiente;
  return <Badge tone={s.tone}>{s.label}</Badge>;
};

/**
 * Matriz de trazabilidad: requisito → objetivo → módulo → caso de prueba → estado.
 * `renderStatus(row)` permite que el panel reemplace la etiqueta de estado por un selector.
 */
export function RequirementMatrix({ requirements, renderStatus }) {
  const [filter, setFilter] = useState('all');
  const rows = filter === 'all' ? requirements : requirements.filter((r) => r.kind === filter);
  const summary = requirementSummary(requirements);

  const columns = [
    { key: 'code', label: 'Código', render: (r) => <strong className="req-matrix__code">{r.code}</strong> },
    {
      key: 'title',
      label: 'Requisito',
      className: 'col-wide',
      render: (r) => (
        <div>
          <p className="cell-title">{r.title}</p>
          <p className="cell-sub">{r.description}</p>
        </div>
      ),
    },
    { key: 'status', label: 'Estado', render: (r) => (renderStatus ? renderStatus(r) : <RequirementStatusBadge status={r.status} />) },
    {
      key: 'objective',
      label: 'Objetivo',
      render: (r) =>
        r.objective_code ? (
          <NumberBadge size="sm" color={objectiveColor(r.objective_code)}>
            {r.objective_code}
          </NumberBadge>
        ) : (
          '—'
        ),
    },
    { key: 'module', label: 'Módulo', render: (r) => r.module || '—' },
    { key: 'test_case', label: 'Prueba', render: (r) => r.test_case || '—' },
  ];

  return (
    <div className="req-matrix">
      <div className="req-matrix__summary">
        <div className="req-matrix__progress">
          <p className="req-matrix__total">
            <strong>{summary.progress} %</strong> de avance en {summary.total} requisitos
          </p>
          <ProgressBar value={summary.progress} label="Avance de los requisitos" />
        </div>
        <ul className="req-matrix__counts" aria-label="Requisitos por estado">
          {Object.entries(REQUIREMENT_STATUS).map(([key, s]) => (
            <li key={key}>
              <Badge tone={s.tone}>
                {summary.counts[key]} {s.label.toLowerCase()}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="req-matrix__filters" role="group" aria-label="Filtrar requisitos">
        {FILTERS.map(([key, label]) => (
          <Button key={key} size="sm" variant={filter === key ? 'secondary' : 'ghost'} aria-pressed={filter === key} onClick={() => setFilter(key)}>
            {label}
          </Button>
        ))}
      </div>

      <DataTable columns={columns} rows={rows} empty="No hay requisitos" caption="Matriz de trazabilidad de requisitos" />
      <p className="req-matrix__legend">
        Estados: pendiente → diseñado (prototipo o especificación) → implementado → probado. El avance pondera cada estado (0, ⅓, ⅔ y 1).
      </p>
    </div>
  );
}
