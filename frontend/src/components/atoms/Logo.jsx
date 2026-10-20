import { Link } from './Link.jsx';
import './Logo.css';

export function Logo({ name = 'Proyecto Antracnosis', tone = 'brand', to = '/' }) {
  return (
    <Link to={to} className={`logo logo--${tone}`} aria-label={`${name}, ir al inicio`}>
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15z" fill="currentColor" opacity="0.18" />
        <path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15zM5 19l9-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span>{name}</span>
    </Link>
  );
}
