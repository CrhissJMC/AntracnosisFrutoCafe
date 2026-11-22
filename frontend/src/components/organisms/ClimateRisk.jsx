import { Icon, Spinner, Text } from '../atoms';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { HEALTH_COLORS } from '../../lib/traceability.js';
import './ClimateRisk.css';

// Riesgo climático de antracnosis (sin sensores): datos de Open-Meteo para la ubicación de la finca y una
// regla de conocimiento experto con umbrales editables en el panel. No entra al modelo de las fotos.
export const RISK = {
  bajo: { label: 'Riesgo bajo', color: HEALTH_COLORS[0] },
  medio: { label: 'Riesgo medio', color: HEALTH_COLORS[1] },
  alto: { label: 'Riesgo alto', color: HEALTH_COLORS[2] },
};
export const RAIN_COLOR = '#2a78d6';

const n1 = (v) => (v === null || v === undefined ? '—' : v.toLocaleString('es-PE', { maximumFractionDigits: 1 }));
const dayName = (iso, today) =>
  iso === today ? 'Hoy' : new Date(`${iso}T12:00:00`).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' });
const updatedAt = (iso) =>
  iso ? new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }) : '';

/** Tarjeta de riesgo: nivel de los próximos 7 días, pronóstico diario y resumen de los últimos 7 días. */
export function ClimateRisk({ compact = false }) {
  const { data, loading, error } = useAsync(() => api.get('/clima'), []);

  if (loading) {
    return (
      <section className="climate climate--state" aria-busy="true">
        <Spinner size={18} label="Cargando clima" />
      </section>
    );
  }
  if (error || !data) return null;

  const risk = data.riesgo.nivel ? RISK[data.riesgo.nivel] : null;
  const next = data.dias.filter((d) => d.fecha >= data.hoy).slice(0, 7);
  const past = data.dias.filter((d) => d.fecha < data.hoy);
  const maxRain = Math.max(1, ...next.map((d) => d.lluvia ?? 0));
  const pastRain = past.reduce((a, d) => a + (d.lluvia ?? 0), 0);
  const u = data.umbrales;

  return (
    <section className={`climate ${compact ? 'climate--compact' : ''}`} style={{ '--risk-color': risk?.color }} aria-labelledby="climate-title">
      <div className="climate__head">
        <div>
          <p className="climate__eyebrow">
            <Icon name="sun" size={15} /> Clima de la finca · {data.ubicacion.nombre}
          </p>
          <h2 id="climate-title" className="climate__title">
            Riesgo de antracnosis por el clima, próximos 7 días
          </h2>
        </div>
        {risk ? (
          <p className="climate__level">
            <span className="climate__dot" aria-hidden="true" /> {risk.label}
            <span className="climate__count">
              {data.riesgo.dias_favorables} de {data.riesgo.dias} días favorables
            </span>
          </p>
        ) : (
          <p className="climate__level climate__level--none">Sin pronóstico</p>
        )}
      </div>

      <Text size="sm">{data.riesgo.mensaje}</Text>

      {next.length > 0 && (
        <ol className="climate__days" aria-label="Pronóstico diario">
          {next.map((d) => (
            <li key={d.fecha} className={`climate__day ${d.favorable ? 'is-favorable' : ''}`}>
              <span className="climate__day-name">{dayName(d.fecha, data.hoy)}</span>
              <span className="climate__rain" title="Lluvia">
                <span className="climate__rain-bar" style={{ height: `${Math.round((100 * (d.lluvia ?? 0)) / maxRain)}%`, background: RAIN_COLOR }} aria-hidden="true" />
              </span>
              <span className="climate__value">
                <strong>{n1(d.lluvia)}</strong> mm
              </span>
              <span className="climate__value">{n1(d.temp)} °C</span>
              <span className="climate__value">
                {n1(d.hr)} %<span className="climate__hr"> HR</span>
              </span>
              <span className="climate__flag">{d.favorable ? 'Favorable' : d.favorable === false ? '—' : 's/d'}</span>
            </li>
          ))}
        </ol>
      )}

      {!compact && (
        <Text size="sm" className="climate__past">
          Últimos 7 días: {n1(Math.round(pastRain * 10) / 10)} mm de lluvia y {past.filter((d) => d.favorable).length} días
          favorables.
        </Text>
      )}

      <p className="climate__note">
        Día favorable: temperatura media entre {n1(u.temp_min)} y {n1(u.temp_max)} °C con al menos {n1(u.lluvia_mm)} mm de
        lluvia o humedad de {n1(u.hr)} % o más. Datos estimados de Open-Meteo para la zona, no medidos en la parcela
        {data.actualizado_en ? ` · actualizado ${updatedAt(data.actualizado_en)}` : ''}
        {!data.al_dia ? ' · sin conexión: se muestran los últimos datos guardados' : ''}.
      </p>
    </section>
  );
}

/** Clima de los 7 días previos a una captura (historial y validación). */
export function CaptureClimate({ clima }) {
  if (!clima) return null;
  return (
    <div className="climate-capture">
      <p className="climate-capture__title">
        <Icon name="sun" size={15} /> Clima de los 7 días previos
      </p>
      <ul className="climate-capture__list">
        <li>
          <strong>{n1(clima.lluvia_mm)} mm</strong> de lluvia
        </li>
        <li>
          <strong>{n1(clima.temp_media)} °C</strong> de temperatura media
        </li>
        <li>
          <strong>{n1(clima.hr_media)} %</strong> de humedad media
        </li>
        <li>
          <strong>
            {clima.dias_favorables} de {clima.dias}
          </strong>{' '}
          días favorables a la antracnosis
        </li>
      </ul>
    </div>
  );
}
