import { useState } from 'react';
import { Button, Heading, Input, Textarea } from '../../components/atoms';
import { Alert, FormField } from '../../components/molecules';
import { AdminLayout } from '../../components/templates';
import { useSite } from '../../context/SiteContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { api } from '../../lib/api.js';
import './AdminPages.css';

const GROUPS = [
  {
    title: 'General',
    fields: [
      ['site_name', 'Nombre del sitio'],
      ['footer_tagline', 'Descripción en el pie de página', 'area'],
      ['footer_note', 'Nota legal del pie de página'],
    ],
  },
  {
    title: 'Inicio',
    fields: [
      ['hero_label', 'Etiqueta superior'],
      ['hero_title', 'Título principal'],
      ['hero_desc', 'Descripción', 'area'],
      ['hero_image', 'Imagen de fondo (URL)'],
      ['que_es', '“¿Qué es?” (*cursiva* permitida, párrafos separados por línea en blanco)', 'area'],
    ],
  },
  {
    title: 'Nosotros y servicios',
    fields: [
      ['nosotros_title', 'Título de Nosotros'],
      ['nosotros_desc', 'Descripción de Nosotros', 'area'],
      ['docente', 'Docente asesor'],
      ['servicios_title', 'Título de Servicios'],
      ['servicios_desc', 'Descripción de Servicios', 'area'],
    ],
  },
  {
    title: 'Trazabilidad',
    fields: [
      ['traz_title', 'Título de la página'],
      ['traz_desc', 'Descripción', 'area'],
      ['traz_general', 'Objetivo general del proyecto', 'area'],
    ],
  },
  {
    title: 'Blog',
    fields: [
      ['blog_label', 'Etiqueta superior'],
      ['blog_title', 'Título'],
      ['blog_desc', 'Descripción', 'area'],
    ],
  },
  {
    title: 'Contacto',
    fields: [
      ['contact_email', 'Correo'],
      ['contact_location', 'Ubicación'],
      ['contact_hours', 'Horario de atención'],
    ],
  },
];

function SettingsForm({ initial, onSaved }) {
  const [saved, setSaved] = useState(false);
  const form = useForm(initial, async (values) => {
    await api.put('/settings', values);
    await onSaved();
    setSaved(true);
  });

  return (
    <form onSubmit={form.handleSubmit} className="settings-form" noValidate>
      {GROUPS.map((g) => (
        <fieldset key={g.title} className="admin-card settings-form__group">
          <Heading as="legend" size="md">
            {g.title}
          </Heading>
          {g.fields.map(([key, label, type]) => (
            <FormField key={key} label={label} error={form.errors[key]}>
              {type === 'area' ? <Textarea {...form.field(key)} rows={3} maxLength={5000} /> : <Input {...form.field(key)} maxLength={5000} />}
            </FormField>
          ))}
        </fieldset>
      ))}
      <div className="settings-form__bar">
        {form.formError && <Alert tone="error">{form.formError}</Alert>}
        {saved && (
          <Alert tone="success" onClose={() => setSaved(false)}>
            Textos actualizados.
          </Alert>
        )}
        <Button type="submit" loading={form.submitting}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}

export function SettingsAdminPage() {
  const site = useSite();
  return (
    <AdminLayout title="Textos del sitio" description="Títulos, descripciones y datos de contacto que aparecen en las páginas públicas.">
      {site.status === 'ready' ? <SettingsForm initial={site.settings} onSaved={site.reload} /> : null}
      {site.status === 'error' && <Alert tone="error">No se pudieron cargar los textos.</Alert>}
    </AdminLayout>
  );
}
