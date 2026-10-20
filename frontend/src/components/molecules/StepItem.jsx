import { Heading, Text } from '../atoms';
import { pad2 } from '../../lib/format.js';
import './StepItem.css';

export function StepItem({ index, title, text }) {
  return (
    <li className="step">
      <span className="step__num">{pad2(index)}</span>
      <span className="step__divider" aria-hidden="true" />
      <Heading as="h3" size="sm">
        {title}
      </Heading>
      <Text size="sm">{text}</Text>
    </li>
  );
}
