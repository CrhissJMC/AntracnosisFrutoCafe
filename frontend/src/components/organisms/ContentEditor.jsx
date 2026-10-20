import { useState } from 'react';
import { Button, Icon, Input, Text, Textarea } from '../atoms';
import { Alert, ConfirmButton, FormField } from '../molecules';
import { useForm } from '../../hooks/useForm.js';
import './ContentEditor.css';

/** Formulario de un bloque de contenido (síntoma, servicio, integrante…). */
function ItemForm({ section, item, config, onSave, onCancel }) {
  const form = useForm(
    { title: item?.title ?? '', body: item?.body ?? '', position: item?.position ?? 0 },
    (v) => onSave({ section, title: v.title, body: v.body, position: Number(v.position) || 0 }),
  );
  return (
    <form className="content-item__form" onSubmit={form.handleSubmit} noValidate>
      <FormField label={config.titleLabel} error={form.errors.title}>
        <Input {...form.field('title')} required maxLength={200} autoFocus />
      </FormField>
      <FormField label={config.bodyLabel} error={form.errors.body} hint={config.bodyHint}>
        <Textarea {...form.field('body')} rows={config.multiline ? 5 : 3} maxLength={5000} />
      </FormField>
      <FormField label="Orden" error={form.errors.position} hint="Número menor = aparece primero.">
        <Input {...form.field('position')} type="number" min={0} inputMode="numeric" className="content-item__order" />
      </FormField>
      {form.formError && <Alert tone="error">{form.formError}</Alert>}
      <div className="content-item__actions">
        <Button type="submit" size="sm" loading={form.submitting}>
          <Icon name="check" size={15} /> Guardar
        </Button>
        <Button size="sm" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

/** Lista editable de los bloques de una sección. */
export function ContentEditor({ section, config, items, onCreate, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null); // id | 'new' | null
  const nextPosition = items.reduce((m, i) => Math.max(m, i.position), 0) + 1;

  return (
    <div className="content-editor">
      <ul className="content-editor__list">
        {items.map((item) => (
          <li key={item.id} className="content-item">
            {editing === item.id ? (
              <ItemForm
                section={section}
                item={item}
                config={config}
                onSave={async (d) => {
                  await onUpdate(item.id, d);
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="content-item__view">
                <span className="content-item__pos">{item.position}</span>
                <div className="content-item__text">
                  <p className="content-item__title">{item.title}</p>
                  <Text size="sm" className="content-item__body">
                    {item.body}
                  </Text>
                </div>
                <div className="content-item__actions">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(item.id)} aria-label={`Editar ${item.title}`}>
                    <Icon name="edit" size={15} /> Editar
                  </Button>
                  <ConfirmButton icon="trash" onConfirm={() => onDelete(item.id)} confirmText="¿Eliminar?" aria-label={`Eliminar ${item.title}`}>
                    <span className="visually-hidden">Eliminar</span>
                  </ConfirmButton>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {editing === 'new' ? (
        <div className="content-item content-item--new">
          <ItemForm
            section={section}
            item={{ position: nextPosition }}
            config={config}
            onSave={async (d) => {
              await onCreate(d);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setEditing('new')}>
          <Icon name="plus" size={16} /> Agregar {config.singular}
        </Button>
      )}
    </div>
  );
}
