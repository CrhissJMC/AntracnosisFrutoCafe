import { Avatar, Badge } from '../atoms';
import { formatDateTime } from '../../lib/format.js';
import { ConfirmButton } from './ConfirmButton.jsx';
import './CommentItem.css';

export function CommentItem({ comment, isOwn, canDelete, onDelete }) {
  return (
    <li className="comment">
      <Avatar name={comment.user_name} />
      <div className="comment__main">
        <div className="comment__head">
          <span className="comment__author">{comment.user_name}</span>
          {isOwn && <Badge>Tú</Badge>}
          <time className="comment__date" dateTime={comment.created_at}>
            {formatDateTime(comment.created_at)}
          </time>
        </div>
        <p className="comment__body">{comment.body}</p>
        {canDelete && (
          <ConfirmButton size="sm" variant="ghost" icon="trash" onConfirm={onDelete} confirmText="¿Eliminar comentario?">
            Eliminar
          </ConfirmButton>
        )}
      </div>
    </li>
  );
}
