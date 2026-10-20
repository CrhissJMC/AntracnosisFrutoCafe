import { Button, Heading, Text, Textarea } from '../atoms';
import { Alert, CommentItem, FormField } from '../molecules';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useForm } from '../../hooks/useForm.js';
import { api } from '../../lib/api.js';
import { useRouter } from '../../lib/router.jsx';
import './CommentSection.css';

const MAX = 2000;

export function CommentSection({ articleId }) {
  const { user, isAdmin } = useAuth();
  const { pathname } = useRouter();
  const { data: comments, error, loading, setData } = useAsync(
    () => api.get(`/articles/${articleId}/comments`).then((d) => d.comments),
    [articleId],
  );

  const form = useForm({ body: '' }, async ({ body }) => {
    const { comment } = await api.post(`/articles/${articleId}/comments`, { body });
    setData((list) => [...(list ?? []), comment]);
    form.setValues({ body: '' });
  });

  const remove = async (id) => {
    await api.del(`/comments/${id}`);
    setData((list) => list.filter((c) => c.id !== id));
  };

  // Enviar con Ctrl/Cmd + Enter
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) form.handleSubmit(e);
  };

  const count = comments?.length ?? 0;
  const next = encodeURIComponent(`${pathname}#comentarios`);

  return (
    <section className="comments" id="comentarios" aria-labelledby="comentarios-title">
      <Heading id="comentarios-title" as="h2" size="lg">
        Comentarios <span className="comments__count">({count})</span>
      </Heading>

      {user ? (
        <form className="comments__form" onSubmit={form.handleSubmit} noValidate>
          <FormField label={`Comentar como ${user.name}`} error={form.errors.body}>
            <Textarea
              {...form.field('body')}
              rows={4}
              maxLength={MAX}
              placeholder="Comparte tu experiencia o una pregunta sobre el artículo…"
              onKeyDown={onKeyDown}
              required
            />
          </FormField>
          {form.formError && !form.errors.body && <Alert tone="error">{form.formError}</Alert>}
          <div className="comments__form-footer">
            <span className="comments__chars">
              {form.values.body.length}/{MAX}
            </span>
            <Button type="submit" loading={form.submitting} disabled={!form.values.body.trim()}>
              Publicar comentario
            </Button>
          </div>
        </form>
      ) : (
        <div className="comments__cta">
          <Text size="sm" tone="default">
            Para comentar necesitas una cuenta. Es gratis y toma menos de un minuto.
          </Text>
          <div className="comments__cta-actions">
            <Button to={`/registro?next=${next}`} size="sm">
              Crear cuenta
            </Button>
            <Button to={`/login?next=${next}`} variant="secondary" size="sm">
              Iniciar sesión
            </Button>
          </div>
        </div>
      )}

      {loading && <Text size="sm">Cargando comentarios…</Text>}
      {error && <Alert tone="error">No se pudieron cargar los comentarios.</Alert>}
      {comments && comments.length === 0 && <Text size="sm">Sé la primera persona en comentar.</Text>}
      {comments && comments.length > 0 && (
        <ul className="comments__list">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              isOwn={user?.id === c.user_id}
              canDelete={isAdmin || user?.id === c.user_id}
              onDelete={() => remove(c.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
