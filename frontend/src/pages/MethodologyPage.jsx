import { Callout } from '../components/molecules';
import { CallToAction, CardGridSection, ListColumnsSection, PageHero, StepsSection } from '../components/organisms';
import { MainLayout } from '../components/templates';
import { useSite } from '../context/SiteContext.jsx';
import { HEALTH_COLORS } from '../lib/traceability.js';

/** Metodología: problema → clases → arquitectura → evaluación → tecnologías → alcance. */
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

      <CardGridSection title="Tecnologías y herramientas" id="tecnologias" items={section('tecnologias')} marker="number" min={200} />

      <ListColumnsSection title="Alcance del proyecto" id="alcance" items={section('alcance')} min={320} />

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
