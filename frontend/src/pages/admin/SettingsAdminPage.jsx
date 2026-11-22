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
    title: 'Nosotros',
    fields: [
      ['nosotros_title', 'Título de Nosotros'],
      ['nosotros_desc', 'Descripción de Nosotros', 'area'],
      ['docente', 'Docente asesor'],
      ['univ_title', 'Nombre de la universidad'],
      ['univ_desc', 'Presentación de la universidad', 'area'],
    ],
  },
  {
    title: 'Metodología',
    fields: [
      ['metodo_title', 'Título de la página'],
      ['metodo_desc', 'Descripción', 'area'],
      ['metodo_propuesta', 'Propuesta (sección El problema)', 'area'],
      ['metodo_flujo_nota', 'Nota de partición de datos (Arquitectura)', 'area'],
      ['metodo_metricas_nota', 'Meta del proyecto (Evaluación)', 'area'],
      ['metodo_repo_title', 'Título del recuadro del repositorio'],
      ['metodo_repo_text', 'Texto del recuadro del repositorio', 'area'],
      ['metodo_repo_url', 'Enlace al repositorio (https://…)'],
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
    title: 'Clima y riesgo de antracnosis',
    note: 'Datos de Open-Meteo (gratuitos, sin sensores) para estas coordenadas. Usa las de la finca: se ven en Google Maps con clic derecho. Solo se envían las coordenadas, nunca datos de los usuarios.',
    fields: [
      ['clima_nombre', 'Nombre de la ubicación'],
      ['clima_lat', 'Latitud (p. ej., -5.9069)'],
      ['clima_lon', 'Longitud (p. ej., -78.0431)'],
      ['riesgo_temp_min', 'Día favorable: temperatura media mínima (°C)'],
      ['riesgo_temp_max', 'Día favorable: temperatura media máxima (°C)'],
      ['riesgo_lluvia_mm', 'Día favorable: lluvia de al menos (mm)'],
      ['riesgo_hr', 'Día favorable: o humedad relativa media de al menos (%)'],
      ['riesgo_dias_medio', 'Riesgo medio desde (días favorables de 7)'],
      ['riesgo_dias_alto', 'Riesgo alto desde (días favorables de 7)'],
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
          {g.note && <p className="settings-form__note">{g.note}</p>}
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
