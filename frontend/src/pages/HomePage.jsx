import { MainLayout } from '../components/templates';
import { CycleSection, Hero, ManagementSection, SymptomsSection, WhatIsSection } from '../components/organisms';
import { useSite } from '../context/SiteContext.jsx';

export function HomePage() {
  const { settings: s, section } = useSite();
  return (
    <MainLayout>
      <Hero label={s.hero_label} title={s.hero_title} description={s.hero_desc} image={s.hero_image} />
      <WhatIsSection text={s.que_es} />
      <SymptomsSection items={section('sintomas')} />
      <CycleSection items={section('ciclo')} />
      <ManagementSection items={section('manejo')} />
    </MainLayout>
  );
}
