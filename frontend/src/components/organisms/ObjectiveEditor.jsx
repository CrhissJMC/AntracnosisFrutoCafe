import { useState } from 'react';
import { Button, Heading, Icon, Input, NumberBadge, ProgressBar, Range, Textarea } from '../atoms';
import { Alert, FormActions, FormField, SeciSelect } from '../molecules';
import { useForm } from '../../hooks/useForm.js';
import { objectiveColor } from '../../lib/traceability.js';
import './ObjectiveEditor.css';

const clamp = (v) => Math.max(0, Math.min(100, Number(v) || 0));

/** Formulario de un objetivo: avance, nota y fase SECI; título, descripción y peso en un desplegable. */
export function ObjectiveEditor({ objective: o, onSave }) {
  const color = objectiveColor(o.code);
  const [success, setSuccess] = useState('');
  const form = useForm(
    { progress: o.progress, weight: o.weight, title: o.title, description: o.description, note: '', seci_phase: '' },
    async (v) => {
      setSuccess('');
      const progress = clamp(v.progress);
      await onSave(o.id, { ...v, progress, weight: Number(v.weight) });
      form.setValues((s) => ({ ...s, note: '', seci_phase: '' }));
      setSuccess(progress !== o.progress ? `Avance guardado: ${o.progress} % → ${progress} %. Quedó en la bitácora.` : 'Cambios guardados.');
    },
  );
  const { values: v, errors: e, field: f } = form;

  const progress = clamp(v.progress);
  const changed = progress !== o.progress;
  const dirty =
    changed || Number(v.weight) !== o.weight || v.title.trim() !== o.title || v.description.trim() !== o.description || Boolean(v.note.trim());

  return (
    <form className="obj-editor" onSubmit={form.handleSubmit}>
      <div className="obj-editor__head">
        <NumberBadge color={color}>{o.code}</NumberBadge>
        <Heading as="h3" size="sm" serif={false} className="obj-editor__title">
          {o.title}
        </Heading>
        <span className="obj-editor__now">Actual: {o.progress} %</span>
      </div>

      <div className="obj-editor__progress">
        <Range {...f('progress')} value={progress} min={0} max={100} step={5} color={color} aria-label={`Avance del objetivo ${o.code}`} />
        <FormField label="Avance %" error={e.progress} className="obj-editor__num">
          <Input {...f('progress')} type="number" min={0} max={100} inputMode="numeric" />
        </FormField>
      </div>
      <ProgressBar value={progress} color={color} label={`Vista previa del avance del objetivo ${o.code}`} />

      <div className="obj-editor__row">
        <FormField label={changed ? '¿Qué se avanzó?' : 'Nota (opcional)'} hint="Se guarda en la bitácora." error={e.note}>
          <Textarea {...f('note')} rows={2} maxLength={2000} placeholder="Ej.: se completó la partición entrenamiento/validación/prueba" />
        </FormField>
        <FormField label="Fase SECI" optional>
          <SeciSelect {...f('seci_phase')} />
        </FormField>
      </div>

      <details className="obj-editor__more">
        <summary>Editar título, descripción y peso</summary>
        <div className="obj-editor__more-body">
          <FormField label="Título" error={e.title}>
            <Input {...f('title')} maxLength={200} required />
          </FormField>
          <FormField label="Descripción" optional>
            <Textarea {...f('description')} rows={3} maxLength={2000} />
          </FormField>
          <FormField label="Peso en el avance total (%)" hint="Si todos tienen el mismo peso, cada objetivo vale lo mismo." error={e.weight}>
            <Input {...f('weight')} type="number" min={0} max={100} />
          </FormField>
        </div>
      </details>

      <FormActions>
        {form.formError ? <Alert tone="error">{form.formError}</Alert> : success && <Alert tone="success">{success}</Alert>}
        <Button type="submit" loading={form.submitting} disabled={!dirty}>
          <Icon name="check" size={16} /> Guardar
        </Button>
      </FormActions>
    </form>
  );
}
