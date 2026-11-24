import { Input } from '../atoms';
import { FormField } from '../molecules';
import { SITE_FIELDS } from '../../lib/diagnosis.js';
import './SiteConditions.css';

/**
 * Condiciones del lugar (variables de influencia): altitud, temperatura, humedad y lluvia. Todas opcionales,
 * porque no todos los productores las conocen con exactitud. No cambian el resultado de la foto: se guardan
 * con la captura para analizarlas después junto con el clima estimado de la zona.
 */
export function SiteConditions({ values, errors = {}, onChange, disabled }) {
  const filled = SITE_FIELDS.filter((f) => String(values[f.key] ?? '').trim() !== '').length;
  return (
    <details className="site-cond" open={filled > 0 || Object.keys(errors).length > 0 || undefined}>
      <summary className="site-cond__summary">
        Agregar las condiciones del lugar
        <span className="site-cond__count">{filled ? `${filled} de ${SITE_FIELDS.length} completadas` : 'opcional'}</span>
      </summary>
      <p className="site-cond__intro">
        Llena solo lo que sepas; si no tienes el dato, déjalo vacío. No cambian el resultado de la foto: se guardan con la
        captura para analizar cuándo aparece la enfermedad. El sistema ya registra el clima estimado de la zona.
      </p>
      <div className="site-cond__grid">
        {SITE_FIELDS.map((f) => (
          <FormField key={f.key} label={`${f.label} (${f.unit})`} optional hint={f.hint} error={errors[f.key]}>
            <Input
              name={f.key}
              inputMode={f.int ? 'numeric' : 'decimal'}
              autoComplete="off"
              placeholder={f.placeholder}
              value={values[f.key] ?? ''}
              onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}
              disabled={disabled}
              maxLength={8}
            />
          </FormField>
        ))}
      </div>
    </details>
  );
}

/** Condiciones que indicó el productor al tomar la foto (detalle de una captura). */
export function SiteConditionsSummary({ capture }) {
  const filled = SITE_FIELDS.filter((f) => capture[f.key] !== null && capture[f.key] !== undefined);
  return (
    <div className="climate-capture">
      <p className="climate-capture__title">Condiciones indicadas por el productor</p>
      {filled.length === 0 ? (
        <p className="site-cond__none">No se indicaron (son opcionales).</p>
      ) : (
        <ul className="climate-capture__list">
          {filled.map((f) => (
            <li key={f.key}>
              <strong>
                {Number(capture[f.key]).toLocaleString('es-PE', { maximumFractionDigits: 1, useGrouping: false })} {f.unit}
              </strong>{' '}
              {f.label.toLowerCase()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
