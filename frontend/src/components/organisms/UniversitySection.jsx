import { Eyebrow, Heading, Text } from '../atoms';
import { InfoCard } from '../molecules';
import { Grid, Section } from './Section.jsx';
import './UniversitySection.css';

/** Presentación de la universidad: nombre + descripción a la izquierda, datos en tarjetas a la derecha. */
export function UniversitySection({ name, description, items }) {
  if (!name && !description && !items.length) return null;
  return (
    <Section tone="default" id="universidad" className="university">
      <div className="university__layout">
        <div className="university__intro">
          <Eyebrow tone="brand">Nuestra universidad · UNTRM</Eyebrow>
          {name && (
            <Heading as="h2" size="lg" id="universidad-title">
              {name}
            </Heading>
          )}
          {description && <Text>{description}</Text>}
        </div>
        <Grid min={220} className="university__facts">
          {items.map((i) => (
            <InfoCard key={i.id} marker="dot" title={i.title} titleTone="brand" text={i.body} />
          ))}
        </Grid>
      </div>
    </Section>
  );
}
