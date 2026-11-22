import { useMemo, useState } from 'react';
import { Button, Input, Spinner, Text } from '../components/atoms';
import { Alert, Callout, EmptyState } from '../components/molecules';
import {
  ClimateRisk,
  ValueColumns,
  Legend,
  ModuleTabs,
  monthLabel,
  PageHero,
  PercentLine,
  Section,
  SegmentedBar,
  StackedColumns,
  StatTile,
} from '../components/organisms';
import { MainLayout } from '../components/templates';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../lib/api.js';
import { HEALTH_COLORS } from '../lib/traceability.js';
import { seesAllCaptures } from '../lib/modulo.js';
import { RAIN_COLOR } from '../components/organisms/ClimateRisk.jsx';
import './DashboardPage.css';

// Clase vigente de cada captura, en el orden del semáforo (de abajo hacia arriba en las columnas).
// Paleta validada con el script de dataviz: en este orden los vecinos se distinguen también con
// daltonismo; el ámbar tiene poco contraste con el fondo, por eso hay leyenda y tabla.
const CLASSES = [
  { key: 'sano', label: 'Sano', color: HEALTH_COLORS[0], ink: '#ffffff' },
  { key: 'revisar', label: 'Revisar', color: HEALTH_COLORS[1], ink: '#0b0b0b' },
  { key: 'antracnosis', label: 'Antracnosis', color: HEALTH_COLORS[2], ink: '#ffffff' },
  { key: 'otro_dano', label: 'Otro daño', color: '#4a6fc0', ink: '#ffffff' },
];

const limaToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
const shift = (iso, { days = 0, months = 0 }) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};
const PRESETS = [
  { id: '30d', label: 'Últimos 30 días', range: (t) => ({ desde: shift(t, { days: -29 }), hasta: t }) },
  { id: '90d', label: 'Últimos 90 días', range: (t) => ({ desde: shift(t, { days: -89 }), hasta: t }) },
  { id: '12m', label: 'Últimos 12 meses', range: (t) => ({ desde: `${shift(t, { months: -11 }).slice(0, 7)}-01`, hasta: t }) },
  { id: 'todo', label: 'Todo', range: () => ({ desde: '', hasta: '' }) },
];
const fmtDate = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/** Tablero de incidencia (RF08): propietario, especialista y administrador. */
export function DashboardPage() {
  const { user, ready } = useAuth();
  let body;
  if (!ready) body = <Spinner size={24} />;
  else if (!user) {
    body = (
      <Callout label="Inicia sesión">
        <p>El tablero está disponible para el propietario, el especialista y el administrador.</p>
        <div className="dash-actions">
          <Button to="/login?next=/tablero" size="sm">
            Iniciar sesión
          </Button>
        </div>
      </Callout>
    );
  } else if (!seesAllCaptures(user)) {
    body = <Alert tone="info">El tablero está disponible para el propietario, el especialista y el administrador.</Alert>;
  } else body = <Dashboard />;

  return (
    <MainLayout>
      <PageHero
        label="Módulo de diagnóstico"
        title="Tablero de incidencia"
        description="Cuántos frutos se analizaron, cuántos tienen antracnosis y cómo evoluciona la incidencia mes a mes. Cuenta la clase validada por el especialista cuando existe; si no, el resultado del modelo."
      />
      <ModuleTabs />
      <Section tone="alt">{body}</Section>
    </MainLayout>
  );
}

