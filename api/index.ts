// @ts-nocheck
// Vercel typechecks this entry; backend/dist is JS-only output (no .d.ts for ../backend/dist/app.js).
/**
 * Vercel routes each `api/*.ts` file to a single path segment only, so no file can
 * match `/api/v1/admin/...` by itself. We rewrite `/api/(.*)` → `/api/index?path=$1`
 * and restore the real URL here before handing off to Express.
 *
 * The Express app is loaded with a dynamic import so misconfigured env (e.g. missing
 * DATABASE_URL or JWT_SECRET) returns JSON instead of a non-JSON platform 500.
 */
import type { IncomingMessage, RequestListener, ServerResponse } from 'http';

type Req = IncomingMessage & { query?: Record<string, string | string[] | undefined> };

function restoreApiPath(req: Req) {
  const rawUrl = req.url || '/';
  const u = new URL(rawUrl, 'http://localhost');

  let qPath = u.searchParams.get('path');
  if (qPath === null && req.query?.path !== undefined) {
    const p = req.query.path;
    qPath = Array.isArray(p) ? (p[0] ?? '') : p;
  }
  if (qPath !== null) {
    u.searchParams.delete('path');
    const tail = u.searchParams.toString();
    const prefix = qPath === '' || qPath === '/' ? '/api' : `/api/${qPath.replace(/^\//, '')}`;
    req.url = tail ? `${prefix}?${tail}` : prefix;
    return;
  }

  if (u.pathname === '/api/index' || u.pathname === '/api') {
    req.url = '/api';
  }
}

let appListener: RequestListener | null = null;
let loadError: Error | null = null;

async function getApp(): Promise<RequestListener> {
  if (loadError) throw loadError;
  if (appListener) return appListener;
  try {
    const m = await import('../backend/dist/app.js');
    appListener = m.default as RequestListener;
    return appListener;
  } catch (e) {
    loadError = e instanceof Error ? e : new Error(String(e));
    throw loadError;
  }
}

function sendInitError(res: ServerResponse, err: Error) {
  if (res.headersSent) return;
  const body = JSON.stringify({
    error: 'API failed to start',
    message: err.message,
    hint:
      'In Vercel → Settings → Environment Variables set DATABASE_URL (Postgres, pooled URL if serverless), JWT_SECRET (at least 20 characters), then redeploy. Run prisma migrate deploy against that database. See README.md.',
  });
  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(body);
}

export default async function handler(req: Req, res: ServerResponse) {
  restoreApiPath(req);
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    sendInitError(res, e);
  }
}
