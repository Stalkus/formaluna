import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === '' ? undefined : v))
  .pipe(z.string().url().optional());

const optionalString = z
  .string()
  .trim()
  .transform((v) => (v === '' ? undefined : v))
  .optional();

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(8080),
  /** Optional if only using `VERCEL_URL` for CORS (set explicitly for custom domains). */
  APP_ORIGIN: optionalString.pipe(z.string().url().optional()),
  /** Use `none` when the browser loads the site from a different host than the API (e.g. Vercel frontend + separate API). Requires HTTPS. */
  SESSION_COOKIE_SAMESITE: z.enum(['lax', 'none', 'strict']).default('lax'),
  DATABASE_URL: z.string().min(1, {
    message: 'DATABASE_URL is required (Postgres connection string). Set it in Vercel → Settings → Environment Variables.',
  }),
  JWT_SECRET: z.string().min(20, {
    message:
      'JWT_SECRET must be at least 20 characters (Vercel often fails with 500 if shorter). Vercel → Project → Settings → Environment Variables → set JWT_SECRET to a long random string, save for Production, then Redeploy.',
  }),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_EMAIL: optionalString.pipe(z.string().email().optional()),
  ADMIN_PASSWORD: optionalString.pipe(z.string().min(8).optional()),

  S3_REGION: optionalString,
  S3_ENDPOINT: optionalUrl,
  S3_BUCKET: optionalString,
  S3_ACCESS_KEY_ID: optionalString,
  S3_SECRET_ACCESS_KEY: optionalString,
  S3_PUBLIC_BASE_URL: optionalUrl,

  ENCRYPTION_KEY: optionalString.pipe(z.string().min(16).optional()),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const detail = parsed.error.issues
    .map((i) => `${i.path.join('.') || 'env'}: ${i.message}`)
    .join(' | ');
  throw new Error(`Invalid environment: ${detail}`);
}
export const env = parsed.data;

