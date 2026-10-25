import { Spinner, Text } from '../components/atoms';
import { Alert, Callout, Panel } from '../components/molecules';
import { CoffeeCycleRing, CycleLegend, ObjectiveList, PageHero, ProgressTimeline } from '../components/organisms';
import { TraceabilityLayout } from '../components/templates';
import { useSite } from '../context/SiteContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../lib/api.js';
import { formatDateTime } from '../lib/format.js';
import './TraceabilityPage.css';

/** Página = plantilla + datos reales de la API. */
export function TraceabilityPage() {
  const { settings: s } = useSite();
  const state = useAsync(() => api.get('/traceability'), []);
  const d = state.data;

  return (
    <TraceabilityLayout
      hero={<PageHero label="Trazabilidad" title={s.traz_title} description={s.traz_desc} />}
      ring={
        d && (
          <>
            <CoffeeCycleRing total={d.total} objectives={d.objectives} />
            {d.updated_at && (
              <Text size="sm" className="traz-page__updated">
                Última actualización: {formatDateTime(d.updated_at)}
              </Text>
            )}
            {s.traz_general && <Callout label="Objetivo general">{s.traz_general}</Callout>}
          </>
        )
      }
      objectives={
        d && (
          <Panel title="Objetivos específicos">
            <ObjectiveList objectives={d.objectives} />
          </Panel>
        )
      }
      log={
        d && (
          <Panel title="Bitácora de avance">
            <ProgressTimeline log={d.log} />
          </Panel>
        )
      }
      legend={d && <CycleLegend />}
    >
      {state.loading && !d && (
        <div className="traz-page__loading">
          <Spinner size={24} />
        </div>
      )}
      {state.error && <Alert tone="error">No se pudo cargar el avance del proyecto.</Alert>}
    </TraceabilityLayout>
  );
}
