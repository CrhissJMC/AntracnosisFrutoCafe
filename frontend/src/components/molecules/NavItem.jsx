import { Link } from '../atoms';
import { useRouter } from '../../lib/router.jsx';
import './NavItem.css';

/** Enlace de navegación con estado activo (sin cambiar el peso de la fuente → sin saltos). */
export function NavItem({ to, children, exact = false, onNavigate, variant = 'top' }) {
  const { pathname } = useRouter();
  const active = exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  return (
    <Link to={to} className={`nav-item nav-item--${variant}`} aria-current={active ? 'page' : undefined} onClick={onNavigate}>
      {children}
    </Link>
  );
}
