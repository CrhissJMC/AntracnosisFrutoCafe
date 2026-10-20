import { Avatar, Button, Icon, Logo } from '../atoms';
import { NavItem } from '../molecules';
import { useAuth } from '../../context/AuthContext.jsx';
import './AdminSidebar.css';

export const ADMIN_LINKS = [
  { to: '/admin', label: 'Resumen', icon: 'grid', exact: true },
  { to: '/admin/articulos', label: 'Artículos del blog', icon: 'doc' },
  { to: '/admin/comentarios', label: 'Comentarios', icon: 'chat' },
  { to: '/admin/contenido', label: 'Contenido de páginas', icon: 'layers' },
  { to: '/admin/textos', label: 'Textos del sitio', icon: 'settings' },
  { to: '/admin/mensajes', label: 'Mensajes', icon: 'inbox' },
  { to: '/admin/usuarios', label: 'Usuarios', icon: 'users' },
];

export function AdminSidebar({ open, onNavigate, onLogout }) {
  const { user } = useAuth();
  return (
    <aside className={`admin-sidebar ${open ? 'is-open' : ''}`} aria-label="Administración">
      <div className="admin-sidebar__brand">
        <Logo tone="inverse" name="Panel Antracnosis" to="/admin" />
      </div>
      <nav className="admin-sidebar__nav">
        {ADMIN_LINKS.map((l) => (
          <NavItem key={l.to} to={l.to} exact={l.exact} variant="side" onNavigate={onNavigate}>
            <Icon name={l.icon} size={18} /> {l.label}
          </NavItem>
        ))}
      </nav>
      <div className="admin-sidebar__footer">
        <NavItem to="/" exact variant="side" onNavigate={onNavigate}>
          <Icon name="home" size={18} /> Ver sitio público
        </NavItem>
        <div className="admin-sidebar__user">
          <Avatar name={user?.name} size={32} />
          <div className="admin-sidebar__user-info">
            <p>{user?.name}</p>
            <p>{user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" iconOnly onClick={onLogout} aria-label="Cerrar sesión" className="admin-sidebar__logout">
            <Icon name="logout" size={18} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
