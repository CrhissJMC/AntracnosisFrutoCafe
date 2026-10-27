import { useRef, useState } from 'react';
import { Button, Icon, Spinner } from '../atoms';
import { ChipList } from '../molecules';
import { CAPTURE_GUIDE, prepareImage } from '../../lib/diagnosis.js';
import './ImageCapture.css';

/**
 * Captura de la foto del fruto: arrastrar y soltar, "Tomar foto" (abre la cámara en el teléfono)
 * o "Subir foto". Entrega la imagen ya reducida como data URL en `onChange`.
 */
export function ImageCapture({ value, onChange, disabled = false }) {
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      onChange(await prepareImage(file));
    } catch (err) {
      setError(err.message || 'No se pudo leer la foto.');
    } finally {
      setBusy(false);
    }
  };

  const pick = (e) => {
    handleFile(e.target.files?.[0]);
    e.target.value = ''; // permite elegir de nuevo la misma foto
  };

  const drop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="image-capture">
      <ChipList items={CAPTURE_GUIDE} label="Guía de captura" />
      <div
        className={`image-capture__drop ${dragging ? 'is-dragging' : ''} ${value ? 'has-image' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
      >
        {busy ? (
          <Spinner size={24} label="Procesando la foto" />
        ) : value ? (
          <img src={value} alt="Vista previa del fruto" />
        ) : (
          <span className="image-capture__hint">
            <Icon name="image" size={28} />
            <strong>Arrastra una foto aquí</strong>
            <span>JPG o PNG · máx. 8 MB</span>
          </span>
        )}
      </div>
      {error && (
        <p className="image-capture__error" role="alert">
          {error}
        </p>
      )}
      <div className="image-capture__actions">
        <Button variant="secondary" onClick={() => cameraRef.current?.click()} disabled={disabled || busy}>
          <Icon name="camera" size={16} /> Tomar foto
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={disabled || busy}>
          <Icon name="upload" size={16} /> Subir foto
        </Button>
      </div>
      <input ref={cameraRef} type="file" accept="image/jpeg,image/png" capture="environment" onChange={pick} hidden />
      <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={pick} hidden />
      {value && (
        <button type="button" className="image-capture__clear" onClick={() => onChange(null)} disabled={disabled}>
          Quitar foto
        </button>
      )}
    </div>
  );
}
