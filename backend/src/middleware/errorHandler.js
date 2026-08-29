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

  if (err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'One of your files is too large (10 MB max per file).'
        : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Too many files uploaded.'
          : 'Could not process the uploaded files.';
    return res.status(400).json({ error: message });
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
