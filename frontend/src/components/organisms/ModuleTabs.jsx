import { Icon, Link } from '../atoms';
import { useAuth } from '../../context/AuthContext.jsx';
import { moduleTabs } from '../../lib/modulo.js';
import { useRouter } from '../../lib/router.jsx';
import './ModuleTabs.css';

/** Barra de pestañas del módulo de diagnóstico; muestra solo las del perfil del usuario. */
export function ModuleTabs({ badges = {} }) {
  const { user } = useAuth();
  const { pathname } = useRouter();
  const tabs = moduleTabs(user);
  if (tabs.length < 2) return null;
  return (
    <nav className="module-tabs" aria-label="Módulo de diagnóstico">
      <div className="module-tabs__inner">
        {tabs.map((t) => (
          <Link key={t.to} to={t.to} className="module-tabs__tab" aria-current={pathname === t.to ? 'page' : undefined}>
            <Icon name={t.icon} size={16} /> {t.label}
            {badges[t.to] > 0 && <span className="module-tabs__badge">{badges[t.to]}</span>}
          </Link>
        ))}
      </div>
    </nav>
  );
}
