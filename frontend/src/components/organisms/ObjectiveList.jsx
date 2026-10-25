import { ObjectiveItem } from '../molecules';
import { objectiveColor } from '../../lib/traceability.js';
import './ObjectiveList.css';

/** El objetivo "en curso" es el primero (por código) que aún no llega a 100 %. */
export const currentObjectiveId = (objectives) => objectives.find((o) => o.progress < 100 && o.weight > 0)?.id;

function statusOf(o, currentId) {
  if (o.progress === 100) return 'Completado';
  if (o.id === currentId) return 'En curso';
  return o.progress > 0 ? 'Iniciado' : 'Pendiente';
}

/** Lista de objetivos específicos con su avance; resalta el que está en curso. */
export function ObjectiveList({ objectives }) {
  const currentId = currentObjectiveId(objectives);
  return (
    <ol className="objective-list">
      {objectives.map((o) => (
        <li key={o.id}>
          <ObjectiveItem
            code={o.code}
            title={o.title}
            description={o.description}
            progress={o.progress}
            weight={o.weight}
            color={objectiveColor(o.code)}
            status={statusOf(o, currentId)}
            highlighted={o.id === currentId}
          />
        </li>
      ))}
    </ol>
  );
}
