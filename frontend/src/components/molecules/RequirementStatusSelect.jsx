import { useState } from 'react';
import { Select, Spinner } from '../atoms';
import { REQUIREMENT_STATUS } from '../../lib/traceability.js';
import './RequirementStatusSelect.css';

/** Selector del estado de un requisito; guarda al elegir y muestra un indicador mientras tanto. */
export function RequirementStatusSelect({ requirement, onChange }) {
  const [busy, setBusy] = useState(false);
  const handle = async (e) => {
    setBusy(true);
    try {
      await onChange(requirement.id, e.target.value);
    } finally {
      setBusy(false);
    }
  };
  return (
    <span className="req-status-select">
      <Select value={requirement.status} onChange={handle} disabled={busy} aria-label={`Estado de ${requirement.code}`}>
        {Object.entries(REQUIREMENT_STATUS).map(([key, s]) => (
          <option key={key} value={key}>
            {s.label}
          </option>
        ))}
      </Select>
      {busy && <Spinner size={14} label="Guardando" />}
    </span>
  );
}
