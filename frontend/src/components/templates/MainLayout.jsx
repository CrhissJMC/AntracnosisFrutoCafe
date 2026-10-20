import { Footer, Navbar } from '../organisms';
import './Layouts.css';

/** Plantilla pública: barra de navegación + contenido + pie de página. */
export function MainLayout({ children }) {
  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" className="main-layout page-enter">
        {children}
      </main>
      <Footer />
    </>
  );
}
