import { Dot, Heading, Text } from '../atoms';
import './InfoCard.css';

/**
 * Tarjeta genérica: síntomas, integrantes, misión/visión, métricas, tecnologías.
 * marker: 'dot' | texto (p. ej. "01") — titleTone resalta el título en color de marca.
 */
export function InfoCard({ marker, markerTone = 'brand', markerColor, title, titleTone = 'default', text, textTone = 'muted', serifTitle = false }) {
  return (
    <article className="info-card">
      {marker === 'dot' ? (
        <Dot color={markerColor} size={markerColor ? 12 : undefined} />
      ) : marker ? (
        <span className={`info-card__number tone--${markerTone}`}>{marker}</span>
      ) : null}
      <Heading as="h3" size="sm" serif={serifTitle} tone={titleTone}>
        {title}
      </Heading>
      {text && (
        <Text size="sm" tone={textTone}>
          {text}
        </Text>
      )}
    </article>
  );
}
