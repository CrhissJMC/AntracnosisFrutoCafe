import { useEffect, useState } from 'react';
import { Avatar, Button, Icon, Logo } from '../atoms';
import { NavItem } from '../molecules';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSite } from '../../context/SiteContext.jsx';
import { useRouter } from '../../lib/router.jsx';
import './Navbar.css';

export const NAV_LINKS = [
  { to: '/', label: 'Inicio', exact: true },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/blog', label: 'Blog' },
  { to: '/trazabilidad', label: 'Trazabilidad' },
  { to: '/contacto', label: 'Contacto' },
];

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { settings } = useSite();
  const { pathname, navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Logo name={settings.site_name || 'Proyecto Antracnosis'} />

        <nav className="navbar__links" aria-label="Principal">
          {NAV_LINKS.map((l) => (
            <NavItem key={l.to} to={l.to} exact={l.exact}>
              {l.label}
            </NavItem>
          ))}
        </nav>

        <div className="navbar__actions">
          {user ? (
            <>
              {isAdmin && (
                <Button to="/admin" variant="secondary" size="sm">
                  <Icon name="grid" size={15} /> Panel
                </Button>
              )}
              <span className="navbar__user" title={user.email}>
                <Avatar name={user.name} size={30} />
                <span className="navbar__user-name">{user.name.split(' ')[0]}</span>
              </span>
              <Button variant="ghost" size="sm" iconOnly onClick={handleLogout} aria-label="Cerrar sesión" title="Cerrar sesión">
                <Icon name="logout" size={18} />
              </Button>
            </>
          ) : (
            <>
              <Button to={loginHref} variant="ghost" size="sm">
                Iniciar sesión
              </Button>
              <Button to="/registro" size="sm">
                Registrarse
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          iconOnly
          className="navbar__toggle"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </Button>
      </div>

      <div id="mobile-menu" className={`navbar__drawer ${open ? 'is-open' : ''}`} hidden={!open}>
        <nav className="container navbar__drawer-links" aria-label="Menú móvil">
          {NAV_LINKS.map((l) => (
            <NavItem key={l.to} to={l.to} exact={l.exact} variant="drawer">
              {l.label}
            </NavItem>
          ))}
        </nav>
        <div className="container navbar__drawer-actions">
          {user ? (
            <>
              <p className="navbar__drawer-user">
                <Avatar name={user.name} size={32} /> {user.name}
              </p>
              {isAdmin && (
                <Button to="/admin" variant="secondary" block>
                  <Icon name="grid" size={16} /> Panel de administración
                </Button>
              )}
              <Button variant="ghost" block onClick={handleLogout}>
                <Icon name="logout" size={16} /> Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button to="/registro" block>
                Crear cuenta
              </Button>
              <Button to={loginHref} variant="secondary" block>
                Iniciar sesión
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
