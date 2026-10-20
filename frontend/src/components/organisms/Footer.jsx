import { Link } from '../atoms';
import { useSite } from '../../context/SiteContext.jsx';
import { NAV_LINKS } from './Navbar.jsx';
import './Footer.css';

export function Footer() {
  const { settings: s } = useSite();
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="footer__brand">{s.site_name || 'Proyecto Antracnosis'}</p>
          <p className="footer__tagline">{s.footer_tagline}</p>
          <p className="footer__loc">{s.contact_location}</p>
        </div>
        <nav aria-label="Pie de página">
          <p className="footer__title">El proyecto</p>
          <ul className="footer__list">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="footer__title">Contacto</p>
          <ul className="footer__list">
            {s.contact_email && (
              <li>
                <a href={`mailto:${s.contact_email}`}>{s.contact_email} ↗</a>
              </li>
            )}
            {s.contact_hours && <li className="footer__muted">{s.contact_hours}</li>}
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>© {year} {s.site_name || 'Proyecto Antracnosis'} · Fines educativos</p>
        <p>{s.footer_note}</p>
      </div>
    </footer>
  );
}
