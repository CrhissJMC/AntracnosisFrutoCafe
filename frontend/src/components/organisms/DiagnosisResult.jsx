import { Badge, Heading, ProgressBar, Text } from '../atoms';
import { Alert, HealthLight, ImageFrame, ProbabilityList } from '../molecules';
import { healthClass } from '../../lib/diagnosis.js';
import './DiagnosisResult.css';

const pct = (p) => `${Math.round(p * 100)} %`;
const seconds = (ms) => `${(ms / 1000).toLocaleString('es-PE', { maximumFractionDigits: 1 })} s`;

/** Resultado de un modelo: semáforo, resultado, probabilidad de antracnosis con sus umbrales, Grad-CAM y descripción. */
export function DiagnosisResult({ result, photo, descriptions = {}, compact = false }) {
  if (!result.available) {
    return (
      <article className="dx-result">
        <p className="dx-result__model">{result.name}</p>
        <Alert tone="info">Este modelo todavía no está entrenado.</Alert>
      </article>
    );
  }
  const cls = healthClass(result.class);
  const info = descriptions[result.class] ?? {};
  const { inferior, superior } = result.thresholds ?? {};

  return (
    <article className={`dx-result ${compact ? 'dx-result--compact' : ''}`} style={{ '--dx-color': cls?.color }}>
      <div className="dx-result__head">
        <p className="dx-result__model">
          {result.name} · {result.version}
        </p>
        <Badge tone="neutral">{seconds(result.time_ms)}</Badge>
      </div>

      <HealthLight value={result.class} />

      <div>
        <Heading as="h3" size="md" serif={false} className="dx-result__class">
          {cls?.label ?? result.class}
        </Heading>
        <div className="dx-result__conf">
          <span>Probabilidad de antracnosis</span>
          <strong>{pct(result.probability)}</strong>
        </div>
        <ProgressBar value={result.probability * 100} color={cls?.color} label="Probabilidad de antracnosis" />
        {inferior != null && (
          <p className="dx-result__thresholds">
            Sano bajo {pct(inferior)} · Revisar entre ambos · Antracnosis desde {pct(superior)}
          </p>
        )}
      </div>

      {result.class === 'revisar' && (
        <Alert tone="warning">
          El modelo no está seguro: la probabilidad quedó entre los dos umbrales. Toma otra foto siguiendo la guía de captura;
          el caso queda para que lo revise un especialista.
        </Alert>
      )}

      <div className="dx-result__images">
        <ImageFrame src={photo} alt="Foto analizada" caption="Foto" />
        <ImageFrame
          src={result.gradcam}
          alt="Mapa Grad-CAM: zonas que más influyeron en la decisión"
          caption="Zona analizada (Grad-CAM)"
          placeholder="Grad-CAM no disponible"
        />
      </div>

      {!compact && <ProbabilityList probabilities={result.probabilities} />}

      {(info.criterion || info.action) && (
        <div className="dx-result__desc">
          {info.criterion && (
            <Text size="sm" tone="default">
              <strong>Qué se observa:</strong> {info.criterion}
            </Text>
          )}
          {info.action && (
            <Text size="sm" tone="default">
              <strong>Qué hacer:</strong> {info.action}
            </Text>
          )}
        </div>
      )}
    </article>
  );
}
