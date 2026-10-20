import { BlogCard, EmptyState } from '../molecules';
import { Grid } from './Section.jsx';

export function BlogGrid({ articles }) {
  if (!articles.length) {
    return <EmptyState icon="doc" title="Aún no hay artículos publicados" />;
  }
  return (
    <Grid min={290} gap="md">
      {articles.map((a) => (
        <BlogCard key={a.id} article={a} />
      ))}
    </Grid>
  );
}
