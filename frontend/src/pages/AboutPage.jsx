import { MainLayout } from '../components/templates';
import { MissionSection, PageHero, TeamSection } from '../components/organisms';
import { useSite } from '../context/SiteContext.jsx';

export function AboutPage() {
  const { settings: s, section } = useSite();
  return (
    <MainLayout>
      <PageHero label="Nosotros" title={s.nosotros_title} description={s.nosotros_desc} />
      <MissionSection items={section('mision')} />
      <TeamSection members={section('equipo')} advisor={s.docente} />
    </MainLayout>
  );
}
