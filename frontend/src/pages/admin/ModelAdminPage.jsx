import { useState } from 'react';
import { Badge, Button, Icon, Spinner, Text, Textarea } from '../../components/atoms';
import { Alert } from '../../components/molecules';
import { AdminLayout } from '../../components/templates';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatDate, formatDateTime } from '../../lib/format.js';
import { MODEL_NAMES } from '../../lib/modulo.js';
import './ModelAdminPage.css';

const pct = (v) => (v === null || v === undefined ? '—' : `${Math.round(Number(v) * 1000) / 10} %`);
const num = (v) => (v === null || v === undefined ? '—' : Number(v).toFixed(3).replace(/\.?0+$/, ''));

/** Modelo de diagnóstico (RF09, RNF08): versiones con sus métricas, versión activa y conjunto para reentrenar. */
export function ModelAdminPage() {
  const { data, error, loading, reload } = useAsync(() => api.get('/admin/modelos'), []);
  const [actionError, setActionError] = useState('');

  const activate = async (v) => {
    setActionError('');
    try {
      await api.patch(`/admin/modelos/${v.id}`, { activo: true });
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <AdminLayout
      title="Modelo de diagnóstico"
      description="Versiones de cada modelo con sus umbrales y métricas, la versión activa y las fotos validadas para volver a entrenar."
    >
      {(error || actionError) && <Alert tone="error">{actionError || error.message}</Alert>}
      {loading && !data && <Spinner label="Cargando" />}
      {data && (
        <div className="mdl">
          <ServiceCard service={data.servicio} versions={data.versiones} />
          {Object.keys(MODEL_NAMES).map((m) => (
            <VersionsCard key={m} model={m} versions={data.versiones.filter((v) => v.modelo === m)} onActivate={activate} onSaved={reload} />
          ))}
          <RetrainCard dataset={data.reentrenamiento} />
        </div>
      )}
    </AdminLayout>
  );
}

function ServiceCard({ service, versions }) {
  return (
    <section className="mdl-card">
      <div className="mdl-card__head">
        <h2 className="mdl-card__title">Servicio de los modelos</h2>
        {service.activo ? <Badge tone="success">Encendido</Badge> : <Badge tone="warning">Apagado</Badge>}
      </div>
      {!service.activo && (
        <Text size="sm">Enciéndelo con <code>docker compose --profile ml up -d</code>. Mientras esté apagado, «Nuevo diagnóstico» no analiza fotos.</Text>
      )}
      <ul className="mdl-service">
        {service.modelos.map((m) => {
          const active = versions.find((v) => v.modelo === m.modelo && v.activo);
          const mismatch = service.activo && m.cargado && active && active.version !== m.version;
          return (
            <li key={m.modelo}>
              <strong>{m.nombre}</strong>
              <span>
                Cargado: {m.cargado ? <code>{m.version}</code> : 'no disponible'} · Activa en el sistema: {active ? <code>{active.version}</code> : '—'}
              </span>
              {mismatch && (
                <Alert tone="warning">
                  El servicio tiene cargada otra versión. Copia el archivo de la versión activa en <code>ml/modelos/</code> o marca como activa la que está cargada.
                </Alert>
              )}
            </li>
          );
        })}
      </ul>
      <Text size="sm">
        El servicio usa el archivo <code>.keras</code> y los umbrales de su <code>.json</code> que estén en <code>ml/modelos/</code>; una versión nueva se
        registra aquí sola con su primer diagnóstico. Marcar una versión como activa indica cuál es la vigente para el equipo y los reportes.
      </Text>
    </section>
  );
}

function VersionsCard({ model, versions, onActivate, onSaved }) {
  return (
    <section className="mdl-card">
      <h2 className="mdl-card__title">{MODEL_NAMES[model]}</h2>
      {versions.length === 0 ? (
        <Text size="sm">Todavía no hay versiones registradas.</Text>
      ) : (
        <div className="mdl-table-wrap">
          <table className="mdl-table">
            <thead>
              <tr>
                <th scope="col">Versión</th>
                <th scope="col">Umbrales</th>
                <th scope="col">AUC</th>
                <th scope="col">Recall</th>
                <th scope="col">Precisión</th>
                <th scope="col">F1</th>
                <th scope="col">Imágenes</th>
                <th scope="col">Entrenada</th>
                <th scope="col">Diagnósticos</th>
                <th scope="col">
                  <span className="visually-hidden">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <VersionRow key={v.id} v={v} onActivate={onActivate} onSaved={onSaved} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Text size="sm">Métricas en el conjunto de prueba, clase antracnosis. «Recall» debe ser al menos 85 % (RNF01).</Text>
    </section>
  );
}

function VersionRow({ v, onActivate, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(v.notas);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/modelos/${v.id}`, { notas: notes });
      setEditing(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <tr>
        <th scope="row">
          <code>{v.version}</code> {v.activo && <Badge tone="success">Activa</Badge>}
        </th>
        <td>
          {num(v.umbral_inferior)} / {num(v.umbral_superior)}
        </td>
        <td>{num(v.auc)}</td>
        <td className={v.recall_antracnosis !== null && Number(v.recall_antracnosis) < 0.85 ? 'mdl-low' : undefined}>{pct(v.recall_antracnosis)}</td>
        <td>{pct(v.precision_antracnosis)}</td>
        <td>{pct(v.f1_antracnosis)}</td>
        <td>{v.num_imagenes ?? '—'}</td>
        <td>{v.entrenado_en ? formatDate(v.entrenado_en) : '—'}</td>
        <td title={v.ultimo_uso ? `Último: ${formatDateTime(v.ultimo_uso)}` : undefined}>{v.diagnosticos}</td>
        <td className="mdl-actions">
          {!v.activo && (
            <Button size="sm" variant="outline" onClick={() => onActivate(v)}>
              Marcar activa
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setEditing((e) => !e)} aria-expanded={editing}>
            <Icon name="edit" size={14} /> Notas
          </Button>
        </td>
      </tr>
      <tr className="mdl-notes">
        <td colSpan={10}>
          {editing ? (
            <div className="mdl-notes__edit">
              <Textarea rows={2} value={notes} maxLength={1000} onChange={(e) => setNotes(e.target.value)} aria-label={`Notas de ${v.version}`} />
              <Button size="sm" onClick={save} loading={saving}>
                Guardar
              </Button>
            </div>
          ) : (
            <Text size="sm">{v.notas || 'Sin notas.'}</Text>
          )}
        </td>
      </tr>
    </>
  );
}

function RetrainCard({ dataset }) {
  const total = dataset.sano + dataset.antracnosis;
  return (
    <section className="mdl-card">
      <h2 className="mdl-card__title">Conjunto para reentrenar</h2>
      <Text size="sm">
        Fotos de capturas cuya validación vigente es «sano» o «antracnosis» (RF09). Las marcadas como «otro daño» no se incluyen.
      </Text>
      <ul className="mdl-counts">
        <li>
          <strong>{dataset.sano}</strong> sano
        </li>
        <li>
          <strong>{dataset.antracnosis}</strong> antracnosis
        </li>
        <li>
          <strong>{dataset.otro_dano}</strong> otro daño (excluidas)
        </li>
      </ul>
      {total > 0 ? (
        <div>
          {/* Enlace normal: el navegador descarga el archivo con la sesión */}
          <a className="btn btn--primary btn--sm" href="/api/admin/modelos/reentrenamiento" download>
            <Icon name="upload" size={16} /> Descargar ZIP ({total} {total === 1 ? 'foto' : 'fotos'})
          </a>
        </div>
      ) : (
        <Text size="sm">Todavía no hay fotos validadas.</Text>
      )}
      <Text size="sm">
        El ZIP trae las carpetas <code>sano/</code> y <code>antracnosis/</code> y un <code>manifiesto.csv</code>. Se entrenan con{' '}
        <code>ml/entrenamiento/entrenar.py</code> (ver <code>ml/README.md</code>).
      </Text>
    </section>
  );
}