function Dashboard() {
  const today = useMemo(limaToday, []);
  const [preset, setPreset] = useState('12m');
  const [range, setRange] = useState(() => PRESETS[2].range(today));
  const [custom, setCustom] = useState(range);
  const qs = new URLSearchParams(Object.entries(range).filter(([, v]) => v)).toString();
  const res = useAsync(() => api.get(`/tablero${qs ? `?${qs}` : ''}`), [qs]);

  const choose = (p) => {
    setPreset(p.id);
    const r = p.range(today);
    setRange(r);
    setCustom(r);
  };
  const applyCustom = (e) => {
    e.preventDefault();
    if (custom.desde && custom.hasta && custom.desde > custom.hasta) return;
    setPreset('custom');
    setRange(custom);
  };
  const badRange = custom.desde && custom.hasta && custom.desde > custom.hasta;

  const d = res.data;
  const s = d?.resumen;
  return (
    <div className="dash">
      <ClimateRisk />
      {/* Filtros: una fila sobre todo el tablero; afectan a todos los indicadores y gráficos */}
      <form className="dash-filters" onSubmit={applyCustom}>
        <div className="dash-presets" role="group" aria-label="Periodo">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" className={`dash-preset ${preset === p.id ? 'is-active' : ''}`} aria-pressed={preset === p.id} onClick={() => choose(p)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="dash-custom">
          <label>
            <span>Desde</span>
            <Input type="date" value={custom.desde} max={custom.hasta || undefined} onChange={(e) => setCustom((c) => ({ ...c, desde: e.target.value }))} />
          </label>
          <label>
            <span>Hasta</span>
            <Input type="date" value={custom.hasta} min={custom.desde || undefined} onChange={(e) => setCustom((c) => ({ ...c, hasta: e.target.value }))} />
          </label>
          <Button type="submit" size="sm" variant="outline" disabled={badRange}>
            Aplicar
          </Button>
        </div>
      </form>

      {res.error && <Alert tone="error">{res.error.message}</Alert>}
      {!d && res.loading && <Spinner label="Cargando tablero" />}

      {d && (
        <div className={`dash-body ${res.loading ? 'is-refreshing' : ''}`} aria-busy={res.loading || undefined}>
          <Text size="sm" className="dash-period">
            {range.desde || range.hasta
              ? `Del ${fmtDate(range.desde || s.primera) || '…'} al ${fmtDate(range.hasta || s.ultima) || '…'}`
              : s.capturas
                ? `Todas las capturas: del ${fmtDate(s.primera)} al ${fmtDate(s.ultima)}`
                : 'Todas las capturas'}
          </Text>

          {s.capturas === 0 ? (
            <div className="dash-card">
              <EmptyState icon="chart" title="No hay capturas en este periodo">
                Los análisis de «Nuevo diagnóstico» aparecerán aquí. Prueba con «Todo» o con otro periodo.
              </EmptyState>
            </div>
          ) : (
            <>
              <div className="dash-kpis">
                <StatTile label="Frutos analizados" value={s.capturas.toLocaleString('es-PE')} note={`${s.validadas} validados por un especialista`} />
                <StatTile label="Incidencia de antracnosis" value={`${s.incidencia_pct} %`} note={`${s.antracnosis} de ${s.capturas} frutos`} />
                <StatTile label="Pendientes de validar" value={s.pendientes.toLocaleString('es-PE')} note={`${s.revisar} quedaron en «revisar»`} />
                <StatTile
                  label="Coincidencia modelo–especialista"
                  value={s.concordancia_pct === null ? '—' : `${s.concordancia_pct} %`}
                  note={s.comparables ? `${s.concordantes} de ${s.comparables} validados (sin «revisar»)` : 'Aún no hay validaciones comparables'}
                />
              </div>

              <div className="dash-card">
                <div className="dash-card__head">
                  <h2 className="dash-card__title">Frutos analizados por mes, según su clase</h2>
                  <Legend series={CLASSES} />
                </div>
                <StackedColumns data={d.mensual} series={CLASSES} label="Columnas apiladas: frutos analizados por mes y clase. Los valores están en la tabla de abajo." />
              </div>

              <div className="dash-grid">
                <div className="dash-card">
                  <h2 className="dash-card__title">Incidencia de antracnosis por mes (%)</h2>
                  <PercentLine data={d.mensual} valueKey="incidencia_pct" color={HEALTH_COLORS[2]} label="Línea: porcentaje de frutos con antracnosis por mes. Los valores están en la tabla de abajo." />
                </div>
                <div className="dash-card">
                  <h2 className="dash-card__title">Distribución por clase en el periodo</h2>
                  <SegmentedBar
                    parts={CLASSES.map((c) => ({ ...c, value: s[c.key] }))}
                    total={s.capturas}
                    label={`Barra segmentada: ${CLASSES.map((c) => `${c.label} ${s[c.key]}`).join(', ')}`}
                  />
                  <ul className="dash-split">
                    {CLASSES.map((c) => (
                      <li key={c.key}>
                        <span className="dash-split__key" style={{ background: c.color }} aria-hidden="true" />
                        <span>{c.label}</span>
                        <strong>{s[c.key]}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="dash-card">
                <h2 className="dash-card__title">Lluvia por mes (mm) · {d.clima.ubicacion}</h2>
                <ValueColumns
                  data={d.mensual}
                  valueKey="lluvia_mm"
                  color={RAIN_COLOR}
                  unit="mm"
                  label="Columnas: lluvia acumulada por mes en milímetros. Los valores están en la tabla de abajo."
                  tipRows={(m) => [
                    { label: 'de lluvia', value: `${m.lluvia_mm.toLocaleString('es-PE')} mm`, color: RAIN_COLOR },
                    { label: 'días favorables a la antracnosis', value: `${m.dias_favorables} de ${m.dias_clima}` },
                    { label: 'de incidencia', value: m.incidencia_pct === null ? '—' : `${m.incidencia_pct} %` },
                  ]}
                />
                <Text size="sm" className="dash-note">
                  Compárala con la incidencia de arriba: si los meses lluviosos coinciden con más antracnosis, la finca puede
                  anticipar la vigilancia. Datos estimados de Open-Meteo para la zona, no medidos en la parcela
                  {d.clima.completo ? '' : '; sin conexión, algunos meses pueden estar incompletos'}.
                </Text>
              </div>

              <div className="dash-card">
                <h2 className="dash-card__title">Datos por mes</h2>
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th scope="col">Mes</th>
                        <th scope="col">Analizados</th>
                        {CLASSES.map((c) => (
                          <th key={c.key} scope="col">
                            {c.label}
                          </th>
                        ))}
                        <th scope="col">Incidencia</th>
                        <th scope="col">Validados</th>
                        <th scope="col">Lluvia</th>
                        <th scope="col">Días favorables</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...d.mensual].reverse().map((m) => (
                        <tr key={m.mes}>
                          <th scope="row">{monthLabel(m.mes, true)}</th>
                          <td>{m.total}</td>
                          {CLASSES.map((c) => (
                            <td key={c.key}>{m[c.key]}</td>
                          ))}
                          <td>{m.incidencia_pct === null ? '—' : `${m.incidencia_pct} %`}</td>
                          <td>{m.validadas}</td>
                          <td>{m.lluvia_mm === null ? '—' : `${m.lluvia_mm.toLocaleString('es-PE')} mm`}</td>
                          <td>{m.dias_favorables === null ? '—' : `${m.dias_favorables} de ${m.dias_clima}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
