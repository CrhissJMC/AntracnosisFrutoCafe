import { Heading, Icon, Link, Tag, Text } from '../atoms';
import { formatDate } from '../../lib/format.js';
import './BlogCard.css';

export function BlogCard({ article }) {
  const href = `/blog/${article.slug}`;
  return (
    <article className="blog-card">
      <Link to={href} className="blog-card__media" tabIndex={-1} aria-hidden="true">
        {article.image_url ? (
          <img src={article.image_url} alt="" loading="lazy" width="600" height="338" />
        ) : (
          <span className="blog-card__placeholder" />
        )}
      </Link>
      <div className="blog-card__body">
        <div className="blog-card__meta">
          <Tag>{article.category}</Tag>
          <span className="blog-card__read">
            <Icon name="clock" size={14} /> {article.read_minutes} min de lectura
          </span>
        </div>
        <Heading as="h3" size="sm" className="blog-card__title">
          <Link to={href} className="blog-card__link">
            {article.title}
          </Link>
        </Heading>
        <Text size="sm" className="blog-card__excerpt">
          {article.subtitle}
        </Text>
        <div className="blog-card__footer">
          <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
          <span className="blog-card__comments">
            <Icon name="chat" size={14} /> {article.comment_count}
            <span className="visually-hidden"> comentarios</span>
          </span>
        </div>
      </div>
    </article>
  );
}
