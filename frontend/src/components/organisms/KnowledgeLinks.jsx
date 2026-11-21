import { Icon, Link, Spinner, Text } from '../atoms';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { healthClass } from '../../lib/diagnosis.js';
import './KnowledgeLinks.css';

const FICHA = 'FICHA DE MANEJO';

/**
 * Base de conocimiento (RF07): fichas de manejo y artículos del blog vinculados a un resultado.
 * La ficha de manejo va primero y resaltada; luego hasta `limit - 1` lecturas relacionadas.
 */
export function KnowledgeLinks({ clase, limit = 3, title = 'Fichas de manejo' }) {
  const { data, loading, error } = useAsync(
    () => (clase ? api.get(`/articles?clase=${clase}&limit=${limit}`).then((d) => d.articles) : Promise.resolve([])),
    [clase, limit],
  );
  if (!clase || error || (data && data.length === 0)) return null;
  const cls = healthClass(clase);

  return (
    <section className="kb-links" style={{ '--kb-color': cls?.color }} aria-label={`${title}: ${cls?.short ?? clase}`}>
      <p className="kb-links__title">
        <Icon name="doc" size={16} /> {title} · <span className="kb-links__class">{cls?.short ?? clase}</span>
      </p>
      {loading && <Spinner size={18} label="Cargando fichas" />}
      {data && (
        <ul className="kb-links__list">
          {data.map((a) => {
            const ficha = a.category === FICHA;
            return (
              <li key={a.id}>
                <Link to={`/blog/${a.slug}`} className={`kb-link ${ficha ? 'kb-link--ficha' : ''}`}>
                  <span className="kb-link__kind">{ficha ? 'Ficha de manejo' : 'Lectura relacionada'}</span>
                  <span className="kb-link__title">{a.title}</span>
                  <span className="kb-link__meta">
                    <Icon name="clock" size={13} /> {a.read_minutes} min
                    <span aria-hidden="true"> · </span>
                    <Icon name="chat" size={13} /> {a.comment_count}
                    <span className="visually-hidden"> comentarios</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <Text size="sm" className="kb-links__note">
        Puedes comentar cada ficha y compartir tu experiencia con otros productores.
      </Text>
    </section>
  );
}
