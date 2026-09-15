import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.string().default('info'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CORS_ORIGIN: z.string().optional().default(''),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  SKIP_STORAGE_UPLOAD: z
    .string()
    .optional()
    .default('false')
    .transform((v) => v === 'true'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const corsOrigins = parsed.data.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);

if (parsed.data.NODE_ENV === 'production' && corsOrigins.length === 0) {
  console.error('CORS_ORIGIN must be set to an explicit comma-separated origin list in production.');
  process.exit(1);
}

export const env = { ...parsed.data, CORS_ORIGINS: corsOrigins };
