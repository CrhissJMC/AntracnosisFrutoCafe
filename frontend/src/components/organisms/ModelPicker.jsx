import { ModelOption } from '../molecules';
import './ModelPicker.css';

export const COMPARE = 'ambos';

/** Selector del modelo: siempre visible, con EfficientNet-B0 por defecto y la opción de comparar ambos. */
export function ModelPicker({ models, value, onChange, legend = 'Modelo de análisis' }) {
  const pending = (m) => (m.available ? null : 'Aún no entrenado');
  return (
    <fieldset className="model-picker">
      <legend className="model-picker__legend">{legend}</legend>
      {models.map((m) => (
        <ModelOption
          key={m.id}
          name="model"
          value={m.id}
          checked={value === m.id}
          onChange={onChange}
          title={m.name}
          description={m.description}
          badge={m.recommended ? 'Recomendado' : undefined}
          note={pending(m)}
        />
      ))}
      <ModelOption
        name="model"
        value={COMPARE}
        checked={value === COMPARE}
        onChange={onChange}
        title="Comparar ambos"
        description="Analiza la misma foto con los dos modelos y muestra los resultados lado a lado"
        icon="columns"
        note={models.some((m) => !m.available) ? 'Requiere los dos modelos entrenados' : undefined}
      />
    </fieldset>
  );
}
