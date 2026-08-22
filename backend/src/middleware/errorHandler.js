import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Invalid request',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }

  const statusCode = err.statusCode ?? 500;
  const isExpected = err.expected === true;

  if (!isExpected) {
    req.log?.error({ err }, 'Unhandled error') ?? logger.error({ err }, 'Unhandled error');
  }

  res.status(statusCode).json({
    error: isExpected || env.NODE_ENV !== 'production' ? err.message : 'Internal server error',
    requestId: req.id,
  });
}
