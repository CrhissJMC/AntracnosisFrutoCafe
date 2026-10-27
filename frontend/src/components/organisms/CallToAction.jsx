import { Button, Eyebrow, Heading, Icon, Text } from '../atoms';
import { Section } from './Section.jsx';
import './CallToAction.css';

const isHttpUrl = (url) => /^https?:\/\//i.test(url ?? '');

/** Llamada a la acción: texto + botón hacia un enlace (externo o interno). Sin enlace válido no se muestra. */
export function CallToAction({ eyebrow, title, text, href, label = 'Ver más', icon = 'arrow-up-right', tone = 'default', id }) {
  if (!title || !(isHttpUrl(href) || href?.startsWith('/'))) return null;
  return (
    <Section tone={tone} id={id}>
      <div className="cta">
        <div className="cta__text">
          {eyebrow && <Eyebrow tone="brand">{eyebrow}</Eyebrow>}
          <Heading as="h2" size="lg">
            {title}
          </Heading>
          {text && <Text>{text}</Text>}
        </div>
        <Button to={href} className="cta__button">
          {label} <Icon name={icon} size={16} />
        </Button>
      </div>
    </Section>
  );
}
