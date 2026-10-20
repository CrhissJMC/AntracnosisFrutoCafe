import { useEffect } from 'react';
import { AuthForm } from '../components/organisms';
import { AuthLayout } from '../components/templates';
import { useAuth } from '../context/AuthContext.jsx';
import { useRouter } from '../lib/router.jsx';

function useRedirectIfLoggedIn() {
  const { user, ready } = useAuth();
  const { navigate } = useRouter();
  useEffect(() => {
    if (ready && user) navigate(user.role === 'admin' ? '/admin' : '/blog', { replace: true });
    // Solo al entrar a la página: tras iniciar sesión el propio formulario redirige.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
}

export function LoginPage() {
  useRedirectIfLoggedIn();
  return (
    <AuthLayout>
      <AuthForm mode="login" />
    </AuthLayout>
  );
}

export function RegisterPage() {
  useRedirectIfLoggedIn();
  return (
    <AuthLayout>
      <AuthForm mode="register" />
    </AuthLayout>
  );
}
