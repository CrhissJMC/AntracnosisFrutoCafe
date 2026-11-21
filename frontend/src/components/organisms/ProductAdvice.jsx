import { Icon, Text } from '../atoms';
import { useSite } from '../../context/SiteContext.jsx';
import { healthClass, productAdvice } from '../../lib/diagnosis.js';
import './ProductAdvice.css';

/**
 * Productos y abonos de apoyo para un resultado (fungicidas, abonos, bioinsumos…). El texto se edita en el
 * panel → Contenido → Productos de apoyo; cada línea «Tipo: detalle» es una recomendación.
 */
export function ProductAdvice({ clase }) {
  const { section } = useSite();
  const lines = productAdvice(section('productos'), clase);
  if (!lines.length) return null;
  const cls = healthClass(clase);

  return (
    <section className="product-advice" style={{ '--pa-color': cls?.color }} aria-label={`Productos de apoyo: ${cls?.short ?? clase}`}>
      <p className="product-advice__title">
        <Icon name="layers" size={16} /> Productos y abonos de apoyo · <span className="product-advice__class">{cls?.short ?? clase}</span>
      </p>
      <ul className="product-advice__list">
        {lines.map(({ label, text }, i) => (
          <li key={i}>
            {label && <strong>{label}: </strong>}
            {text}
          </li>
        ))}
      </ul>
      <Text size="sm" className="product-advice__note">
        Recomendaciones generales y sin dosis: la dosis la fija la etiqueta del producto registrado, y el plan, un
        ingeniero agrónomo.
      </Text>
    </section>
  );
}
