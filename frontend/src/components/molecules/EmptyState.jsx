import { Icon, Text } from '../atoms';
import './EmptyState.css';

export function EmptyState({ icon = 'inbox', title, children }) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={28} />
      <p className="empty-state__title">{title}</p>
      {children && <Text size="sm">{children}</Text>}
    </div>
  );
}
