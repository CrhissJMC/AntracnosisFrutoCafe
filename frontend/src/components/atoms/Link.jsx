import { useRouter } from '../../lib/router.jsx';

/** Enlace interno con navegación SPA; los externos se comportan como <a> normal. */
export function Link({ to, children, onClick, ...rest }) {
  const { navigate } = useRouter();
  const external = /^(https?:|mailto:|tel:)/.test(to);

  const handleClick = (e) => {
    onClick?.(e);
    if (external || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      {...(external && !to.startsWith('mailto:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
