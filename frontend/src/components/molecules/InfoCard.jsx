import { Dot, Heading, Text } from '../atoms';
import './InfoCard.css';

/**
 * Tarjeta genérica: síntomas, servicios, integrantes, misión/visión.
 * marker: 'dot' | texto (p. ej. "01") — titleTone resalta el título en color de marca.
 */
export function InfoCard({ marker, markerTone = 'brand', title, titleTone = 'default', text, textTone = 'muted', serifTitle = false }) {
  return (
    <article className="info-card">
      {marker === 'dot' ? (
        <Dot />
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
