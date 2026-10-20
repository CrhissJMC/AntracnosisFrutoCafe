import { useEffect } from 'react';
import { Button, Heading, Icon, Link, Spinner, Text } from '../components/atoms';
import { Alert } from '../components/molecules';
import { CommentSection } from '../components/organisms';
import { MainLayout } from '../components/templates';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../lib/api.js';
import { formatDate } from '../lib/format.js';
import { renderMarkdown } from '../lib/markdown.jsx';
import './ArticlePage.css';

export function ArticlePage({ slug }) {
  const { isAdmin } = useAuth();
  const { data: article, error, loading } = useAsync(
    () => api.get(`/articles/${encodeURIComponent(slug)}`).then((d) => d.article),
    [slug],
  );

  useEffect(() => {
    if (article) document.title = `${article.title} – Proyecto Antracnosis`;
    return () => {
      document.title = 'Proyecto Antracnosis – Fitopatología del Café';
    };
  }, [article]);

  // Si se llega con #comentarios (p. ej. tras iniciar sesión), desplaza hasta esa sección.
  useEffect(() => {
    if (article && window.location.hash) {
      requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView({ block: 'start' }));
    }
  }, [article]);

  if (loading) {
    return (
      <MainLayout>
        <div className="article__state">
          <Spinner size={24} />
        </div>
      </MainLayout>
    );
  }

  if (error || !article) {
    return (
      <MainLayout>
        <div className="container article__state">
          <Heading as="h1" size="lg">
            Artículo no encontrado
          </Heading>
          <Text>Puede que haya sido retirado o que el enlace sea incorrecto.</Text>
          <Button to="/blog">Ver todos los artículos</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <article>
        <header className="article__header">
          <div className="container article__narrow">
            <Link to="/blog" className="article__back">
              <Icon name="arrow-left" size={16} /> Todos los artículos
            </Link>
            <p className="article__category">{article.category}</p>
            <Heading as="h1" size="xl" className="article__title">
              {article.title}
            </Heading>
            {article.subtitle && <Text size="lg">{article.subtitle}</Text>}
            <div className="article__byline">
              <span>Equipo Proyecto Antracnosis</span>
              <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
              <span>
                <Icon name="clock" size={14} /> {article.read_minutes} min de lectura
              </span>
            </div>
            {isAdmin && (
              <div className="article__admin">
                {!article.published && <Alert tone="info">Borrador: solo los administradores pueden verlo.</Alert>}
                <Button to={`/admin/articulos/${article.id}`} variant="secondary" size="sm">
                  <Icon name="edit" size={15} /> Editar artículo
                </Button>
              </div>
            )}
          </div>
        </header>

        <div className="container article__narrow article__body">
          {article.image_url && (
            <figure className="article__figure">
              <img src={article.image_url} alt="" width="1200" height="675" />
              <figcaption>Imagen ilustrativa; no constituye una muestra diagnóstica.</figcaption>
            </figure>
          )}
          <div className="prose">{renderMarkdown(article.content)}</div>

          <aside className="article__note">
            Material educativo. La identificación del patógeno y cualquier tratamiento requieren asesoría profesional y
            cumplimiento de las indicaciones locales.
          </aside>

          {(article.source_text || article.source_url) && (
            <div className="article__sources">
              <Heading as="h2" size="md" tone="brand">
                Fuentes y lecturas
              </Heading>
              {article.source_url ? (
                <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                  {article.source_text || article.source_url} <Icon name="arrow-up-right" size={14} />
                </a>
              ) : (
                <Text size="sm">{article.source_text}</Text>
              )}
            </div>
          )}

          <CommentSection articleId={article.id} />
        </div>
      </article>
    </MainLayout>
  );
}
