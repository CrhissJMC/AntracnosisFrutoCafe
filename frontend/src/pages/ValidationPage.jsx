import { useEffect, useState } from 'react';
import { Badge, Button, Icon, Spinner, Text, Textarea } from '../components/atoms';
import { Alert, Callout, EmptyState, HealthLight, ImageFrame } from '../components/molecules';
import { ModuleTabs, PageHero, Section } from '../components/organisms';
import { MainLayout } from '../components/templates';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../lib/api.js';
import { healthClass } from '../lib/diagnosis.js';
import { formatDateTime } from '../lib/format.js';
import {
  canValidate,
  MODEL_NAMES,
  VALIDATION_CLASSES,
  validationLabel,
  validatorLabel,
  validatorProfile,
} from '../lib/modulo.js';
import './ValidationPage.css';

const FILTERS = [
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'validados', label: 'Validados' },
  { id: 'todos', label: 'Todos' },
];

const imageUrl = (id) => `/api/diagnostico/capturas/${id}/imagen`;
const pct = (p) => `${Math.round(Number(p) * 100)} %`;
const classTone = (c) => (c === 'antracnosis' ? 'brand' : c === 'sano' ? 'success' : 'warning');

/** Validación experta (RF06): cola de casos, detalle e historial. Solo especialistas y administrador. */
export function ValidationPage() {
  const { user, ready } = useAuth();

  let body;
  if (!ready) body = <Spinner size={24} />;
  else if (!user) {
    body = (
      <Callout label="Inicia sesión">
        <p>La validación está disponible para especialistas y para el administrador.</p>
        <div className="vx-actions">
          <Button to="/login?next=/validacion" size="sm">
            Iniciar sesión
          </Button>
        </div>
      </Callout>
    );
  } else if (!canValidate(user)) {
    body = (
      <Alert tone="info">
        Solo los usuarios con perfil de especialista y el administrador pueden validar diagnósticos. El administrador asigna los
        perfiles desde el panel.
      </Alert>
    );
  } else body = <ValidationWorkspace user={user} />;

  return (
    <MainLayout>
      <PageHero
        label="Módulo de diagnóstico"
        title="Validación experta"
        description="Revisa los diagnósticos del modelo, confirma o corrige la clase del fruto y deja tu comentario. Cada validación queda registrada con quién la hizo."
      />
      <ModuleTabs />
      <Section tone="alt">{body}</Section>
    </MainLayout>
  );
}

