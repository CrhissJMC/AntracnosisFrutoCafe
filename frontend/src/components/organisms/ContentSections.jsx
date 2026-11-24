import { InfoCard, ListColumn, StepItem } from '../molecules';
import { pad2 } from '../../lib/format.js';
import { Grid, Section } from './Section.jsx';
import './ContentSections.css';

/**
 * Secciones genéricas para bloques de contenido editables (title + body).
 * Se usan en Inicio y en Metodología: se definen una vez y se reutilizan.
 * `children` se muestra debajo de la rejilla (p. ej., una nota destacada).
 */

/** Tarjetas. marker: 'dot' | 'number' | null · markerColors: color del punto por posición (p. ej., semáforo). */
export function CardGridSection({ title, items, marker = 'dot', markerColors, min = 220, tone = 'default', id, children }) {
  return (
    <Section title={title} tone={tone} id={id}>
      <Grid min={min}>
        {items.map((i, idx) => (
          <InfoCard
            key={i.id}
            marker={marker === 'number' ? pad2(idx + 1) : marker}
            markerColor={markerColors?.[idx]}
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

/**
 * Resultados de los modelos: una tarjeta por modelo con una métrica por línea («Nombre: valor»).
 * Las líneas sin «:» se muestran como nota; un título con «en uso» resalta la tarjeta.
 */
export function ResultsSection({ title, items, tone = 'default', id, children }) {
  return (
    <Section title={title} tone={tone} id={id}>
      <Grid min={230}>
        {items.map((i) => {
          const lines = i.body.split('\n').map((l) => l.trim()).filter(Boolean);
          const rows = lines.filter((l) => l.includes(':')).map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]);
          const notes = lines.filter((l) => !l.includes(':'));
          const inUse = /en uso/i.test(i.title);
          const [name, ...tags] = i.title.split('·').map((t) => t.trim());
          return (
            <article key={i.id} className={`result-card ${inUse ? 'is-in-use' : ''}`}>
              <h3 className="result-card__title">
                {name}
                {tags.map((t) => (
                  <span key={t} className="result-card__tag">
                    {t}
                  </span>
                ))}
              </h3>
              <dl className="result-card__list">
                {rows.map(([k, v]) => (
                  <div key={k} className="result-card__row">
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              {notes.map((n) => (
                <p key={n} className="result-card__note">
                  {n}
                </p>
              ))}
            </article>
          );
        })}
      </Grid>
      {children && <div className="content-section__extra">{children}</div>}
    </Section>
  );
}
