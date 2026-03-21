import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

import { prisma } from './prisma.js';
import { env } from './lib/env.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { publicRouter } from './routes/public.js';
import { pagesRouter } from './routes/pages.js';

const app = express();

app.use(helmet());

const corsOrigins: string[] = [];
if (env.APP_ORIGIN) corsOrigins.push(env.APP_ORIGIN);
if (process.env.VERCEL_URL) corsOrigins.push(`https://${process.env.VERCEL_URL}`);
if (corsOrigins.length === 0) corsOrigins.push('http://localhost:5173');

app.use(
  cors({
    origin: corsOrigins.length === 1 ? corsOrigins[0]! : corsOrigins,
    credentials: true,
  }),
);
app.use(morgan(process.env.VERCEL ? 'tiny' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

async function healthHandler(_req: express.Request, res: express.Response) {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true });
}

app.get('/health', healthHandler);
/** Same check when the app is mounted behind Vercel `/api/*` rewrites only */
app.get('/api/health', healthHandler);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1', publicRouter);
app.use('/api/v1', pagesRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PRISMA_KNOWN_HINTS: Record<string, string> = {
  P1000:
    'Database authentication failed — check username/password in DATABASE_URL.',
  P1001:
    'Cannot reach the database server — check DATABASE_URL host, firewall, and that the provider allows connections (use pooled URL if recommended).',
  P1003: 'Database does not exist — create the database or fix the name in DATABASE_URL.',
  P1011: 'TLS/SSL error — try adding ?sslmode=require (or your host’s required SSL params) to DATABASE_URL.',
  P1017: 'Server closed the connection — often SSL or pooler settings; verify DATABASE_URL with your host’s docs.',
  P2021:
    'A database table is missing — run `npx prisma migrate deploy` using the same DATABASE_URL as production.',
  P2022: 'A column is missing — migrations are behind; run `prisma migrate deploy` on production.',
  P2002: 'Unique constraint — record already exists (e.g. admin email).',
};

function prismaClientHint(err: unknown): { code: string; hint: string } | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const hint = PRISMA_KNOWN_HINTS[err.code] ?? `See Prisma docs for code ${err.code}.`;
    return { code: err.code, hint };
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return {
      code: err.errorCode ?? 'INIT',
      hint:
        'Database failed to connect — verify DATABASE_URL, SSL (?sslmode=require), and use your host’s pooled/serverless connection string if required.',
    };
  }
  return null;
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Invalid request', details: err.flatten() });
  }
  const prismaHint = prismaClientHint(err);
  // eslint-disable-next-line no-console
  console.error(err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  if (prismaHint) {
    return res.status(500).json({
      error: 'Internal server error',
      code: prismaHint.code,
      hint: prismaHint.hint,
    });
  }
  res.status(500).json({
    error: 'Internal server error',
    ...(env.NODE_ENV !== 'production' ? { message } : {}),
  });
});

export default app;
