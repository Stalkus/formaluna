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
app.use(
  cors({
    origin: env.APP_ORIGIN,
    credentials: true,
  }),
);
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1', publicRouter);
app.use('/api/v1', pagesRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.PORT}`);
});

