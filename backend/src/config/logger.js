import { createRequire } from 'node:module';
import pino from 'pino';
import { env } from './env.js';

// pino-pretty is a devDependency; fall back to JSON logs when it isn't installed
// (e.g. production installs that omit devDependencies).
const hasPinoPretty = (() => {
  try {
    createRequire(import.meta.url).resolve('pino-pretty');
    return true;
  } catch {
    return false;
  }
})();

export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development' && hasPinoPretty
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
