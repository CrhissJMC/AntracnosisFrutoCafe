// Datos compartidos de la trazabilidad: etapas del ciclo del café, colores y fases SECI.

/** 20 etapas, cada una = 5 % del avance. Cada tramo de 5 etapas corresponde a un objetivo. */
export const STAGES = [
  { type: 'bud', size: 0.72, color: '#d9e3b4', name: 'Botón floral' },
  { type: 'bud', size: 0.82, color: '#dde6bd', name: 'Botón en desarrollo' },
  { type: 'bud', size: 0.92, color: '#e4ebcb', name: 'Botón maduro' },
  { type: 'flower', size: 0.9, color: '#ffffff', name: 'Floración' },
  { type: 'flower', size: 1, color: '#ffffff', name: 'Flor plena' },
  { type: 'cherry', size: 0.82, color: '#6f9a35', name: 'Fruto verde' },
  { type: 'cherry', size: 0.9, color: '#82a83c', name: 'Fruto en crecimiento' },
  { type: 'cherry', size: 0.95, color: '#9db443', name: 'Fruto verde-amarillo' },
  { type: 'cherry', size: 1, color: '#c2b33a', name: 'Fruto pintón' },
  { type: 'cherry', size: 1, color: '#dfa233', name: 'Cambio de color' },
  { type: 'cherry', size: 1, color: '#e0782f', name: 'Fruto anaranjado' },
  { type: 'cherry', size: 1, color: '#d24f2b', name: 'Maduración' },
  { type: 'cherry', size: 1.04, color: '#c0302a', name: 'Cereza madura' },
  { type: 'cherry', size: 1.08, color: '#a6231f', name: 'Cereza en su punto' },
  { type: 'open', size: 1.08, color: '#b3261e', name: 'Cereza despulpada' },
  { type: 'bean', size: 0.95, color: '#dacb9e', name: 'Grano en pergamino' },
  { type: 'bean', size: 0.95, color: '#b4c196', name: 'Café verde' },
  { type: 'bean', size: 0.95, color: '#b07a45', name: 'Tostado claro' },
  { type: 'bean', size: 0.95, color: '#7a4a26', name: 'Tostado medio' },
  { type: 'bean', size: 0.95, color: '#3e2617', name: 'Tostado oscuro' },
];

export const STAGE_PERCENT = 100 / STAGES.length;

/** Color de cada objetivo (por código): floración, fruto verde, cereza madura, grano tostado. */
const OBJECTIVE_COLORS = ['#8fae4e', '#c2a336', '#b8322a', '#6e4524'];
export const objectiveColor = (code) => OBJECTIVE_COLORS[(code - 1) % OBJECTIVE_COLORS.length];

/** Tramo del ciclo que representa cada objetivo (con pesos iguales). */
export const PHASES = [
  { code: 1, stages: '1–5', name: 'Floración' },
  { code: 2, stages: '6–10', name: 'Fruto verde' },
  { code: 3, stages: '11–15', name: 'Maduración' },
  { code: 4, stages: '16–20', name: 'Grano y tostado' },
];

/** Etapas completas y etapa en curso para un % total. */
export function stageState(total) {
  const t = Math.max(0, Math.min(100, Number(total) || 0));
  const done = Math.min(STAGES.length, Math.floor(t / STAGE_PERCENT + 1e-9));
  const current = done < STAGES.length ? done : null;
  return { done, current, total: t };
}

export const SECI = {
  socializacion: { label: 'Socialización', hint: 'Tácito → tácito: intercambio de experiencias' },
  externalizacion: { label: 'Externalización', hint: 'Tácito → explícito: documentar criterios' },
  combinacion: { label: 'Combinación', hint: 'Explícito → explícito: integrar datos y resultados' },
  internalizacion: { label: 'Internalización', hint: 'Explícito → tácito: aprender de los resultados' },
};
