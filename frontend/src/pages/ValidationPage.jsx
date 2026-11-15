import { useEffect, useState } from 'react';
import { Badge, Button, Icon, Spinner, Text, Textarea } from '../components/atoms';
import { Alert, Callout, EmptyState } from '../components/molecules';
import { CaptureView, ModuleTabs, PageHero, Section, ValidationHistory } from '../components/organisms';
import { MainLayout } from '../components/templates';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../lib/api.js';
import { healthClass } from '../lib/diagnosis.js';
import { formatDateTime } from '../lib/format.js';
import {
  canValidate,
  captureImageUrl,
  classTone,
  VALIDATION_CLASSES,
  validationLabel,
  validatorLabel,
  validatorProfile,
} from '../lib/modulo.js';
import { useRouter } from '../lib/router.jsx';
import './ValidationPage.css';

const FILTERS = [
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'validados', label: 'Validados' },
  { id: 'todos', label: 'Todos' },
];

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
  const { search } = useRouter();
  // Desde el historial se llega con ?caso=N: se abre ese caso en «Todos»
  const linked = Number(new URLSearchParams(search).get('caso')) || null;
  const [filter, setFilter] = useState(linked ? 'todos' : 'pendientes');
  const [selected, setSelected] = useState(linked);
  const list = useAsync(() => api.get(`/validacion/casos?estado=${filter}&limit=100`), [filter]);

  const cases = list.data?.casos ?? [];
  const totals = list.data?.totales ?? {};

  // Si el caso elegido no está en la lista, se abre el primero (salvo el que llegó por enlace)
  useEffect(() => {
    if (!list.data) return;
    if (selected === linked && linked) return;
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
        <CaptureList items={cases} selected={selected} onSelect={setSelected} />
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

/** Lista de capturas con miniatura (la usan Validación e Historial). */
export function CaptureList({ items, selected, onSelect, showAuthor = true }) {
  return (
    <ul className="vx-list">
      {items.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            className={`vx-item ${selected === c.id ? 'is-selected' : ''}`}
            onClick={() => onSelect(c.id)}
            aria-current={selected === c.id ? 'true' : undefined}
          >
            <img src={captureImageUrl(c.id)} alt="" className="vx-item__thumb" loading="lazy" />
            <span className="vx-item__body">
              <span className="vx-item__title">
                Captura N.º {c.id}
                <span className="vx-dot" style={{ background: healthClass(c.resultado)?.color }} aria-hidden="true" />
                <span className="vx-item__model">{healthClass(c.resultado)?.short}</span>
              </span>
              <span className="vx-item__meta">
                {formatDateTime(c.tomada_en)}
                {showAuthor && ` · ${c.autor ?? 'Usuario eliminado'}`}
              </span>
              <span className="vx-item__meta">
                {c.validado ? (
                  <>
                    <Badge tone={classTone(c.clase_confirmada)}>{validationLabel(c.clase_confirmada)}</Badge> por{' '}
                    {validatorLabel(c.perfil_validador).toLowerCase()} {c.validador_nombre}
                  </>
                ) : (
                  'Sin validar'
                )}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function CaseDetail({ id, user, onSaved }) {
  const detail = useAsync(() => api.get(`/validacion/casos/${id}`).then((d) => d.caso), [id]);
  const [choice, setChoice] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  if (detail.loading && !detail.data) return <Spinner label="Cargando caso" />;
  if (detail.error) return <Alert tone="error">{detail.error.message}</Alert>;
  const c = detail.data;
  const profile = validatorProfile(user);

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

  return (
    <div className="vx-case">
      <CaptureView capture={c} />

      <form className="vx-form" onSubmit={save}>
        <p className="vx-form__title">{c.historial.length ? 'Corregir la validación' : 'Validar el diagnóstico'}</p>
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

      <ValidationHistory history={c.historial} />
    </div>
  );
}
