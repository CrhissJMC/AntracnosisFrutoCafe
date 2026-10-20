import { ContactItem } from '../components/molecules';
import { ContactForm, PageHero, Section } from '../components/organisms';
import { MainLayout } from '../components/templates';
import { useSite } from '../context/SiteContext.jsx';
import './ContactPage.css';

export function ContactPage() {
  const { settings: s } = useSite();
  return (
    <MainLayout>
      <PageHero label="Contacto" title="Hablemos" description="¿Tienes preguntas o quieres colaborar? Déjanos un mensaje." />
      <Section>
        <div className="contact-page">
          <div className="contact-page__info">
            <ContactItem icon="mail" label="Correo">
              <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>
            </ContactItem>
            <ContactItem icon="pin" label="Ubicación">
              {s.contact_location}
            </ContactItem>
            <ContactItem icon="clock" label="Horario de atención">
              {s.contact_hours}
            </ContactItem>
          </div>
          <ContactForm />
        </div>
      </Section>
    </MainLayout>
  );
}
