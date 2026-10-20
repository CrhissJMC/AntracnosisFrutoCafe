import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query } from '../db/pool.js';
import { HttpError } from '../lib/http.js';

export const COOKIE_NAME = 'antracnosis_session';

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: config.cookieSecure,
  path: '/',
});

export function setSessionCookie(res, user) {
  const token = jwt.sign({ sub: String(user.id) }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn,
  });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

/**
 * Lee la sesión (si existe) y carga el usuario desde la base de datos.
 * El rol se lee siempre de la BD, así un cambio de rol surte efecto de inmediato.
 */
export async function loadUser(req, res, next) {
  req.user = null;
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next();

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    clearSessionCookie(res); // token vencido o manipulado
    return next();
  }

  try {
    const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [Number(payload.sub)]);
    req.user = rows[0] ?? null;
    if (!req.user) clearSessionCookie(res);
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) return next(new HttpError(401, 'Debes iniciar sesión'));
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return next(new HttpError(401, 'Debes iniciar sesión'));
  if (req.user.role !== 'admin') return next(new HttpError(403, 'No tienes permisos de administrador'));
  next();
}
