# Formaluna

React (Vite) storefront and admin UI, with an Express API and PostgreSQL (Prisma) in `backend/`. On Vercel, the API is served from `api/index.ts` with the same origin as the frontend.

## Local development

From the repo root:

```bash
npm install
npm run db:up
npm run db:generate
npm run db:migrate
```

Terminal 1 — API (port 8080):

```bash
cd backend && npm install && cp -n .env.example .env   # edit .env
npm run dev
```

Terminal 2 — Vite (port 5173):

```bash
npm run dev
```

The dev server proxies `/api` to `http://localhost:8080` (`vite.config.ts`).

## Deploy (Vercel)

Build command is `npm run vercel-build` (see root `package.json`). Set at least:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Pooled Postgres URL; include TLS if required (`sslmode=require`). |
| `JWT_SECRET` | Yes | Strong secret (≥ 20 characters). |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Optional | Bootstrap admin without sending credentials in the first request. |
| `APP_ORIGIN` | Optional | e.g. `https://your-domain.com`. |
| `VITE_API_BASE` | Optional | Only if the API is on another host (no trailing slash). |

Health check: `GET /api/health` should return `{ "ok": true }`.

For cross-origin API + cookies, use `SESSION_COOKIE_SAMESITE=none` on the API and set `APP_ORIGIN` to your Vercel URL.

## Layout

| Path | Role |
| --- | --- |
| `src/` | Frontend (React) |
| `public/` | Static assets for Vite |
| `backend/` | Express app, Prisma schema & migrations |
| `api/` | Vercel serverless entry → compiled `backend/dist` |
| `vercel.json` | Rewrites `/api/*` into the serverless handler |
