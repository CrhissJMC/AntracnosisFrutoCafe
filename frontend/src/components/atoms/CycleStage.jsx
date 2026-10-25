// Figuras SVG de una etapa del ciclo del café. Se dibujan "mirando hacia afuera"
// (el tallo hacia -y), centradas en (0, 0); quien las usa las ubica y rota.

function Bud({ s, color }) {
  return (
    <>
      <path d={`M0 ${-9 * s} L0 ${-20 * s}`} stroke="#6f8f3a" strokeWidth={2.6 * s} strokeLinecap="round" />
      <ellipse cx="0" cy="0" rx={5.6 * s} ry={11.5 * s} fill={color} stroke="#aebd7c" strokeWidth="1" />
      <path d={`M${-5 * s} ${-7 * s} L0 ${-13 * s} L${5 * s} ${-7 * s}Z`} fill="#7d9c42" />
    </>
  );
}

function Flower({ s }) {
  return (
    <>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-8.5 * s} rx={5.8 * s} ry={10.5 * s} fill="#fff" stroke="#e3dccb" strokeWidth="1" transform={`rotate(${a})`} />
      ))}
      <circle r={3.6 * s} fill="#ece2a6" />
    </>
  );
}

function Cherry({ s, color }) {
  return (
    <>
      <path d={`M0 ${-11 * s} L0 ${-22 * s}`} stroke="#6f8f3a" strokeWidth={3 * s} strokeLinecap="round" />
      <circle r={13 * s} fill={color} />
      <circle cy={-11 * s} r={2.6 * s} fill="#55702c" />
      <ellipse cx={-4.5 * s} cy={-4 * s} rx={3.8 * s} ry={2.3 * s} fill="#fff" opacity="0.38" transform="rotate(-25)" />
    </>
  );
}

function OpenCherry({ s }) {
  return (
    <>
      <circle r={14 * s} fill="#b3261e" stroke="#8a1b15" strokeWidth="1" />
      <ellipse rx={9.5 * s} ry={10.5 * s} fill="#f0c6b4" />
      {[-1, 1].map((d) => (
        <ellipse key={d} cx={d * 4.4 * s} rx={4.1 * s} ry={7.8 * s} fill="#bfcc9b" stroke="#8fa16a" strokeWidth="0.9" />
      ))}
    </>
  );
}

function Bean({ s, color }) {
  return (
    <>
      <ellipse rx={10 * s} ry={14 * s} fill={color} stroke="rgba(0,0,0,0.22)" strokeWidth="1" />
      <path
        d={`M0 ${-11 * s} C ${3.5 * s} ${-5 * s} ${-3.5 * s} ${5 * s} 0 ${11 * s}`}
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={1.7 * s}
        strokeLinecap="round"
      />
    </>
  );
}

const SHAPES = { bud: Bud, flower: Flower, cherry: Cherry, open: OpenCherry, bean: Bean };

/** Átomo SVG: una etapa del ciclo. type: bud | flower | cherry | open | bean */
export function CycleStage({ type, size = 1, color }) {
  const Shape = SHAPES[type];
  return Shape ? <Shape s={size} color={color} /> : null;
}
