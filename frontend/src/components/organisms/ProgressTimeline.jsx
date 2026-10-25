import { useState } from 'react';
import { Button } from '../atoms';
import { EmptyState, LogEntry } from '../molecules';
import './ProgressTimeline.css';

/** Bitácora en forma de línea de tiempo; muestra las últimas `initial` y permite ver todas. */
export function ProgressTimeline({ log, initial = 6, renderActions }) {
  const [all, setAll] = useState(false);
  if (!log.length) {
    return (
      <EmptyState icon="clock" title="Aún no hay registros">
        Cada cambio de avance aparecerá aquí.
      </EmptyState>
    );
  }
  const visible = all ? log : log.slice(0, initial);
  return (
    <>
      <ol className="progress-timeline">
        {visible.map((e) => (
          <LogEntry key={e.id} entry={e} actions={renderActions?.(e)} />
        ))}
      </ol>
      {log.length > initial && (
        <Button variant="ghost" size="sm" onClick={() => setAll((v) => !v)} className="progress-timeline__more">
          {all ? 'Ver menos' : `Ver toda la bitácora (${log.length})`}
        </Button>
      )}
    </>
  );
}
