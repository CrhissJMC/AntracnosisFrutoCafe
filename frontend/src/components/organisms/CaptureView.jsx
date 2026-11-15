import { useState } from 'react';
import { Badge, Button, Icon, Text } from '../atoms';
import { HealthLight, ImageFrame } from '../molecules';
import { api } from '../../lib/api.js';
import { formatDateTime } from '../../lib/format.js';
import { captureImageUrl, classTone, MODEL_NAMES, validationLabel, validatorLabel } from '../../lib/modulo.js';
import './CaptureView.css';

const pct = (p) => `${Math.round(Number(p) * 100)} %`;

/** Encabezado, foto, Grad-CAM y resultado de cada modelo de una captura guardada (validación e historial). */
export function CaptureView({ capture }) {
  const [gradcam, setGradcam] = useState({});
  const current = capture.historial[0];

  const loadGradcam = async (model) => {
    setGradcam((g) => ({ ...g, [model]: { loading: true } }));
    try {
      const r = await api.post(`/diagnostico/capturas/${capture.id}/gradcam`, { model });
      setGradcam((g) => ({ ...g, [model]: { src: r.gradcam } }));
    } catch (err) {
      setGradcam((g) => ({ ...g, [model]: { error: err.message } }));
    }
  };
  const shown = Object.entries(gradcam).find(([, g]) => g.src);

  return (
    <>
      <header className="cap-view__head">
        <div>
          <p className="cap-view__title">Captura N.º {capture.id}</p>
          <Text size="sm">
            {formatDateTime(capture.tomada_en)} · {capture.autor ?? 'Usuario eliminado'}
            {capture.latitud !== null && ` · Ubicación ${Number(capture.latitud).toFixed(4)}, ${Number(capture.longitud).toFixed(4)}`}
          </Text>
        </div>
        {current ? (
          <Badge tone={classTone(current.clase_confirmada)}>Vigente: {validationLabel(current.clase_confirmada)}</Badge>
        ) : (
          <Badge tone="warning">Sin validar</Badge>
        )}
      </header>

      <div className="cap-view__images">
        <ImageFrame src={captureImageUrl(capture.id)} alt={`Foto de la captura ${capture.id}`} caption="Foto" />
        <ImageFrame
          src={shown?.[1].src}
          alt="Mapa Grad-CAM: zonas que más influyeron en el resultado"
          caption={shown ? `Grad-CAM · ${MODEL_NAMES[shown[0]]}` : 'Grad-CAM'}
          placeholder="Pídelo con el botón de cada modelo"
        />
      </div>

      <div className="cap-view__models">
        {capture.diagnosticos.map((d) => (
          <div key={d.id} className="cap-view__model">
            <div className="cap-view__model-head">
              <strong>{MODEL_NAMES[d.modelo] ?? d.modelo}</strong>
              <Text size="sm">versión {d.version}</Text>
            </div>
            <HealthLight value={d.resultado} />
            <Text size="sm">
              Probabilidad de antracnosis: <strong>{pct(d.prob_antracnosis)}</strong> (umbrales {pct(d.umbral_inferior)} y{' '}
              {pct(d.umbral_superior)})
            </Text>
            <Button size="sm" variant="ghost" onClick={() => loadGradcam(d.modelo)} loading={gradcam[d.modelo]?.loading}>
              <Icon name="eye" size={16} /> Ver Grad-CAM
            </Button>
            {gradcam[d.modelo]?.error && (
              <Text size="sm" className="cap-view__error">
                {gradcam[d.modelo].error}
              </Text>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/** Historial de validaciones de una captura; la primera es la vigente. */
export function ValidationHistory({ history }) {
  return (
    <div className="cap-view__history">
      <p className="cap-view__subtitle">Historial de validaciones</p>
      {history.length === 0 ? (
        <Text size="sm">Todavía nadie validó esta captura.</Text>
      ) : (
        <ol className="cap-view__history-list">
          {history.map((h, i) => (
            <li key={h.id} className="cap-view__history-item">
              <div className="cap-view__history-line">
                <Badge tone={classTone(h.clase_confirmada)}>{validationLabel(h.clase_confirmada)}</Badge>
                <span>
                  {validatorLabel(h.perfil_validador)} · <strong>{h.validador_nombre}</strong>
                </span>
                {i === 0 && <Badge tone="info">Vigente</Badge>}
              </div>
              <Text size="sm">{formatDateTime(h.created_at)}</Text>
              {h.comentario && <p className="cap-view__comment">{h.comentario}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
