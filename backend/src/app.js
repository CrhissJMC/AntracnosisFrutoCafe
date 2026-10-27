import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import { query } from './db/pool.js';
import { errorHandler, HttpError } from './lib/http.js';
import { loadUser } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import commentRoutes from './routes/comments.js';
import contentRoutes from './routes/content.js';
import settingsRoutes from './routes/settings.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import traceabilityRoutes from './routes/traceability.js';
import diagnosisRoutes from './routes/diagnosis.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  // Proxies delante de la API: nginx (1) y, si se usa, el túnel de Cloudflare (2).
  // Así el rate limit usa la IP real de cada visitante.
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS) || 1);
  app.use(helmet());
  // Las fotos del diagnóstico llegan en el cuerpo (data URL): esa ruta admite hasta 12 MB; el resto, 200 KB.
  const jsonSmall = express.json({ limit: '200kb' });
  const jsonImages = express.json({ limit: '12mb' });
  app.use((req, res, next) => (req.path === '/api/diagnostico/analizar' ? jsonImages : jsonSmall)(req, res, next));
  app.use(cookieParser());

  // Id de petición + log estructurado de cada respuesta
  app.use((req, res, next) => {
    req.id = req.get('x-request-id') || randomUUID();
    res.set('x-request-id', req.id);
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      console.log(
        JSON.stringify({
          level: res.statusCode >= 500 ? 'error' : 'info',
          msg: 'request',
          requestId: req.id,
          method: req.method,
          path: req.originalUrl.split('?')[0],
          status: res.statusCode,
          ms: Math.round(ms),
          userId: req.user?.id,
        }),
      );
    });
    next();
  });

  // Las respuestas de la API no se guardan en caché del navegador
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', async (req, res) => {
    try {
      await query('SELECT 1');
      res.json({ status: 'ok', db: 'ok' });
    } catch {
      res.status(503).json({ status: 'error', db: 'down' });
    }
  });

  app.use('/api', loadUser);
  app.use('/api/auth', authRoutes);
  app.use('/api/articles', articleRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/traceability', traceabilityRoutes);
  app.use('/api/diagnostico', diagnosisRoutes);

  app.use('/api', (req, res, next) => next(new HttpError(404, 'Ruta no encontrada')));
  app.use(errorHandler);

  return app;
}
