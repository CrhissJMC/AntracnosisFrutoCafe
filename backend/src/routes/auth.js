import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { query } from '../db/pool.js';
import { asyncHandler, HttpError } from '../lib/http.js';
import { registerSchema, loginSchema } from '../lib/schemas.js';
import { setSessionCookie, clearSessionCookie } from '../middleware/auth.js';

const router = Router();

// Frena ataques de fuerza bruta contra login/registro.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Vuelve a intentarlo en unos minutos.' },
});

// Hash ficticio para que el login tarde lo mismo exista o no el correo.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 10);

const publicUser = ({ id, name, email, role }) => ({ id, name, email, role });

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(data.password, 10);
    let user;
    try {
      const { rows } = await query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'user')
         RETURNING id, name, email, role`,
        [data.name, data.email, hash],
      );
      user = rows[0];
    } catch (err) {
      if (err.code === '23505') {
        throw new HttpError(409, 'Ya existe una cuenta con ese correo', { email: 'Este correo ya está registrado' });
      }
      throw err;
    }
    setSessionCookie(res, user);
    res.status(201).json({ user: publicUser(user) });
  }),
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const { rows } = await query(
      'SELECT id, name, email, role, password_hash FROM users WHERE lower(email) = $1',
      [data.email],
    );
    const user = rows[0];
    const ok = await bcrypt.compare(data.password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !ok) throw new HttpError(401, 'Correo o contraseña incorrectos');
    setSessionCookie(res, user);
    res.json({ user: publicUser(user) });
  }),
);

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

router.get('/me', (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

export default router;
