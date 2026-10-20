import { Eyebrow, Heading, Text } from '../atoms';
import './PageHero.css';

export function PageHero({ label, title, description, children }) {
  return (
    <section className="page-hero">
      <div className="container">
        {label && <Eyebrow>{label}</Eyebrow>}
        <Heading as="h1" size="xl">
          {title}
        </Heading>
        {description && <Text className="page-hero__desc">{description}</Text>}
        {children}
      </div>
    </section>
  );
}
