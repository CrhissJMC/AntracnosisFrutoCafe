import { forwardRef } from 'react';
import { Select } from '../atoms';
import { SECI } from '../../lib/traceability.js';

/** Selector de la fase del modelo SECI (o ninguna). */
export const SeciSelect = forwardRef(function SeciSelect(props, ref) {
  return (
    <Select ref={ref} {...props}>
      <option value="">Sin etiqueta</option>
      {Object.entries(SECI).map(([key, v]) => (
        <option key={key} value={key}>
          {v.label}
        </option>
      ))}
    </Select>
  );
});
