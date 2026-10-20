import { useCallback, useState } from 'react';
import { ApiError } from '../lib/api.js';

/**
 * Estado de formulario + envío con manejo de errores de la API.
 * Los errores por campo que devuelve el backend (`fields`) se muestran junto a cada control.
 */
export function useForm(initialValues, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const field = useCallback(
    (name, { type } = {}) => ({
      name,
      value: type === 'checkbox' ? undefined : (values[name] ?? ''),
      checked: type === 'checkbox' ? Boolean(values[name]) : undefined,
      onChange: (e) => {
        const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setValues((s) => ({ ...s, [name]: v }));
        setErrors((s) => (s[name] ? { ...s, [name]: undefined } : s));
      },
    }),
    [values],
  );

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError('');
    setErrors({});
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields || {});
        setFormError(err.message);
      } else {
        setFormError('Ocurrió un error inesperado');
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setValues, errors, formError, setFormError, submitting, field, handleSubmit };
}
