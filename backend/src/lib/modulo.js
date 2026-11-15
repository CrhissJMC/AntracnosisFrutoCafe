import { HttpError } from './http.js';

/**
 * Validación experta (RF06): solo los usuarios con perfil de especialista y el administrador.
 * Si un administrador también tiene el perfil de especialista, valida como especialista.
 * La base de datos vuelve a comprobarlo con un disparador (02_modulo_diagnostico.sql).
 */
export function validatorProfile(user) {
  if (!user) return null;
  if (user.perfil === 'especialista') return 'especialista';
  if (user.role === 'admin') return 'admin';
  return null;
}

export function requireValidator(req, res, next) {
  if (!req.user) return next(new HttpError(401, 'Debes iniciar sesión'));
  if (!validatorProfile(req.user)) {
    return next(new HttpError(403, 'Solo un especialista o un administrador puede validar diagnósticos'));
  }
  next();
}

/** Puede ver la foto de una captura: quien la tomó o quien puede validarla. */
export const canSeeCapture = (user, capture) => Boolean(user && (capture.autor_id === user.id || validatorProfile(user)));
