import { Button, Heading, Icon, Link, Text } from '../../components/atoms';
import { Alert, StatCard } from '../../components/molecules';
import { AdminLayout } from '../../components/templates';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatDateTime } from '../../lib/format.js';
import './AdminPages.css';

export function DashboardPage() {
  const stats = useAsync(() => api.get('/admin/stats').then((d) => d.stats), []);
  const comments = useAsync(() => api.get('/comments?limit=5').then((d) => d.comments), []);
  const s = stats.data ?? {};

  return (
    <AdminLayout
      title="Resumen"
      description="Estado general del sitio y la actividad reciente."
      actions={
        <Button to="/admin/articulos/nuevo">
          <Icon name="plus" size={16} /> Nuevo artículo
        </Button>
      }
    >
      {stats.error && <Alert tone="error">No se pudieron cargar las estadísticas.</Alert>}
      <div className="admin-stats">
        <StatCard icon="doc" label="Artículos" value={s.articles} hint={s.drafts ? `${s.drafts} en borrador` : undefined} />
        <StatCard icon="chat" label="Comentarios" value={s.comments} hint={s.comments_week ? `+${s.comments_week} esta semana` : undefined} />
        <StatCard icon="users" label="Usuarios registrados" value={s.users} />
        <StatCard icon="inbox" label="Mensajes sin leer" value={s.unread_messages} />
      </div>

      <section className="admin-card">
        <div className="admin-card__head">
          <Heading as="h2" size="md">
            Comentarios recientes
          </Heading>
          <Link to="/admin/comentarios" className="admin-link">
            Ver todos
          </Link>
        </div>
        {comments.data?.length === 0 && <Text size="sm">Todavía no hay comentarios.</Text>}
        <ul className="admin-activity">
          {comments.data?.map((c) => (
            <li key={c.id}>
              <p>
                <strong>{c.user_name}</strong> en <Link to={`/blog/${c.article_slug}#comentarios`}>{c.article_title}</Link>
              </p>
              <p className="admin-activity__body">{c.body}</p>
              <time dateTime={c.created_at}>{formatDateTime(c.created_at)}</time>
            </li>
          ))}
        </ul>
      </section>
    </AdminLayout>
  );
}
