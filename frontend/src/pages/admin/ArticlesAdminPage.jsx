import { Badge, Button, Icon, Link } from '../../components/atoms';
import { Alert, ConfirmButton } from '../../components/molecules';
import { DataTable } from '../../components/organisms';
import { AdminLayout } from '../../components/templates';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatDate } from '../../lib/format.js';

export function ArticlesAdminPage() {
  const { data, error, setData } = useAsync(() => api.get('/articles?all=1&limit=100').then((d) => d.articles), []);

  const remove = async (id) => {
    await api.del(`/articles/${id}`);
    setData((list) => list.filter((a) => a.id !== id));
  };

  const columns = [
    {
      key: 'title',
      label: 'Artículo',
      className: 'col-wide',
      render: (a) => (
        <div>
          <Link to={`/admin/articulos/${a.id}`} className="cell-title">
            {a.title}
          </Link>
          <p className="cell-sub">/blog/{a.slug}</p>
        </div>
      ),
    },
    { key: 'category', label: 'Categoría' },
    {
      key: 'published',
      label: 'Estado',
      render: (a) => (a.published ? <Badge tone="success">Publicado</Badge> : <Badge tone="warning">Borrador</Badge>),
    },
    { key: 'published_at', label: 'Fecha', render: (a) => formatDate(a.published_at) },
    { key: 'comment_count', label: 'Coment.', className: 'col-num' },
    {
      key: 'actions',
      label: 'Acciones',
      className: 'col-actions',
      render: (a) => (
        <div>
          <Button to={`/blog/${a.slug}`} variant="ghost" size="sm" iconOnly aria-label={`Ver ${a.title}`} title="Ver en el sitio">
            <Icon name="eye" size={16} />
          </Button>
          <Button to={`/admin/articulos/${a.id}`} variant="secondary" size="sm">
            <Icon name="edit" size={15} /> Editar
          </Button>
          <ConfirmButton icon="trash" confirmText="¿Eliminar?" onConfirm={() => remove(a.id)} aria-label={`Eliminar ${a.title}`}>
            <span className="visually-hidden">Eliminar</span>
          </ConfirmButton>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Artículos del blog"
      description="Crea, edita, publica o retira artículos. Al eliminar uno también se borran sus comentarios."
      actions={
        <Button to="/admin/articulos/nuevo">
          <Icon name="plus" size={16} /> Nuevo artículo
        </Button>
      }
    >
      {error && <Alert tone="error">{error.message}</Alert>}
      {data && <DataTable columns={columns} rows={data} empty="Aún no hay artículos" caption="Artículos del blog" />}
    </AdminLayout>
  );
}
