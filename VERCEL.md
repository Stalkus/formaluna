# Deploying on Vercel

The admin UI uses `fetch(..., { credentials: 'include' })`. Cookie and CORS behavior depends on whether the API is **on the same Vercel project** (recommended) or on **another host**.

## Same project: frontend + API (this repo)

Vercel runs the Express app from `api/index.ts` (see `vercel.json` rewrites). The browser can call **`/api/v1/...` on the same origin**, so you usually **do not** set `VITE_API_BASE`.

1. **Environment variables** (Production + Preview as needed):

| Name | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres for Prisma. Prefer your provider’s **pooled / serverless** connection string (e.g. Neon pooler). Include **`sslmode=require`** (or equivalent) if the host requires TLS. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | For bootstrap | Required only for **Create Admin (first run)** via `/api/v1/admin/bootstrap`. |
| `JWT_SECRET` | Yes | Strong secret for tokens. |
| `APP_ORIGIN` | Optional | Exact site origin (`https://your-domain.com`). If unset, CORS still allows `https://${VERCEL_URL}` on Vercel. |
| `SESSION_COOKIE_SAMESITE` | Optional | Defaults suit same-site; use **`lax`** (or omit) for same deployment. |
| `VITE_API_BASE` | Optional | Only if the API is on **another** origin (split setup below). |

2. **Build**: `vercel-build` runs Prisma generate, compiles `backend/` to `backend/dist`, then builds the Vite app. Redeploy after changing env vars that affect the API at runtime.

3. **Health**: After deploy, open `https://<your-host>/api/health` — expect JSON `{ "ok": true }`. If you see the marketing page HTML instead, the deployment is missing the serverless API or `vercel.json` rewrites; confirm the latest `api/index.ts` and `vercel.json` are deployed.

**Routing note:** Vercel’s `api/*.ts` files each map to a single URL segment, so deep paths like `/api/v1/admin/login` are rewritten to `/api/index?path=…` and `api/index.ts` restores the real `/api/…` path before Express handles the request.

**If admin login returns 500:** Open the deployment **Logs** (Functions). Common causes: `DATABASE_URL` wrong or not accepting connections from Vercel (firewall, SSL, or too many direct connections — use a pooled URL), missing **`JWT_SECRET`** (≥ 20 characters), or migrations not applied (`npx prisma migrate deploy` against production DB). The API returns JSON `{ "error": "Internal server error" }` for unexpected failures; details are in those logs.

## Split setup: React on Vercel, API elsewhere

If the API is on another domain, set on **Vercel (frontend)**:

| Name | Value |
| --- | --- |
| `VITE_API_BASE` | `https://your-api-host.example.com` (no trailing slash) |

Redeploy after changing `VITE_*` (baked in at build time).

On the **API server**, set:

| Name | Example | Notes |
| --- | --- | --- |
| `APP_ORIGIN` | `https://formaluna.vercel.app` | Browser origin (scheme + host, no path). |
| `SESSION_COOKIE_SAMESITE` | `none` | **Required** for cross-site cookies; uses `Secure`. |

**Why `none`?** With `lax`, many browsers will not send the session cookie on cross-origin `fetch` from your Vercel app to the API, so login can look successful but `/admin` stays logged out.

## Local development

Leave `VITE_API_BASE` unset; the Vite dev server proxies `/api` to `http://localhost:8080` (`vite.config.ts`).  
Use `APP_ORIGIN=http://localhost:5173` and `SESSION_COOKIE_SAMESITE=lax` in `backend/.env` (see `backend/.env.example`).
