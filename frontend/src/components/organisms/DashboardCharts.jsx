import { useEffect, useRef, useState } from 'react';
import './DashboardCharts.css';

// Gráficos del tablero en SVG propio (sin librerías). Reglas: un solo eje por gráfico, barras <= 24px
// con extremo redondeado de 4px, separación de 2px entre segmentos, líneas de 2px, marcadores de 8px con
// anillo, cuadrícula fina, texto con colores de texto (nunca el color de la serie) y tooltip al pasar el
// mouse o al enfocar con el teclado. Los valores también están en la tabla del tablero.

const M = { top: 12, right: 12, bottom: 28, left: 40 };
const HEIGHT = 240;

/** Ancho real del contenedor, para que el texto del SVG no se escale. */
function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** Máximo «redondo» y marcas limpias del eje. */
function niceScale(max, ticks = 4) {
  if (!max || max <= 0) return { max: ticks, step: 1 };
  const raw = max / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw && (s >= 1 || mag < 1)) ?? 10 * mag;
  const s = Math.max(step, 1);
  return { max: Math.ceil(max / s) * s, step: s };
}

export const monthLabel = (ym, long = false) => {
  const [y, m] = ym.split('-').map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString('es-PE', long ? { month: 'long', year: 'numeric' } : { month: 'short', year: '2-digit' });
  return long ? s.charAt(0).toUpperCase() + s.slice(1) : s; // «Noviembre de 2026»
};

/** Indicador: etiqueta, valor y nota. */
export function StatTile({ label, value, note }) {
  return (
    <div className="dash-tile">
      <p className="dash-tile__label">{label}</p>
      <p className="dash-tile__value">{value}</p>
      {note && <p className="dash-tile__note">{note}</p>}
    </div>
  );
}

