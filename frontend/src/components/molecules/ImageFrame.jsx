import { Icon } from '../atoms';
import './ImageFrame.css';

/** Imagen cuadrada con su leyenda; sin `src` muestra un marcador. */
export function ImageFrame({ src, alt = '', caption, placeholder = 'Sin imagen', icon = 'image' }) {
  return (
    <figure className="image-frame">
      <div className="image-frame__box">
        {src ? (
          <img src={src} alt={alt} />
        ) : (
          <span className="image-frame__empty">
            <Icon name={icon} size={22} />
            {placeholder}
          </span>
        )}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
