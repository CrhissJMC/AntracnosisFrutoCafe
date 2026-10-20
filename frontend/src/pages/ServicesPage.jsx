import { MainLayout } from '../components/templates';
import { Grid, PageHero, Section } from '../components/organisms';
import { InfoCard } from '../components/molecules';
import { useSite } from '../context/SiteContext.jsx';
import { pad2 } from '../lib/format.js';

export function ServicesPage() {
  const { settings: s, section } = useSite();
  return (
    <MainLayout>
      <PageHero label="Servicios" title={s.servicios_title} description={s.servicios_desc} />
      <Section>
        <Grid min={280}>
          {section('servicios').map((item, i) => (
            <InfoCard key={item.id} marker={pad2(i + 1)} title={item.title} text={item.body} />
          ))}
        </Grid>
      </Section>
    </MainLayout>
  );
}
