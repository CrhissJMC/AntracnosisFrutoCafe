import { Button, Eyebrow, Heading, Text } from '../atoms';
import { renderInline } from '../../lib/markdown.jsx';
import './Hero.css';

export function Hero({ label, title, description, image }) {
  return (
    <section className="hero" style={image ? { '--hero-image': `url("${encodeURI(image)}")` } : undefined}>
      <div className="hero__overlay" aria-hidden="true" />
      <div className="container hero__content">
        <Eyebrow tone="inverse-muted">{label}</Eyebrow>
        <Heading as="h1" size="display" tone="inverse">
          {title}
        </Heading>
        <Text size="lg" tone="inverse-muted" className="hero__desc">
          {renderInline(description)}
        </Text>
        <div className="hero__actions">
          <Button to="/servicios">Ver servicios</Button>
          <Button to="/blog" variant="outline-light">
            Leer el blog
          </Button>
        </div>
      </div>
    </section>
  );
}
