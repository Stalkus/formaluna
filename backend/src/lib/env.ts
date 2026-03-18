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
  APP_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(20),
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

export const env = EnvSchema.parse(process.env);

