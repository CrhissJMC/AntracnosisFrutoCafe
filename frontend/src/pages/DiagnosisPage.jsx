import { useMemo, useState } from 'react';
import { Button, Icon, Text } from '../components/atoms';
import { Alert, Callout } from '../components/molecules';
import { DiagnosisPanel, ImageCapture, ModelPicker, PageHero } from '../components/organisms';
import { DiagnosisLayout } from '../components/templates';
import { useAuth } from '../context/AuthContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../lib/api.js';
import { classDescriptions } from '../lib/diagnosis.js';
import './DiagnosisPage.css';

const DEFAULT_MODEL = 'efficientnet_b0';

/** Nuevo diagnóstico: foto del fruto → modelo → resultado con semáforo y descripción. */
export function DiagnosisPage() {
  const { user } = useAuth();
  const { section } = useSite();
  const models = useAsync(() => api.get('/diagnostico/modelos'), []);
  const descriptions = useMemo(() => classDescriptions(section('clases')), [section]);

  const [photo, setPhoto] = useState(null);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [status, setStatus] = useState('idle');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState('');

  const changePhoto = (value) => {
    setPhoto(value);
    setStatus('idle');
    setResponse(null);
    setFormError('');
  };

  const analyze = async () => {
    if (!photo) return setFormError('Primero toma o sube una foto del fruto.');
    setFormError('');
    setStatus('loading');
    try {
      setResponse(await api.post('/diagnostico/analizar', { image: photo, model }));
      setStatus('done');
    } catch (err) {
      setError({ message: err.message, unavailable: err.status === 503 });
      setStatus('error');
    }
  };

  const list = models.data?.models ?? [];
  const anyReady = list.some((m) => m.available);

  return (
    <DiagnosisLayout
      hero={
        <PageHero
          label="Módulo de diagnóstico"
          title="Diagnóstico de antracnosis"
          description="Fotografía un fruto de café, elige el modelo y obtén su estado sanitario con la recomendación de manejo."
        />
      }
      form={
        <div className="dx-form">
          <div className="dx-form__step">
            <p className="dx-form__title">
              <span>1</span> Fotografía del fruto
            </p>
            <ImageCapture value={photo} onChange={changePhoto} disabled={status === 'loading'} />
          </div>

          <div className="dx-form__step">
            <p className="dx-form__title">
              <span>2</span> Modelo
            </p>
            {list.length > 0 && <ModelPicker models={list} value={model} onChange={setModel} legend="Elige con qué modelo se analizará" />}
            {models.data && !anyReady && (
              <Alert tone="info">Los modelos aún no están entrenados: puedes probar la pantalla, pero el análisis no dará un resultado todavía.</Alert>
            )}
          </div>

          {user ? (
            <div className="dx-form__submit">
              {formError && (
                <p className="dx-form__error" role="alert">
                  {formError}
                </p>
              )}
              <Button block onClick={analyze} loading={status === 'loading'}>
                <Icon name="scan" size={18} /> Analizar fruto
              </Button>
              <Text size="sm" className="dx-form__privacy">
                La foto se reduce y se le quitan los metadatos (incluida la ubicación GPS) antes de enviarla.
              </Text>
            </div>
          ) : (
            <Callout label="Inicia sesión para analizar">
              <p>El diagnóstico está disponible para usuarios registrados.</p>
              <div className="dx-form__login">
                <Button to="/login?next=/diagnostico" size="sm">
                  Iniciar sesión
                </Button>
                <Button to="/registro" variant="ghost" size="sm">
                  Crear cuenta
                </Button>
              </div>
            </Callout>
          )}
        </div>
      }
      result={<DiagnosisPanel status={status} error={error} response={response} photo={photo} descriptions={descriptions} />}
    />
  );
}
