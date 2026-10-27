import { Section } from '../organisms';
import { MainLayout } from './MainLayout.jsx';
import './DiagnosisLayout.css';

/**
 * Plantilla del módulo de diagnóstico (sin datos): cabecera + dos columnas,
 * captura a la izquierda y resultado a la derecha. En el teléfono se apilan.
 */
export function DiagnosisLayout({ hero, form, result }) {
  return (
    <MainLayout>
      {hero}
      <Section tone="alt">
        <div className="dx-layout">
          <div className="dx-layout__card dx-layout__form">{form}</div>
          <div className="dx-layout__card dx-layout__result">{result}</div>
        </div>
      </Section>
    </MainLayout>
  );
}