function ValidationWorkspace({ user }) {
  const [filter, setFilter] = useState('pendientes');
  const [selected, setSelected] = useState(null);
  const list = useAsync(() => api.get(`/validacion/casos?estado=${filter}`), [filter]);

  const cases = list.data?.casos ?? [];
  const totals = list.data?.totales ?? {};

  // Selecciona el primer caso de la lista si el elegido ya no está en ella
  useEffect(() => {
    if (!list.data) return;
    if (!cases.some((c) => c.id === selected)) setSelected(cases[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data]);

  return (
    <div className="vx-layout">
      <div className="vx-card vx-queue">
        <div className="vx-filters" role="tablist" aria-label="Filtrar casos">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`vx-filter ${filter === f.id ? 'is-active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label} <span className="vx-filter__count">{totals[f.id] ?? '·'}</span>
            </button>
          ))}
        </div>
        {list.loading && !list.data && <Spinner label="Cargando casos" />}
        {list.error && <Alert tone="error">{list.error.message}</Alert>}
        {list.data && cases.length === 0 && (
          <EmptyState icon="check" title={filter === 'pendientes' ? 'No hay casos pendientes' : 'No hay casos'}>
            Los análisis de «Nuevo diagnóstico» aparecen aquí para validarlos.
          </EmptyState>
        )}
        <ul className="vx-list">
          {cases.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`vx-item ${selected === c.id ? 'is-selected' : ''}`}
                onClick={() => setSelected(c.id)}
                aria-current={selected === c.id ? 'true' : undefined}
              >
                <img src={imageUrl(c.id)} alt="" className="vx-item__thumb" loading="lazy" />
                <span className="vx-item__body">
                  <span className="vx-item__title">
                    Captura N.º {c.id}
                    <span className="vx-dot" style={{ background: healthClass(c.resultado)?.color }} aria-hidden="true" />
                    <span className="vx-item__model">{healthClass(c.resultado)?.short}</span>
                  </span>
                  <span className="vx-item__meta">
                    {formatDateTime(c.tomada_en)} · {c.autor ?? 'Usuario eliminado'}
                  </span>
                  {c.validado && (
                    <span className="vx-item__meta">
                      <Badge tone={classTone(c.clase_confirmada)}>{validationLabel(c.clase_confirmada)}</Badge> por{' '}
                      {validatorLabel(c.perfil_validador).toLowerCase()} {c.validador_nombre}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="vx-card vx-detail">
        {selected ? (
          <CaseDetail key={selected} id={selected} user={user} onSaved={list.reload} />
        ) : (
          <EmptyState icon="image" title="Elige un caso">
            Selecciona una captura de la lista para revisarla.
          </EmptyState>
        )}
      </div>
    </div>
  );
}

function CaseDetail({ id, user, onSaved }) {
  const detail = useAsync(() => api.get(`/validacion/casos/${id}`).then((d) => d.caso), [id]);
  const [gradcam, setGradcam] = useState({});
  const [choice, setChoice] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  if (detail.loading && !detail.data) return <Spinner label="Cargando caso" />;
  if (detail.error) return <Alert tone="error">{detail.error.message}</Alert>;
  const c = detail.data;
  const current = c.historial[0];
  const profile = validatorProfile(user);

  const loadGradcam = async (model) => {
    setGradcam((g) => ({ ...g, [model]: { loading: true } }));
    try {
      const r = await api.post(`/diagnostico/capturas/${id}/gradcam`, { model });
      setGradcam((g) => ({ ...g, [model]: { src: r.gradcam } }));
    } catch (err) {
      setGradcam((g) => ({ ...g, [model]: { error: err.message } }));
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!choice) return setMessage({ tone: 'error', text: 'Elige la clase del fruto.' });
    setSaving(true);
    setMessage(null);
    try {
      const { caso } = await api.post(`/validacion/casos/${id}`, { clase_confirmada: choice, comentario: comment });
      detail.setData(caso);
      setChoice('');
      setComment('');
      setMessage({ tone: 'success', text: 'Validación registrada.' });
      onSaved();
    } catch (err) {
      setMessage({ tone: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const shown = Object.entries(gradcam).find(([, g]) => g.src);

  return (
    <div className="vx-case">
      <header className="vx-case__head">
        <div>
          <p className="vx-case__title">Captura N.º {c.id}</p>
          <Text size="sm">
            {formatDateTime(c.tomada_en)} · {c.autor ?? 'Usuario eliminado'}
            {c.latitud !== null && ` · Ubicación ${Number(c.latitud).toFixed(4)}, ${Number(c.longitud).toFixed(4)}`}
          </Text>
        </div>
        {current ? (
          <Badge tone={classTone(current.clase_confirmada)}>Vigente: {validationLabel(current.clase_confirmada)}</Badge>
        ) : (
          <Badge tone="warning">Sin validar</Badge>
        )}
      </header>

      <div className="vx-case__images">
        <ImageFrame src={imageUrl(c.id)} alt={`Foto de la captura ${c.id}`} caption="Foto" />
        <ImageFrame
          src={shown?.[1].src}
          alt="Mapa Grad-CAM: zonas que más influyeron en el resultado"
          caption={shown ? `Grad-CAM · ${MODEL_NAMES[shown[0]]}` : 'Grad-CAM'}
          placeholder="Pídelo con el botón de cada modelo"
        />
      </div>

      <div className="vx-models">
        {c.diagnosticos.map((d) => (
          <div key={d.id} className="vx-model">
            <div className="vx-model__head">
              <strong>{MODEL_NAMES[d.modelo] ?? d.modelo}</strong>
              <Text size="sm">versión {d.version}</Text>
            </div>
            <HealthLight value={d.resultado} />
            <Text size="sm">
              Probabilidad de antracnosis: <strong>{pct(d.prob_antracnosis)}</strong> (umbrales {pct(d.umbral_inferior)} y{' '}
              {pct(d.umbral_superior)})
            </Text>
            <Button size="sm" variant="ghost" onClick={() => loadGradcam(d.modelo)} loading={gradcam[d.modelo]?.loading}>
              <Icon name="eye" size={16} /> Ver Grad-CAM
            </Button>
            {gradcam[d.modelo]?.error && <Text size="sm" className="vx-error">{gradcam[d.modelo].error}</Text>}
          </div>
        ))}
      </div>

      <form className="vx-form" onSubmit={save}>
        <p className="vx-form__title">{current ? 'Corregir la validación' : 'Validar el diagnóstico'}</p>
        <div className="vx-choices" role="radiogroup" aria-label="Clase confirmada">
          {VALIDATION_CLASSES.map((k) => (
            <label key={k.id} className={`vx-choice ${choice === k.id ? 'is-checked' : ''}`}>
              <input type="radio" name="clase" value={k.id} checked={choice === k.id} onChange={() => setChoice(k.id)} />
              {k.label}
            </label>
          ))}
        </div>
        <Textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          placeholder="Comentario (opcional): qué se observa, por qué se confirma o corrige"
          aria-label="Comentario"
        />
        {message && <Alert tone={message.tone}>{message.text}</Alert>}
        <Button type="submit" loading={saving}>
          <Icon name="check" size={16} /> Registrar validación
        </Button>
        <Text size="sm">
          Se registrará como {validatorLabel(profile).toLowerCase()}: {user.name}. Las validaciones no se borran: una corrección se
          agrega al historial y vale la más reciente.
        </Text>
      </form>

      <div className="vx-history">
        <p className="vx-form__title">Historial de validaciones</p>
        {c.historial.length === 0 ? (
          <Text size="sm">Todavía nadie validó este caso.</Text>
        ) : (
          <ol className="vx-history__list">
            {c.historial.map((h, i) => (
              <li key={h.id} className="vx-history__item">
                <div className="vx-history__line">
                  <Badge tone={classTone(h.clase_confirmada)}>{validationLabel(h.clase_confirmada)}</Badge>
                  <span>
                    {validatorLabel(h.perfil_validador)} · <strong>{h.validador_nombre}</strong>
                  </span>
                  {i === 0 && <Badge tone="info">Vigente</Badge>}
                </div>
                <Text size="sm">{formatDateTime(h.created_at)}</Text>
                {h.comentario && <p className="vx-history__comment">{h.comentario}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
