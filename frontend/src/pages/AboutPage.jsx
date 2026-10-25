import { MainLayout } from '../components/templates';
import { MissionSection, PageHero, TeamSection, UniversitySection } from '../components/organisms';
import { useSite } from '../context/SiteContext.jsx';

export function AboutPage() {
  const { settings: s, section } = useSite();
  return (
    <MainLayout>
      <PageHero label="Nosotros" title={s.nosotros_title} description={s.nosotros_desc} />
      <MissionSection items={section('mision')} />
      <UniversitySection name={s.univ_title} description={s.univ_desc} items={section('universidad')} />
      <TeamSection members={section('equipo')} advisor={s.docente} />
    </MainLayout>
  );
}
