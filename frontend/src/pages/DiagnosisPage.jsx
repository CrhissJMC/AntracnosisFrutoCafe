import { useMemo, useState } from 'react';
import { Button, Checkbox, Icon, Text } from '../components/atoms';
import { Alert, Callout } from '../components/molecules';
import { DiagnosisPanel, ImageCapture, ModelPicker, ModuleTabs, PageHero } from '../components/organisms';
import { DiagnosisLayout } from '../components/templates';
import { useAuth } from '../context/AuthContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../lib/api.js';
import { classDescriptions } from '../lib/diagnosis.js';
import './DiagnosisPage.css';

const DEFAULT_MODEL = 'efficientnet_b0';

/** Pide la ubicación al navegador (solo si el usuario la activa). */
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Este navegador no permite obtener la ubicación.'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitud: +pos.coords.latitude.toFixed(6), longitud: +pos.coords.longitude.toFixed(6) }),
      () => reject(new Error('No se pudo obtener la ubicación: revisa el permiso del navegador.')),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

/** Nuevo diagnóstico: foto del fruto → modelo → resultado con semáforo; la captura queda registrada. */
export function DiagnosisPage() {
  const { user } = useAuth();
  const { section } = useSite();
  const models = useAsync(() => api.get('/diagnostico/modelos'), []);
  const descriptions = useMemo(() => classDescriptions(section('clases')), [section]);

  const [photo, setPhoto] = useState(null);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [useLocation, setUseLocation] = useState(false);
  const [location, setLocation] = useState({ status: 'off', coords: null, message: '' });
  const [status, setStatus] = useState('idle');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState('');

  const toggleLocation = async (checked) => {
    setUseLocation(checked);
    if (!checked) return setLocation({ status: 'off', coords: null, message: '' });
    setLocation({ status: 'loading', coords: null, message: 'Obteniendo la ubicación…' });
    try {
      const coords = await getLocation();
      setLocation({ status: 'ok', coords, message: `Ubicación lista (${coords.latitud}, ${coords.longitud}).` });
    } catch (err) {
      setUseLocation(false);
      setLocation({ status: 'error', coords: null, message: err.message });
    }
  };

  const changePhoto = (value) => {
    setPhoto(value);
    setStatus('idle');
    setResponse(null);
    setFormError('');
  };

  const analyze = async () => {
    if (!photo) return setFormError('Primero toma o sube una foto del fruto.');
    if (location.status === 'loading') return setFormError('Espera a que se obtenga la ubicación.');
    setFormError('');
    setStatus('loading');
    try {
      const coords = useLocation && location.coords ? location.coords : {};
      setResponse(await api.post('/diagnostico/analizar', { image: photo, model, ...coords }));
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
        <>
          <PageHero
            label="Módulo de diagnóstico"
            title="Diagnóstico de antracnosis"
            description="Fotografía un fruto de café, elige el modelo y obtén su estado sanitario con la recomendación de manejo."
          />
          <ModuleTabs />
        </>
      }
      form={
        <div className="dx-form">

          <div className="dx-form__step">
            <p className="dx-form__title">
              <span>1</span> Fotografía del fruto
            </p>
            <ImageCapture value={photo} onChange={changePhoto} disabled={status === 'loading'} />
            {user && (
              <>
                <Checkbox
                  label="Guardar la ubicación de la foto (opcional)"
                  checked={useLocation}
                  onChange={(e) => toggleLocation(e.target.checked)}
                  disabled={status === 'loading'}
                />
                {location.message && (
                  <Text size="sm" className={location.status === 'error' ? 'dx-form__error' : 'dx-form__privacy'}>
                    {location.message}
                  </Text>
                )}
              </>
            )}
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
                La foto se reduce y se le quitan los metadatos (incluida la ubicación GPS) antes de enviarla. Se guarda con la
                fecha y el resultado; la ubicación, solo si la activas.
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
      result={
        <div className="dx-result">
          {status === 'done' && response?.captura && (
            <Alert tone="success">
              Captura N.º {response.captura.id} guardada
              {response.captura.ubicacion ? ', con su ubicación.' : '.'}
            </Alert>
          )}
          <DiagnosisPanel status={status} error={error} response={response} photo={photo} descriptions={descriptions} />
        </div>
      }
    />
  );
}
