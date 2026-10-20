import { useState } from 'react';
import { Text } from '../../components/atoms';
import { Alert } from '../../components/molecules';
import { ContentEditor } from '../../components/organisms';
import { AdminLayout } from '../../components/templates';
import { useSite } from '../../context/SiteContext.jsx';
import { api } from '../../lib/api.js';
import './AdminPages.css';

const SECTIONS = {
  sintomas: { label: 'Síntomas', page: 'Inicio', singular: 'síntoma', titleLabel: 'Nombre del síntoma', bodyLabel: 'Descripción' },
  ciclo: { label: 'Ciclo', page: 'Inicio', singular: 'etapa', titleLabel: 'Etapa', bodyLabel: 'Descripción' },
  manejo: {
    label: 'Manejo integrado',
    page: 'Inicio',
    singular: 'tipo de manejo',
    titleLabel: 'Tipo de manejo',
    bodyLabel: 'Prácticas',
    bodyHint: 'Una práctica por línea.',
    multiline: true,
  },
  mision: { label: 'Misión y visión', page: 'Nosotros', singular: 'bloque', titleLabel: 'Título', bodyLabel: 'Texto' },
  equipo: { label: 'Equipo', page: 'Nosotros', singular: 'integrante', titleLabel: 'Nombre completo', bodyLabel: 'Rol' },
  servicios: { label: 'Servicios', page: 'Servicios', singular: 'servicio', titleLabel: 'Servicio', bodyLabel: 'Descripción' },
};

export function ContentAdminPage() {
  const site = useSite();
  const [active, setActive] = useState('sintomas');
  const [error, setError] = useState('');
  const config = SECTIONS[active];

  const run = async (fn) => {
    setError('');
    try {
      await fn();
      await site.reload();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AdminLayout title="Contenido de páginas" description="Edita los bloques que aparecen en Inicio, Nosotros y Servicios.">
      <div className="admin-tabs" role="tablist" aria-label="Secciones">
        {Object.entries(SECTIONS).map(([key, s]) => (
          <button key={key} type="button" role="tab" aria-selected={active === key} className="admin-tab" onClick={() => setActive(key)}>
            {s.label}
          </button>
        ))}
      </div>
      <Text size="sm" className="admin-tabs__hint">
        Se muestra en la página <strong>{config.page}</strong>.
      </Text>
      {error && <Alert tone="error">{error}</Alert>}
      <ContentEditor
        key={active}
        section={active}
        config={config}
        items={site.section(active)}
        onCreate={(d) => run(() => api.post('/content', d))}
        onUpdate={(id, d) => run(() => api.put(`/content/${id}`, d))}
        onDelete={(id) => run(() => api.del(`/content/${id}`))}
      />
    </AdminLayout>
  );
}