/** Leyenda: muestra del color (como la marca) + nombre en color de texto. */
export function Legend({ series, kind = 'rect' }) {
  return (
    <ul className="dash-legend">
      {series.map((s) => (
        <li key={s.key}>
          <span className={`dash-legend__key dash-legend__key--${kind}`} style={{ background: s.color }} aria-hidden="true" />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

function Tooltip({ tip }) {
  if (!tip) return null;
  return (
    <div className="dash-tip" style={{ left: tip.x, top: tip.y }} role="status">
      <p className="dash-tip__title">{tip.title}</p>
      {tip.rows.map((r) => (
        <p key={r.label} className="dash-tip__row">
          {r.color && <span className="dash-tip__key" style={{ background: r.color }} aria-hidden="true" />}
          <strong>{r.value}</strong> <span>{r.label}</span>
        </p>
      ))}
    </div>
  );
}

/** Eje Y con cuadrícula fina. */
function YAxis({ scale, width, y, format = (v) => v }) {
  const ticks = [];
  for (let v = 0; v <= scale.max + 1e-9; v += scale.step) ticks.push(v);
  return (
    <g className="dash-axis">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={M.left} x2={width - M.right} y1={y(v)} y2={y(v)} className="dash-grid" />
          <text x={M.left - 8} y={y(v)} dy="0.32em" textAnchor="end">
            {format(v)}
          </text>
        </g>
      ))}
    </g>
  );
}

function XLabels({ months, x, band }) {
  const every = Math.ceil(months.length / Math.max(1, Math.floor((band * months.length) / 56)));
  return (
    <g className="dash-axis">
      {months.map((m, i) =>
        i % every === 0 ? (
          <text key={m} x={x(i) + band / 2} y={HEIGHT - 8} textAnchor="middle">
            {monthLabel(m)}
          </text>
        ) : null,
      )}
    </g>
  );
}

/** Rectángulo con las dos esquinas superiores redondeadas (extremo de datos) y base recta. */
const topRounded = (x, y, w, h, r = 4) => {
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
};

/** Columnas apiladas por mes. `series` en el orden de apilado (de abajo hacia arriba). */
export function StackedColumns({ data, series, label }) {
  const [ref, width] = useWidth();
  const [tip, setTip] = useState(null);
  const innerW = Math.max(0, width - M.left - M.right);
  const band = data.length ? innerW / data.length : 0;
  const barW = Math.min(24, band * 0.6);
  const scale = niceScale(Math.max(0, ...data.map((d) => d.total)));
  const y = (v) => M.top + (HEIGHT - M.top - M.bottom) * (1 - v / scale.max);
  const x = (i) => M.left + i * band;

  const show = (d, i) => {
    const rows = [...series].reverse().map((s) => ({ label: s.label, value: d[s.key], color: s.color }));
    rows.push({ label: 'capturas en total', value: d.total });
    setTip({ title: monthLabel(d.mes, true), rows, x: Math.min(x(i) + band / 2, width - 120), y: y(d.total) - 8 });
  };

  return (
    <div className="dash-chart" ref={ref}>
      {width > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label={label}>
          <YAxis scale={scale} width={width} y={y} />
          {data.map((d, i) => {
            let acc = 0;
            const visible = series.filter((s) => d[s.key] > 0);
            return (
              <g key={d.mes}>
                {visible.map((s, k) => {
                  const y0 = y(acc);
                  acc += d[s.key];
                  const y1 = y(acc);
                  const h = Math.max(0, y0 - y1 - (k > 0 ? 2 : 0)); // 2px de separación con el segmento de abajo
                  const bx = x(i) + (band - barW) / 2;
                  return k === visible.length - 1 ? (
                    <path key={s.key} d={topRounded(bx, y1, barW, h)} fill={s.color} />
                  ) : (
                    <rect key={s.key} x={bx} y={y1} width={barW} height={h} fill={s.color} />
                  );
                })}
                <rect
                  className="dash-hit"
                  x={x(i)}
                  y={M.top}
                  width={band}
                  height={HEIGHT - M.top - M.bottom}
                  tabIndex={0}
                  aria-label={`${monthLabel(d.mes, true)}: ${d.total} capturas`}
                  onPointerEnter={() => show(d, i)}
                  onFocus={() => show(d, i)}
                  onPointerLeave={() => setTip(null)}
                  onBlur={() => setTip(null)}
                />
              </g>
            );
          })}
          <line x1={M.left} x2={width - M.right} y1={y(0)} y2={y(0)} className="dash-baseline" />
          <XLabels months={data.map((d) => d.mes)} x={x} band={band} />
        </svg>
      )}
      <Tooltip tip={tip} />
    </div>
  );
}

/** Línea de un porcentaje por mes (0–100 %). Los meses sin capturas cortan la línea. */
export function PercentLine({ data, valueKey, color, label }) {
  const [ref, width] = useWidth();
  const [tip, setTip] = useState(null);
  const innerW = Math.max(0, width - M.left - M.right);
  const band = data.length ? innerW / data.length : 0;
  const scale = { max: 100, step: 25 };
  const y = (v) => M.top + (HEIGHT - M.top - M.bottom) * (1 - v / scale.max);
  const x = (i) => M.left + i * band;
  const cx = (i) => x(i) + band / 2;

  // Tramos continuos entre meses con datos
  const segments = [];
  let cur = [];
  data.forEach((d, i) => {
    if (d[valueKey] === null) {
      if (cur.length) segments.push(cur);
      cur = [];
    } else cur.push([cx(i), y(d[valueKey])]);
  });
  if (cur.length) segments.push(cur);

  const show = (d, i) =>
    setTip({
      title: monthLabel(d.mes, true),
      rows:
        d[valueKey] === null
          ? [{ label: 'sin capturas', value: '—' }]
          : [
              { label: 'de incidencia', value: `${d[valueKey]} %`, color },
              { label: 'con antracnosis', value: `${d.antracnosis} de ${d.total}` },
            ],
      x: Math.min(cx(i), width - 120),
      y: d[valueKey] === null ? y(0) - 8 : y(d[valueKey]) - 12,
      cx: cx(i),
    });

  return (
    <div className="dash-chart" ref={ref}>
      {width > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label={label}>
          <YAxis scale={scale} width={width} y={y} format={(v) => `${v} %`} />
          <line x1={M.left} x2={width - M.right} y1={y(0)} y2={y(0)} className="dash-baseline" />
          {segments.map((pts) => (
            <polyline key={pts[0].join()} points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {data.map((d, i) =>
            d[valueKey] === null ? null : (
              <circle key={d.mes} cx={cx(i)} cy={y(d[valueKey])} r="4" fill={color} stroke="var(--color-surface)" strokeWidth="2" />
            ),
          )}
          {tip && <line className="dash-crosshair" x1={tip.cx} x2={tip.cx} y1={M.top} y2={y(0)} />}
          {data.map((d, i) => (
            <rect
              key={d.mes}
              className="dash-hit"
              x={x(i)}
              y={M.top}
              width={band}
              height={HEIGHT - M.top - M.bottom}
              tabIndex={0}
              aria-label={`${monthLabel(d.mes, true)}: ${d[valueKey] === null ? 'sin capturas' : `${d[valueKey]} % de incidencia`}`}
              onPointerEnter={() => show(d, i)}
              onFocus={() => show(d, i)}
              onPointerLeave={() => setTip(null)}
              onBlur={() => setTip(null)}
            />
          ))}
          <XLabels months={data.map((d) => d.mes)} x={x} band={band} />
        </svg>
      )}
      <Tooltip tip={tip} />
    </div>
  );
}

/** Barra segmentada alta (28px): un todo dividido en partes, con su % dentro si cabe. */
export function SegmentedBar({ parts, total, label }) {
  const [ref, width] = useWidth();
  const [tip, setTip] = useState(null);
  const shown = parts.filter((p) => p.value > 0);
  const gaps = Math.max(0, shown.length - 1) * 2;
  let acc = 0;
  return (
    <div className="dash-chart" ref={ref}>
      {width > 0 && total > 0 && (
        <svg width={width} height={28} role="img" aria-label={label}>
          {shown.map((p) => {
            const w = ((width - gaps) * p.value) / total;
            const x = acc;
            acc += w + 2;
            const pct = `${Math.round((100 * p.value) / total)} %`;
            const fits = w >= pct.length * 7.5 + 12;
            const show = () => setTip({ title: p.label, rows: [{ label: `de ${total} capturas (${pct})`, value: p.value, color: p.color }], x: Math.min(x + w / 2, width - 120), y: -6 });
            return (
              <g key={p.key}>
                <rect x={x} y={0} width={w} height={28} rx={4} fill={p.color} />
                {fits && (
                  <text x={x + 8} y={14} dy="0.35em" className="dash-seg__text" fill={p.ink}>
                    {pct}
                  </text>
                )}
                <rect
                  className="dash-hit"
                  x={x}
                  y={0}
                  width={w}
                  height={28}
                  tabIndex={0}
                  aria-label={`${p.label}: ${p.value} (${pct})`}
                  onPointerEnter={show}
                  onFocus={show}
                  onPointerLeave={() => setTip(null)}
                  onBlur={() => setTip(null)}
                />
              </g>
            );
          })}
        </svg>
      )}
      <Tooltip tip={tip} />
    </div>
  );
}
