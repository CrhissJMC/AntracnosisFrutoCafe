import { useState } from 'react';
import { Button, Heading, Icon, Spinner, Text } from '../../components/atoms';
import { Alert, ConfirmButton, RequirementStatusSelect } from '../../components/molecules';
import { ObjectiveEditor, ProgressNoteForm, ProgressTimeline, RequirementMatrix, TraceabilitySummary } from '../../components/organisms';
import { AdminLayout } from '../../components/templates';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import './AdminPages.css';
import './TraceabilityAdminPage.css';

/** Página del panel = plantilla AdminLayout + organismos de trazabilidad + llamadas a la API. */
export function TraceabilityAdminPage() {
  const state = useAsync(() => api.get('/traceability'), []);
  const [error, setError] = useState('');
  const d = state.data;

  const save = async (id, body) => state.setData(await api.patch(`/traceability/objectives/${id}`, body));
  const addNote = async (body) => state.setData(await api.post('/traceability/log', body));
  const setRequirementStatus = async (id, status) => {
    setError('');
    try {
      state.setData(await api.patch(`/traceability/requirements/${id}`, { status }));
    } catch (err) {
      setError(err.message);
    }
  };
  const remove = async (id) => {
    setError('');
    try {
      await api.del(`/traceability/log/${id}`);
      state.setData((s) => ({ ...s, log: s.log.filter((e) => e.id !== id) }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AdminLayout
      title="Trazabilidad"
      wide
      description="Actualiza el avance de cada objetivo. Cada cambio de % se registra automáticamente en la bitácora pública."
      actions={
        <Button to="/trazabilidad" variant="secondary">
          <Icon name="eye" size={16} /> Ver página
        </Button>
      }
    >
      {state.loading && !d && <Spinner size={24} />}
      {state.error && <Alert tone="error">No se pudo cargar la trazabilidad.</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      {d && (
        <div className="traz-admin">
          <div className="traz-admin__layout">
            <div className="traz-admin__main">
              <section className="admin-card">
                <TraceabilitySummary total={d.total} objectives={d.objectives} />
              </section>

              <div className="traz-admin__objectives">
                {d.objectives.map((o) => (
                  <section key={o.id} className="admin-card">
                    <ObjectiveEditor objective={o} onSave={save} />
                  </section>
                ))}
              </div>

              <section className="admin-card">
                <Heading as="h2" size="md" className="traz-admin__h">
                  Agregar nota sin cambiar el avance
                </Heading>
                <ProgressNoteForm objectives={d.objectives} onAdd={addNote} />
              </section>

              <section className="admin-card">
                <Heading as="h2" size="md" className="traz-admin__h">
                  Matriz de trazabilidad de requisitos
                </Heading>
                <Text size="sm" className="traz-admin__hint">
                  Al cambiar el estado de un requisito, el cambio queda registrado en la bitácora del objetivo al que pertenece.
                </Text>
                <RequirementMatrix
                  requirements={d.requirements ?? []}
                  renderStatus={(r) => <RequirementStatusSelect requirement={r} onChange={setRequirementStatus} />}
                />
              </section>
            </div>

            <aside className="admin-card traz-admin__log">
              <Heading as="h2" size="md" className="traz-admin__h">
                Bitácora
              </Heading>
              <Text size="sm" className="traz-admin__hint">
                Borrar un registro no revierte el %; úsalo solo para corregir errores.
              </Text>
              <ProgressTimeline
                log={d.log}
                initial={15}
                renderActions={(e) => (
                  <ConfirmButton onConfirm={() => remove(e.id)} confirmText="¿Borrar?" icon="trash" variant="ghost" size="sm" aria-label="Borrar registro">
                    Borrar
                  </ConfirmButton>
                )}
              />
            </aside>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
