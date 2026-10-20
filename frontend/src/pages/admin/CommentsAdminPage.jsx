import { Link } from '../../components/atoms';
import { Alert, ConfirmButton } from '../../components/molecules';
import { DataTable } from '../../components/organisms';
import { AdminLayout } from '../../components/templates';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatDateTime } from '../../lib/format.js';

export function CommentsAdminPage() {
  const { data, error, setData } = useAsync(() => api.get('/comments?limit=100').then((d) => d.comments), []);

  const remove = async (id) => {
    await api.del(`/comments/${id}`);
    setData((list) => list.filter((c) => c.id !== id));
  };

  const columns = [
    {
      key: 'body',
      label: 'Comentario',
      className: 'col-wide',
      render: (c) => <p className="cell-clamp">{c.body}</p>,
    },
    {
      key: 'user',
      label: 'Autor',
      render: (c) => (
        <div>
          <p className="cell-title">{c.user_name}</p>
          <p className="cell-sub">{c.user_email}</p>
        </div>
      ),
    },
    {
      key: 'article',
      label: 'Artículo',
      render: (c) => <Link to={`/blog/${c.article_slug}#comentarios`}>{c.article_title}</Link>,
    },
    { key: 'created_at', label: 'Fecha', render: (c) => formatDateTime(c.created_at) },
    {
      key: 'actions',
      label: 'Acciones',
      className: 'col-actions',
      render: (c) => (
        <div>
          <ConfirmButton icon="trash" confirmText="¿Eliminar?" onConfirm={() => remove(c.id)}>
            Eliminar
          </ConfirmButton>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Comentarios" description="Modera los comentarios que dejan los usuarios en el blog.">
      {error && <Alert tone="error">{error.message}</Alert>}
      {data && <DataTable columns={columns} rows={data} empty="Aún no hay comentarios" caption="Comentarios" />}
    </AdminLayout>
  );
}
