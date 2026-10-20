import { Heading } from '../atoms';
import { InfoCard, ListColumn, StepItem } from '../molecules';
import { renderMarkdown } from '../../lib/markdown.jsx';
import { Grid, Section } from './Section.jsx';
import './HomeSections.css';

export function WhatIsSection({ text }) {
  return (
    <Section className="what-is">
      <div className="what-is__grid">
        <Heading as="h2" size="lg" tone="brand">
          ¿Qué es?
        </Heading>
        <div className="what-is__text">{renderMarkdown(text)}</div>
      </div>
    </Section>
  );
}

export function SymptomsSection({ items }) {
  return (
    <Section title="Síntomas en el fruto" tone="alt" id="sintomas">
      <Grid min={220}>
        {items.map((i) => (
          <InfoCard key={i.id} marker="dot" title={i.title} text={i.body} />
        ))}
      </Grid>
    </Section>
  );
}

export function CycleSection({ items }) {
  return (
    <Section title="Ciclo de la enfermedad" id="ciclo">
      <Grid as="ol" min={200} gap="lg">
        {items.map((i, idx) => (
          <StepItem key={i.id} index={idx + 1} title={i.title} text={i.body} />
        ))}
      </Grid>
    </Section>
  );
}

export function ManagementSection({ items }) {
  return (
    <Section title="Manejo integrado" tone="dark" id="manejo">
      <Grid min={200} gap="lg">
        {items.map((i) => (
          <ListColumn key={i.id} title={i.title} items={i.body.split('\n').map((l) => l.trim()).filter(Boolean)} />
        ))}
      </Grid>
    </Section>
  );
}
