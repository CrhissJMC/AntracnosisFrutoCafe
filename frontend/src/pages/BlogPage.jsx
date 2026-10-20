import { useMemo, useState } from 'react';
import { Text } from '../components/atoms';
import { Alert } from '../components/molecules';
import { BlogGrid, PageHero, Section } from '../components/organisms';
import { MainLayout } from '../components/templates';
import { useSite } from '../context/SiteContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../lib/api.js';
import './BlogPage.css';

export function BlogPage() {
  const { settings: s } = useSite();
  const { data, error, loading } = useAsync(() => api.get('/articles').then((d) => d.articles), []);
  const [category, setCategory] = useState('TODOS');

  const categories = useMemo(() => ['TODOS', ...new Set((data ?? []).map((a) => a.category))], [data]);
  const visible = (data ?? []).filter((a) => category === 'TODOS' || a.category === category);

  return (
    <MainLayout>
      <PageHero label={s.blog_label} title={s.blog_title} description={s.blog_desc} />
      <Section>
        {data && categories.length > 2 && (
          <div className="blog-filters" role="group" aria-label="Filtrar por categoría">
            {categories.map((c) => (
              <button key={c} type="button" className="blog-filter" aria-pressed={category === c} onClick={() => setCategory(c)}>
                {c === 'TODOS' ? 'Todos' : c.charAt(0) + c.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
        {loading && <Text>Cargando artículos…</Text>}
        {error && <Alert tone="error">No se pudieron cargar los artículos. Intenta recargar la página.</Alert>}
        {data && <BlogGrid articles={visible} />}
      </Section>
    </MainLayout>
  );
}
