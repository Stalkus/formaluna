/**
 * Vercel routes each `api/*.ts` file to a single path segment only, so no file can
 * match `/api/v1/admin/...` by itself. We rewrite `/api/(.*)` → `/api/index?path=$1`
 * and restore the real URL here before handing off to Express.
 */
import type { IncomingMessage, RequestListener, ServerResponse } from 'http';
import app from '../backend/dist/app.js';

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

export default function handler(req: Req, res: ServerResponse) {
  restoreApiPath(req);
  return (app as unknown as RequestListener)(req, res);
}
