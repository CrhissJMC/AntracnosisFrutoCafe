import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../atoms';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import { useRouter } from '../../lib/router.jsx';
import './NotificationBell.css';

const REFRESH_MS = 60_000;

/** A dónde lleva cada aviso: el especialista va al caso en Validación; el autor, a su captura en el Historial. */
const target = (n) => (n.tipo === 'caso_revisar' ? `/validacion?caso=${n.captura_id}` : `/historial?captura=${n.captura_id}`);

function ago(iso) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'ayer' : `hace ${d} días`;
}

/** Una sección del panel («Por leer» o «Leídas») con su propio contador. */
function NotifSection({ title, items, empty, onOpen, highlight = false }) {
  return (
    <section className={`notif__section ${highlight && items.length ? 'is-highlight' : ''}`} aria-label={`${title} (${items.length})`}>
      <h3 className="notif__section-title">
        {title} <span className="notif__section-count">{items.length}</span>
      </h3>
      {items.length === 0 ? (
        <p className="notif__section-empty">{empty}</p>
      ) : (
        <ul className="notif__list">
          {items.map((n) => (
            <li key={n.id}>
              <button type="button" className={`notif__item ${n.leida ? '' : 'is-unread'}`} onClick={() => onOpen(n)}>
                <span className="notif__icon" aria-hidden="true">
                  <Icon name={n.tipo === 'validacion' ? 'check' : n.tipo === 'caso_revisar' ? 'alert' : 'clock'} size={16} />
                </span>
                <span className="notif__text">
                  {n.mensaje}
                  <span className="notif__time">{ago(n.created_at)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Campana de notificaciones (solo con sesión): casos «revisar» para el especialista y, para quien tomó la foto,
 * el aviso de que su caso quedó en revisión y de que ya fue validado. Se actualiza cada minuto y al volver a la pestaña.
 */
export function NotificationBell() {
  const { user } = useAuth();
  const { pathname, navigate } = useRouter();
  const [data, setData] = useState({ notificaciones: [], no_leidas: 0 });
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setData(await api.get('/notificaciones'));
    } catch {
      // sin conexión o sesión vencida: se intenta en la próxima vuelta
    }
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    load();
    const timer = setInterval(load, REFRESH_MS);
    window.addEventListener('focus', load);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', load);
    };
  }, [user, load]);

  useEffect(() => {
    setOpen(false);
    load();
  }, [pathname, load]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  if (!user) return null;

  const openItem = async (n) => {
    if (!n.leida) await api.post('/notificaciones/leer', { id: n.id }).catch(() => {});
    setOpen(false);
    navigate(target(n));
  };
  const readAll = async () => {
    const r = await api.post('/notificaciones/leer', {}).catch(() => null);
    if (r) setData((d) => ({ notificaciones: d.notificaciones.map((n) => ({ ...n, leida: true })), no_leidas: 0 }));
  };

  const count = data.no_leidas;
  const unread = data.notificaciones.filter((n) => !n.leida);
  const read = data.notificaciones.filter((n) => n.leida);
  return (
    <div className="notif" ref={ref}>
      <button
        type="button"
        className="notif__button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="notif-panel"
        aria-label={count ? `Notificaciones: ${count} sin leer` : 'Notificaciones'}
        title="Notificaciones"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="bell" size={20} />
        {count > 0 && <span className="notif__badge">{count > 9 ? '9+' : count}</span>}
      </button>

      {open && (
        <div id="notif-panel" className="notif__panel" role="region" aria-label="Notificaciones">
          <div className="notif__head">
            <p className="notif__title">Notificaciones</p>
            {count > 0 && (
              <button type="button" className="notif__readall" onClick={readAll}>
                Marcar todas como leídas
              </button>
            )}
          </div>
          {data.notificaciones.length === 0 ? (
            <p className="notif__empty">No tienes notificaciones.</p>
          ) : (
            <>
              <NotifSection title="Por leer" items={unread} empty="No tienes avisos pendientes." onOpen={openItem} highlight />
              <NotifSection title="Leídas" items={read} empty="Aún no has leído ningún aviso." onOpen={openItem} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
