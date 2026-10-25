import { Callout } from '../components/molecules';
import { CardGridSection, ListColumnsSection, PageHero, StepsSection } from '../components/organisms';
import { MainLayout } from '../components/templates';
import { useSite } from '../context/SiteContext.jsx';

/** Metodología del proyecto: problema → arquitectura → evaluación → tecnologías → alcance. */
export function MethodologyPage() {
  const { settings: s, section } = useSite();
  return (
    <MainLayout>
      <PageHero label="Metodología" title={s.metodo_title} description={s.metodo_desc} />

      <CardGridSection title="El problema" id="problema" items={section('problema')} min={260}>
        {s.metodo_propuesta && <Callout label="Propuesta">{s.metodo_propuesta}</Callout>}
      </CardGridSection>

      <StepsSection title="Arquitectura experimental" tone="alt" id="arquitectura" items={section('flujo')}>
        {s.metodo_flujo_nota && <Callout label="Partición de los datos">{s.metodo_flujo_nota}</Callout>}
      </StepsSection>

      <CardGridSection title="Evaluación del desempeño" id="evaluacion" items={section('metricas')} marker={null}>
        {s.metodo_metricas_nota && <Callout label="Matriz de confusión">{s.metodo_metricas_nota}</Callout>}
      </CardGridSection>

      <CardGridSection title="Tecnologías y herramientas" tone="alt" id="tecnologias" items={section('tecnologias')} marker="number" min={200} />

      <ListColumnsSection title="Alcance del proyecto" id="alcance" items={section('alcance')} min={320} />
    </MainLayout>
  );
}
