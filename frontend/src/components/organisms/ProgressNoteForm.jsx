import { useState } from 'react';
import { Button, Icon, Select, Textarea } from '../atoms';
import { Alert, FormActions, FormField, SeciSelect } from '../molecules';
import { useForm } from '../../hooks/useForm.js';
import './ProgressNoteForm.css';

const EMPTY = { objective_id: '', note: '', seci_phase: '' };

/** Formulario para agregar una nota a la bitácora sin cambiar el avance. */
export function ProgressNoteForm({ objectives, onAdd }) {
  const [success, setSuccess] = useState('');
  const form = useForm(EMPTY, async (v) => {
    setSuccess('');
    await onAdd(v);
    form.setValues(EMPTY);
    setSuccess('Nota agregada a la bitácora.');
  });
  const { values: v, errors: e, field: f } = form;

  return (
    <form className="note-form" onSubmit={form.handleSubmit}>
      <div className="note-form__row">
        <FormField label="Relacionada con">
          <Select {...f('objective_id')}>
            <option value="">General (todo el proyecto)</option>
            {objectives.map((o) => (
              <option key={o.id} value={o.id}>
                Objetivo {o.code}: {o.title}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Fase SECI" optional>
          <SeciSelect {...f('seci_phase')} />
        </FormField>
      </div>
      <FormField label="Nota" error={e.note}>
        <Textarea {...f('note')} rows={2} maxLength={2000} required placeholder="Ej.: reunión con el docente para revisar los criterios de etiquetado" />
      </FormField>
      <FormActions>
        {form.formError ? <Alert tone="error">{form.formError}</Alert> : success && <Alert tone="success">{success}</Alert>}
        <Button type="submit" variant="secondary" loading={form.submitting} disabled={!v.note.trim()}>
          <Icon name="plus" size={16} /> Agregar nota
        </Button>
      </FormActions>
    </form>
  );
}
