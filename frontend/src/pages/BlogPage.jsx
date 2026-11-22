import { useMemo, useState } from 'react';
import { Button, Dot, Icon, Text } from '../components/atoms';
import { Alert } from '../components/molecules';
import { BlogGrid, PageHero, Section } from '../components/organisms';
import { MainLayout } from '../components/templates';
import { useSite } from '../context/SiteContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../lib/api.js';
import { healthClass } from '../lib/diagnosis.js';
import { useRouter } from '../lib/router.jsx';
import './BlogPage.css';

const CLASSES = ['sano', 'revisar', 'antracnosis'];

export function BlogPage() {
  const { settings: s } = useSite();
  const { search, navigate } = useRouter();
  // Base de conocimiento (RF07): desde el resultado del diagnóstico se llega con ?clase=<resultado>.
  const param = new URLSearchParams(search).get('clase');
  const clase = CLASSES.includes(param) ? param : null;
  const cls = clase ? healthClass(clase) : null;

  const { data, error, loading } = useAsync(async () => {
    if (!clase) return { articles: (await api.get('/articles')).articles, fallback: false };
    const linked = (await api.get(`/articles?clase=${clase}&limit=100`)).articles;
    if (linked.length) return { articles: linked, fallback: false };
    // Sin fichas para esa clase: aviso y las fichas de manejo generales.
    const all = (await api.get('/articles')).articles;
    return { articles: all.filter((a) => ['FICHA DE MANEJO', 'MANEJO'].includes(a.category)), fallback: true };
  }, [clase]);
  const [category, setCategory] = useState('TODOS');

  const list = data?.articles ?? [];
  const categories = useMemo(() => ['TODOS', ...new Set(list.map((a) => a.category))], [list]);
  const visible = clase ? list : list.filter((a) => category === 'TODOS' || a.category === category);

  return (
    <MainLayout>
      <PageHero label={s.blog_label} title={s.blog_title} description={s.blog_desc} />
      <Section>
        {clase && (
          <div className="blog-class" style={{ '--blog-class': cls.color }}>
            <p className="blog-class__label">
              <Dot color={cls.color} size={10} /> Fichas para el resultado «{cls.short}» del diagnóstico
            </p>
            <Button size="sm" variant="ghost" onClick={() => navigate('/blog')}>
              <Icon name="close" size={14} /> Quitar filtro
            </Button>
          </div>
        )}
        {data?.fallback && (
          <Alert tone="info">Todavía no hay fichas para este resultado. Te mostramos las fichas de manejo generales.</Alert>
        )}
        {!clase && data && categories.length > 2 && (
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
