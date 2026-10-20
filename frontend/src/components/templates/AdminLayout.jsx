import { useEffect, useState } from 'react';
import { Button, Heading, Icon, Spinner, Text } from '../atoms';
import { AdminSidebar } from '../organisms';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRouter } from '../../lib/router.jsx';
import './Layouts.css';

/** Protege las rutas del panel: espera la sesión, redirige al login o muestra "acceso restringido".
 *  Así las páginas de administración no piden datos a la API hasta confirmar que el usuario es admin. */
export function AdminGuard({ children }) {
  const { user, isAdmin, ready } = useAuth();
  const { navigate, pathname } = useRouter();

  useEffect(() => {
    if (ready && !user) navigate(`/login?next=${encodeURIComponent(pathname)}`, { replace: true });
  }, [ready, user, navigate, pathname]);

  if (!ready || !user) {
    return (
      <div className="admin-layout__loading">
        <Spinner size={24} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-layout__denied">
        <Heading as="h1" size="lg">
          Acceso restringido
        </Heading>
        <Text>Esta sección es solo para administradores.</Text>
        <Button to="/">Volver al inicio</Button>
      </div>
    );
  }

  return children;
}

/** Plantilla del panel: barra lateral + cabecera con título y acciones. */
export function AdminLayout({ title, description, actions, children }) {
  const { logout } = useAuth();
  const { navigate, pathname } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  const handleLogout = async () => {
    navigate('/'); // primero salir del panel, así el guard no redirige al login
    await logout();
  };

  return (
    <div className="admin-layout">
      <AdminSidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} onLogout={handleLogout} />
      {menuOpen && <div className="admin-layout__backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <div className="admin-layout__main">
        <header className="admin-layout__header">
          <Button variant="ghost" iconOnly className="admin-layout__menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menú de administración">
            <Icon name="menu" size={22} />
          </Button>
          <div className="admin-layout__titles">
            <Heading as="h1" size="lg">
              {title}
            </Heading>
            {description && <Text size="sm">{description}</Text>}
          </div>
          {actions && <div className="admin-layout__actions">{actions}</div>}
        </header>
        <div className="admin-layout__content page-enter" key={pathname}>
          {children}
        </div>
      </div>
    </div>
  );
}
