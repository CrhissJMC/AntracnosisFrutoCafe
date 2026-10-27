import { Icon, Spinner } from '../atoms';
import { Alert, Callout, EmptyState } from '../molecules';
import { healthClass } from '../../lib/diagnosis.js';
import { DiagnosisResult } from './DiagnosisResult.jsx';
import './DiagnosisPanel.css';

/** Recuadro de resultado: estado vacío, cargando, aviso, un resultado o la comparación de ambos modelos. */
export function DiagnosisPanel({ status, error, response, photo, descriptions }) {
  if (status === 'loading') {
    return (
      <div className="dx-panel dx-panel--center">
        <Spinner size={28} label="Analizando el fruto" />
        <p>Analizando el fruto…</p>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="dx-panel">
        <Alert tone={error?.unavailable ? 'info' : 'error'}>{error?.message}</Alert>
        {error?.unavailable && (
          <p className="dx-panel__note">
            Cuando el equipo entrene los modelos y los copie en el servidor, este botón mostrará el diagnóstico aquí.
          </p>
        )}
      </div>
    );
  }
  if (status !== 'done' || !response) {
    return (
      <div className="dx-panel">
        <EmptyState icon="scan" title="El resultado aparecerá aquí">
          Toma o sube una foto del fruto, elige el modelo y pulsa «Analizar fruto».
        </EmptyState>
      </div>
    );
  }

  const results = response.results;
  const ready = results.filter((r) => r.available);
  const agree = ready.length > 1 && ready.every((r) => r.class === ready[0].class);

  return (
    <div className="dx-panel">
      {response.compared && ready.length > 1 && (
        <Callout label="Comparación de modelos">
          <span className="dx-panel__agree">
            <Icon name={agree ? 'check' : 'alert'} size={16} />
            {agree
              ? `Ambos modelos coinciden: ${healthClass(ready[0].class)?.label.toLowerCase()}.`
              : 'Los modelos no coinciden: conviene que el especialista revise este caso.'}
          </span>
        </Callout>
      )}
      <div className={response.compared ? 'dx-panel__compare' : undefined}>
        {results.map((r) => (
          <div key={r.model} className={response.compared ? 'dx-panel__col' : undefined}>
            <DiagnosisResult result={r} photo={photo} descriptions={descriptions} compact={response.compared} />
          </div>
        ))}
      </div>
      <p className="dx-panel__note">Herramienta de apoyo a la decisión: no reemplaza el diagnóstico de laboratorio.</p>
    </div>
  );
}
