# Deploying the React app on Vercel + API elsewhere

The admin UI calls the API with `fetch(..., { credentials: 'include' })`. You must align **three** things: `VITE_API_BASE`, `APP_ORIGIN`, and (when hosts differ) **`SESSION_COOKIE_SAMESITE`**.

## 1. Vercel (frontend)

1. Open the project on [Vercel](https://vercel.com) → **Settings** → **Environment Variables**.
2. Add for **Production** (and **Preview** if you use preview URLs):

| Name | Value | Notes |
| --- | --- | --- |
| `VITE_API_BASE` | `https://your-api-host.example.com` | **No trailing slash.** Must be the public HTTPS URL of your Express API. |

3. **Redeploy** the project after saving variables. Vite bakes `VITE_*` in at **build time**, so a new deployment is required.

Optional: set the same variable for **Preview** if previews should talk to a staging API.

## 2. API server (Express / `backend/`)

On whatever hosts your API (Railway, Render, Fly.io, VPS, etc.), set:

| Name | Example | Notes |
| --- | --- | --- |
| `APP_ORIGIN` | `https://formaluna.vercel.app` | Exact site origin the browser uses (scheme + host, no path). |
| `SESSION_COOKIE_SAMESITE` | `none` | **Required** when the page is on Vercel and the API is on **another** domain. Uses `Secure` cookies. |
| `NODE_ENV` | `production` | |

Keep your existing `DATABASE_URL`, `JWT_SECRET`, etc.

**Why `SESSION_COOKIE_SAMESITE=none`?**  
With `lax`, many browsers will **not** send the session cookie on cross-origin `fetch` from `formaluna.vercel.app` to your API, so login appears to succeed but `/admin` loads as logged out.

## 3. Checklist

- [ ] `VITE_API_BASE` set on Vercel and project redeployed  
- [ ] `APP_ORIGIN=https://formaluna.vercel.app` on the API  
- [ ] `SESSION_COOKIE_SAMESITE=none` on the API (split-domain setup)  
- [ ] API served over **HTTPS**  
- [ ] CORS: API already allows `credentials` for the single `APP_ORIGIN` origin  

## 4. Local development

Leave `VITE_API_BASE` unset locally; the Vite dev server proxies `/api` to `http://localhost:8080` (`vite.config.ts`).  
Use `APP_ORIGIN=http://localhost:5173` and `SESSION_COOKIE_SAMESITE=lax` in `backend/.env`.
