import { Heading } from '../atoms';
import { renderMarkdown } from '../../lib/markdown.jsx';
import { CardGridSection, ListColumnsSection, StepsSection } from './ContentSections.jsx';
import { Section } from './Section.jsx';
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

// Las secciones de Inicio son las secciones genéricas con su título y estilo.
export const SymptomsSection = ({ items }) => <CardGridSection title="Síntomas en el fruto" tone="alt" id="sintomas" items={items} />;
export const CycleSection = ({ items }) => <StepsSection title="Ciclo de la enfermedad" id="ciclo" items={items} />;
export const ManagementSection = ({ items }) => <ListColumnsSection title="Manejo integrado" id="manejo" items={items} />;
