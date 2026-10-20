import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (what = 'Recurso') => new HttpError(404, `${what} no encontrado`);

/** Envuelve un handler async para que sus errores lleguen al manejador central. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Convierte un parámetro de ruta en id entero positivo o lanza 404. */
export function parseId(value, what) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0 || id > 2_147_483_647) throw notFound(what);
  return id;
}

// Manejador de errores central: respuestas consistentes y sin filtrar detalles internos.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const fields = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || '_';
      fields[key] ??= issue.message;
    }
    return res.status(400).json({ error: 'Revisa los datos enviados', fields });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details ? { fields: err.details } : {}) });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El contenido es demasiado grande' });
  }
  // Violaciones de restricciones de PostgreSQL
  if (err?.code === '23505') return res.status(409).json({ error: 'Ya existe un registro con ese valor' });
  if (err?.code === '23503') return res.status(404).json({ error: 'El recurso relacionado no existe' });
  if (err?.code === '23514') return res.status(400).json({ error: 'Los datos no cumplen las reglas' });

  console.error(
    JSON.stringify({
      level: 'error',
      msg: 'unhandled_error',
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      error: err?.message,
      stack: err?.stack,
    }),
  );
  return res.status(500).json({ error: 'Error interno del servidor', requestId: req.id });
}
