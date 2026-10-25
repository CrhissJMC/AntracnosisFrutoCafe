import { CycleStage } from '../atoms';
import { STAGES, objectiveColor, stageState } from '../../lib/traceability.js';
import './CoffeeCycleRing.css';

const SIZE = 420;
const C = SIZE / 2;
const R_STAGE = 140; // radio donde se ubican las etapas
const R_ARC = 194; // radio del anillo exterior por objetivo
const GAP_DEG = 4;
const STAGE_SCALE = 1.45; // tamaño de las figuras respecto a su dibujo base

const polar = (deg, r) => {
  const rad = (deg * Math.PI) / 180;
  return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
};

function arcPath(startDeg, endDeg, r) {
  const [x1, y1] = polar(startDeg, r);
  const [x2, y2] = polar(endDeg, r);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/**
 * Anillo del ciclo del café: 20 etapas (5 % cada una) que se colorean según el avance total,
 * y un anillo exterior con el avance de cada objetivo (proporcional a su peso).
 */
export function CoffeeCycleRing({ total = 0, objectives = [], compact = false, caption }) {
  const { done, current } = stageState(total);
  const weightSum = objectives.reduce((s, o) => s + o.weight, 0);
  const label =
    current === null ? 'Proyecto completado' : `Etapa ${current + 1} de ${STAGES.length} · ${STAGES[current].name}`;

  let cursor = -90;
  const arcs =
    weightSum > 0
      ? objectives
          .filter((o) => o.weight > 0)
          .map((o) => {
            const span = (360 * o.weight) / weightSum;
            const start = cursor + GAP_DEG / 2;
            const end = cursor + span - GAP_DEG / 2;
            cursor += span;
            const fillEnd = start + ((end - start) * o.progress) / 100;
            return { o, start, end, fillEnd };
          })
      : [];

  return (
    <figure className={`coffee-ring ${compact ? 'coffee-ring--compact' : ''}`}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Avance total del proyecto: ${total} %. ${label}.`}>
        {/* Anillo exterior: un arco por objetivo */}
        {arcs.map(({ o, start, end, fillEnd }) => (
          <g key={o.id}>
            <path d={arcPath(start, end, R_ARC)} className="coffee-ring__track" />
            {o.progress > 0 && (
              <path d={arcPath(start, Math.max(fillEnd, start + 0.5), R_ARC)} className="coffee-ring__arc" stroke={objectiveColor(o.code)} />
            )}
            <title>{`Objetivo ${o.code}: ${o.progress} %`}</title>
          </g>
        ))}

        {/* Etapas del ciclo */}
        {STAGES.map((st, i) => {
          const deg = -90 + (i + 0.5) * (360 / STAGES.length);
          const [x, y] = polar(deg, R_STAGE);
          const state = i < done ? 'on' : i === current ? 'current' : 'off';
          return (
            <g key={i} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(deg + 90).toFixed(2)}) scale(${STAGE_SCALE})`}>
              {state === 'current' && <circle r="21" className="coffee-ring__halo" />}
              <g className={`coffee-ring__stage coffee-ring__stage--${state}`} style={{ '--i': i }}>
                <CycleStage type={st.type} size={st.size} color={st.color} />
              </g>
              <title>{`${i + 1}. ${st.name} (${(i + 1) * 5} %)`}</title>
            </g>
          );
        })}

        {/* Centro */}
        <text x={C} y={C - (compact ? 22 : 14)} className="coffee-ring__value" textAnchor="middle" dominantBaseline="middle">
          {total}
          <tspan className="coffee-ring__unit" dx="4">
            %
          </tspan>
        </text>
        <text x={C} y={C + (compact ? 52 : 34)} className="coffee-ring__label" textAnchor="middle">
          avance total
        </text>
        {!compact && (
          <text x={C} y={C + 60} className="coffee-ring__stage-name" textAnchor="middle">
            {label}
          </text>
        )}
      </svg>
      {caption && <figcaption className="coffee-ring__caption">{caption}</figcaption>}
    </figure>
  );
}
