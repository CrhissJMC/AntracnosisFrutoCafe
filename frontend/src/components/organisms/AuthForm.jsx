import { useState } from 'react';
import { Button, Heading, Input, Link, Text } from '../atoms';
import { Alert, FormField } from '../molecules';
import { useAuth } from '../../context/AuthContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { useRouter } from '../../lib/router.jsx';
import './AuthForm.css';

/** Solo se permite volver a rutas internas (evita redirecciones abiertas). */
function safeNext(search, fallback) {
  const next = new URLSearchParams(search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

export function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const { search, navigate } = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({ name: '', email: '', password: '' }, async (v) => {
    const user = isLogin ? await login(v.email, v.password) : await register(v.name, v.email, v.password);
    navigate(safeNext(search, user.role === 'admin' ? '/admin' : '/blog'), { replace: true });
  });

  const switchHref = `${isLogin ? '/registro' : '/login'}${search}`;

  return (
    <div className="auth-form">
      <Heading as="h1" size="lg">
        {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
      </Heading>
      <Text size="sm">
        {isLogin
          ? 'Ingresa para comentar en los artículos del blog.'
          : 'Regístrate para participar en el blog y comentar los artículos.'}
      </Text>

      <form onSubmit={form.handleSubmit} noValidate className="auth-form__fields">
        {!isLogin && (
          <FormField label="Nombre completo" error={form.errors.name}>
            <Input {...form.field('name')} autoComplete="name" required maxLength={100} autoFocus />
          </FormField>
        )}
        <FormField label="Correo electrónico" error={form.errors.email}>
          <Input
            {...form.field('email')}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={160}
            autoFocus={isLogin}
          />
        </FormField>
        <FormField label="Contraseña" error={form.errors.password} hint={isLogin ? undefined : 'Mínimo 8 caracteres.'}>
          <Input
            {...form.field('password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
            minLength={isLogin ? undefined : 8}
            maxLength={72}
          />
        </FormField>
        <label className="auth-form__show">
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} /> Mostrar contraseña
        </label>

        {form.formError && <Alert tone="error">{form.formError}</Alert>}

        <Button type="submit" block loading={form.submitting}>
          {isLogin ? 'Ingresar' : 'Crear cuenta'}
        </Button>
      </form>

      <Text size="sm" className="auth-form__switch">
        {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
        <Link to={switchHref}>{isLogin ? 'Regístrate' : 'Inicia sesión'}</Link>
      </Text>
    </div>
  );
}
