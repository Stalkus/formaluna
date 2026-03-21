import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

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

export default app;
