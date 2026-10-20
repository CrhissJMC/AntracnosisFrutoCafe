import { Logo, Text } from '../atoms';
import { useSite } from '../../context/SiteContext.jsx';
import './Layouts.css';

/** Plantilla de login/registro: panel de marca + tarjeta con el formulario. */
export function AuthLayout({ children }) {
  const { settings } = useSite();
  return (
    <div className="auth-layout">
      <div className="auth-layout__aside" style={settings.hero_image ? { '--auth-image': `url("${encodeURI(settings.hero_image)}")` } : undefined}>
        <Logo tone="inverse" name={settings.site_name || 'Proyecto Antracnosis'} />
        <div>
          <p className="auth-layout__quote">Del conocimiento a la parcela.</p>
          <Text tone="inverse-muted" size="sm">
            Únete a la comunidad del blog para comentar, preguntar y compartir experiencias de campo.
          </Text>
        </div>
      </div>
      <main className="auth-layout__main page-enter">
        <div className="auth-layout__mobile-logo">
          <Logo name={settings.site_name || 'Proyecto Antracnosis'} />
        </div>
        <div className="auth-layout__card">{children}</div>
      </main>
    </div>
  );
}
