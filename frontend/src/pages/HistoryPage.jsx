import { useEffect, useMemo, useState } from 'react';
import { Button, Icon, Input, Select, Spinner, Text } from '../components/atoms';
import { Alert, Callout, EmptyState } from '../components/molecules';
import { CaptureView, ModuleTabs, PageHero, Section, ValidationHistory } from '../components/organisms';
import { MainLayout } from '../components/templates';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../lib/api.js';
import { canValidate } from '../lib/modulo.js';
import { CaptureList } from './ValidationPage.jsx';
import './ValidationPage.css';
import './HistoryPage.css';

const PAGE = 25;
const EMPTY = { desde: '', hasta: '', clase: '', estado: '' };
const CLASSES = [
  { id: 'sano', label: 'Sano' },
  { id: 'revisar', label: 'Revisar' },
  { id: 'antracnosis', label: 'Antracnosis' },
  { id: 'otro_dano', label: 'Otro daño' },
];

const toQuery = (filters, extra = {}) =>
  new URLSearchParams(Object.entries({ ...filters, ...extra }).filter(([, v]) => v !== '' && v !== undefined)).toString();

/** Historial de capturas (RF05): filtros por periodo, clase vigente y validación; exportación en CSV. */
export function HistoryPage() {
  const { user, ready } = useAuth();

  let body;
  if (!ready) body = <Spinner size={24} />;
  else if (!user) {
    body = (
      <Callout label="Inicia sesión">
        <p>El historial muestra las capturas registradas en el módulo de diagnóstico.</p>
        <div className="vx-actions">
          <Button to="/login?next=/historial" size="sm">
            Iniciar sesión
          </Button>
        </div>
      </Callout>
    );
  } else body = <HistoryWorkspace user={user} />;

  return (
    <MainLayout>
      <PageHero
        label="Módulo de diagnóstico"
        title="Historial de capturas"
        description="Cada análisis queda registrado con su foto, la fecha, el resultado de los modelos y la validación del especialista."
      />
      <ModuleTabs />
      <Section tone="alt">{body}</Section>
    </MainLayout>
  );
}

function HistoryWorkspace({ user }) {
  const [draft, setDraft] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const query = useMemo(() => toQuery(filters, { limit: PAGE * pages }), [filters, pages]);
  const list = useAsync(() => api.get(`/historial?${query}`), [query]);

  const items = list.data?.capturas ?? [];
  const total = list.data?.total ?? 0;
  const all = list.data?.alcance === 'todas';

  useEffect(() => {
    if (list.data && !items.some((c) => c.id === selected)) setSelected(items[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data]);

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));
  const apply = (e) => {
    e.preventDefault();
    if (draft.desde && draft.hasta && draft.desde > draft.hasta) return;
    setPages(1);
    setFilters(draft);
  };
  const clear = () => {
    setDraft(EMPTY);
    setFilters(EMPTY);
    setPages(1);
  };
  const badRange = draft.desde && draft.hasta && draft.desde > draft.hasta;

  return (
    <div className="hx">
      <form className="vx-card hx-filters" onSubmit={apply}>
        <label className="hx-field">
          <span>Desde</span>
          <Input type="date" value={draft.desde} onChange={set('desde')} max={draft.hasta || undefined} />
        </label>
        <label className="hx-field">
          <span>Hasta</span>
          <Input type="date" value={draft.hasta} onChange={set('hasta')} min={draft.desde || undefined} />
        </label>
        <label className="hx-field">
          <span>Clase vigente</span>
          <Select value={draft.clase} onChange={set('clase')}>
            <option value="">Todas</option>
            {CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </label>
        <label className="hx-field">
          <span>Validación</span>
          <Select value={draft.estado} onChange={set('estado')}>
            <option value="">Todas</option>
            <option value="validados">Validadas</option>
            <option value="pendientes">Sin validar</option>
          </Select>
        </label>
        <div className="hx-filters__actions">
          <Button type="submit" size="sm" disabled={badRange}>
            Filtrar
          </Button>
          <Button size="sm" variant="ghost" onClick={clear}>
            Limpiar
          </Button>
          {/* Enlace normal (no del enrutador): el navegador descarga el archivo con la sesión */}
          <a className="btn btn--outline btn--sm" href={`/api/historial/exportar?${toQuery(filters)}`} download>
            <Icon name="doc" size={16} /> Exportar CSV
          </a>
        </div>
        {badRange && <Text size="sm" className="hx-error">La fecha «desde» no puede ser posterior a «hasta».</Text>}
      </form>

      <Text size="sm" className="hx-summary">
        {list.data ? `${total} ${total === 1 ? 'captura' : 'capturas'}` : ' '} ·{' '}
        {all ? 'ves todas las capturas del módulo' : 'ves solo las capturas que registraste'}
      </Text>

      <div className="vx-layout">
        <div className="vx-card vx-queue">
          {list.loading && !list.data && <Spinner label="Cargando historial" />}
          {list.error && <Alert tone="error">{list.error.message}</Alert>}
          {list.data && items.length === 0 && (
            <EmptyState icon="clock" title="No hay capturas">
              {filters === EMPTY ? 'Los análisis de «Nuevo diagnóstico» aparecerán aquí.' : 'Prueba con otros filtros.'}
            </EmptyState>
          )}
          <CaptureList items={items} selected={selected} onSelect={setSelected} showAuthor={all} />
          {items.length < total && (
            <Button variant="ghost" onClick={() => setPages((p) => p + 1)} loading={list.loading}>
              Ver más
            </Button>
          )}
        </div>
        <div className="vx-card vx-detail">
          {selected ? (
            <HistoryDetail key={selected} id={selected} user={user} />
          ) : (
            <EmptyState icon="image" title="Elige una captura">
              Selecciona una captura de la lista para ver su detalle.
            </EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryDetail({ id, user }) {
  const detail = useAsync(() => api.get(`/historial/${id}`).then((d) => d.captura), [id]);
  if (detail.loading && !detail.data) return <Spinner label="Cargando captura" />;
  if (detail.error) return <Alert tone="error">{detail.error.message}</Alert>;
  const c = detail.data;
  return (
    <div className="vx-case">
      <CaptureView capture={c} />
      {canValidate(user) && (
        <div>
          <Button to={`/validacion?caso=${c.id}`} size="sm">
            <Icon name="check" size={16} /> {c.historial.length ? 'Corregir en Validación' : 'Validar esta captura'}
          </Button>
        </div>
      )}
      <ValidationHistory history={c.historial} />
    </div>
  );
}
