import { Callout } from '../components/molecules';
import { CallToAction, CardGridSection, ListColumnsSection, PageHero, ResultsSection, StepsSection } from '../components/organisms';
import { MainLayout } from '../components/templates';
import { useSite } from '../context/SiteContext.jsx';
import { HEALTH_COLORS } from '../lib/traceability.js';

/**
 * Metodología: problema → clases → arquitectura → evaluación → resultados → ciclo del conocimiento →
 * tecnologías → alcance → estado actual → limitaciones.
 */
export function MethodologyPage() {
  const { settings: s, section } = useSite();
  return (
    <MainLayout>
      <PageHero label="Metodología" title={s.metodo_title} description={s.metodo_desc} />

      <CardGridSection title="El problema" id="problema" items={section('problema')} min={240}>
        {s.metodo_propuesta && <Callout label="Propuesta">{s.metodo_propuesta}</Callout>}
      </CardGridSection>

      <CardGridSection
        title="Estado sanitario del fruto"
        tone="alt"
        id="clases"
        items={section('clases')}
        markerColors={HEALTH_COLORS}
        min={260}
      />

      <StepsSection title="Arquitectura experimental" id="arquitectura" items={section('flujo')}>
        {s.metodo_flujo_nota && <Callout label="Partición de los datos">{s.metodo_flujo_nota}</Callout>}
      </StepsSection>

      <CardGridSection title="Evaluación del desempeño" tone="alt" id="evaluacion" items={section('metricas')} marker={null}>
        {s.metodo_metricas_nota && <Callout label="Meta del proyecto">{s.metodo_metricas_nota}</Callout>}
      </CardGridSection>

      {section('resultados').length > 0 && (
        <ResultsSection title="Resultados obtenidos" id="resultados" items={section('resultados')}>
          {s.metodo_resultados_nota && <Callout label="Cómo leerlos">{s.metodo_resultados_nota}</Callout>}
        </ResultsSection>
      )}

      {section('conocimiento').length > 0 && (
        <StepsSection title="Ciclo de gestión del conocimiento" tone="alt" id="conocimiento" items={section('conocimiento')}>
          {s.metodo_conocimiento_nota && <Callout label="Modelo SECI">{s.metodo_conocimiento_nota}</Callout>}
        </StepsSection>
      )}

      <CardGridSection title="Tecnologías y herramientas" id="tecnologias" items={section('tecnologias')} marker="number" min={200} />

      <ListColumnsSection title="Alcance del proyecto" id="alcance" items={section('alcance')} min={320} />

      {section('estado').length > 0 && (
        <StepsSection title="Qué estamos haciendo ahora" tone="alt" id="estado" items={section('estado')} />
      )}

      {section('limitaciones').length > 0 && (
        <CardGridSection title="Limitaciones" id="limitaciones" items={section('limitaciones')} marker="number" min={280} />
      )}

      <CallToAction
        id="repositorio"
        eyebrow="Repositorio"
        title={s.metodo_repo_title}
        text={s.metodo_repo_text}
        href={s.metodo_repo_url}
        label="Ver repositorio en GitHub"
      />
    </MainLayout>
  );
}
