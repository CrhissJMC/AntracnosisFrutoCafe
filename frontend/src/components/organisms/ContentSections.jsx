import { InfoCard, ListColumn, StepItem } from '../molecules';
import { pad2 } from '../../lib/format.js';
import { Grid, Section } from './Section.jsx';
import './ContentSections.css';

/**
 * Secciones genéricas para bloques de contenido editables (title + body).
 * Se usan en Inicio y en Metodología: se definen una vez y se reutilizan.
 * `children` se muestra debajo de la rejilla (p. ej., una nota destacada).
 */

/** Tarjetas. marker: 'dot' | 'number' | null */
export function CardGridSection({ title, items, marker = 'dot', min = 220, tone = 'default', id, children }) {
  return (
    <Section title={title} tone={tone} id={id}>
      <Grid min={min}>
        {items.map((i, idx) => (
          <InfoCard
            key={i.id}
            marker={marker === 'number' ? pad2(idx + 1) : marker}
            markerTone="muted"
            title={i.title}
            titleTone={marker ? 'default' : 'brand'}
            text={i.body}
          />
        ))}
      </Grid>
      {children && <div className="content-section__extra">{children}</div>}
    </Section>
  );
}

/** Pasos numerados (01, 02…). */
export function StepsSection({ title, items, tone = 'default', id, children }) {
  return (
    <Section title={title} tone={tone} id={id}>
      <Grid as="ol" min={200} gap="lg">
        {items.map((i, idx) => (
          <StepItem key={i.id} index={idx + 1} title={i.title} text={i.body} />
        ))}
      </Grid>
      {children && <div className="content-section__extra">{children}</div>}
    </Section>
  );
}

/** Columnas con lista (un punto por línea del texto), pensadas para fondo oscuro. */
export function ListColumnsSection({ title, items, tone = 'dark', id, min = 200 }) {
  return (
    <Section title={title} tone={tone} id={id}>
      <Grid min={min} gap="lg">
        {items.map((i) => (
          <ListColumn key={i.id} title={i.title} items={i.body.split('\n').map((l) => l.trim()).filter(Boolean)} />
        ))}
      </Grid>
    </Section>
  );
}
