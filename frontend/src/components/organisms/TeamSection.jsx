import { Eyebrow, Heading } from '../atoms';
import { InfoCard } from '../molecules';
import { pad2 } from '../../lib/format.js';
import { Grid, Section } from './Section.jsx';
import './TeamSection.css';

export function MissionSection({ items }) {
  return (
    <Section>
      <Grid min={260}>
        {items.map((i) => (
          <InfoCard key={i.id} title={i.title} titleTone="brand" text={i.body} />
        ))}
      </Grid>
    </Section>
  );
}

export function TeamSection({ members, advisor }) {
  return (
    <Section title="Equipo" titleTone="default" tone="alt" id="equipo">
      <Grid min={220}>
        {members.map((m, idx) => (
          <InfoCard key={m.id} marker={pad2(idx + 1)} markerTone="muted" title={m.title} text={m.body} textTone="brand" />
        ))}
      </Grid>
      {advisor && (
        <div className="team__advisor">
          <Eyebrow tone="brand">Docente asesor</Eyebrow>
          <Heading as="p" size="lg">
            {advisor}
          </Heading>
        </div>
      )}
    </Section>
  );
}
