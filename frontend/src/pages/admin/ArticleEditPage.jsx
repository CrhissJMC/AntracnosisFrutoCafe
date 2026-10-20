import { useState } from 'react';
import { Spinner } from '../../components/atoms';
import { Alert } from '../../components/molecules';
import { ArticleForm } from '../../components/organisms';
import { AdminLayout } from '../../components/templates';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { useRouter } from '../../lib/router.jsx';

const toForm = (a) => ({
  ...a,
  image_url: a.image_url ?? '',
  source_text: a.source_text ?? '',
  source_url: a.source_url ?? '',
});

export function ArticleEditPage({ id }) {
  const isNew = id === 'nuevo';
  const { navigate } = useRouter();
  const [saved, setSaved] = useState(false);
  const { data, error, loading, setData } = useAsync(
    () => (isNew ? Promise.resolve(null) : api.get(`/articles/${id}`).then((d) => d.article)),
    [id],
  );

  const submit = async (values) => {
    const { id: _id, comment_count, created_at, updated_at, published_at, ...payload } = values;
    if (isNew) {
      const { article } = await api.post('/articles', payload);
      navigate(`/admin/articulos/${article.id}`, { replace: true });
    } else {
      const { article } = await api.put(`/articles/${id}`, payload);
      setData(article);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }
  };

  return (
    <AdminLayout
      title={isNew ? 'Nuevo artículo' : 'Editar artículo'}
      description={data ? `/blog/${data.slug}` : 'Completa los campos y guarda para publicarlo.'}
    >
      {saved && <div style={{ marginBottom: 'var(--space-5)' }}><Alert tone="success" onClose={() => setSaved(false)}>Cambios guardados.</Alert></div>}
      {loading && <Spinner />}
      {error && <Alert tone="error">{error.message}</Alert>}
      {!loading && !error && (
        <ArticleForm
          key={data?.updated_at ?? 'new'}
          initial={data ? toForm(data) : undefined}
          onSubmit={submit}
          onCancel={() => navigate('/admin/articulos')}
          submitLabel={isNew ? 'Crear artículo' : 'Guardar cambios'}
        />
      )}
    </AdminLayout>
  );
}
