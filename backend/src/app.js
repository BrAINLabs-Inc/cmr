import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { randomUUID } from 'node:crypto';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { diaryRouter } from './routes/diary.js';
import { adminRouter } from './routes/admin.js';

export const app = express();

// Needed for express-rate-limit / req.ip to see the real client IP when
// deployed behind a reverse proxy or load balancer.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS.length ? env.CORS_ORIGINS : true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const id = req.headers['x-request-id'] || randomUUID();
      res.setHeader('X-Request-Id', id);
      return id;
    },
    autoLogging: { ignore: (req) => req.url === '/api/health' },
  })
);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api', apiLimiter);
app.use('/api/auth', authRouter);
app.use('/api/diary', diaryRouter);
app.use('/api/admin', adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);
