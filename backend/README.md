# Formaluna API (CRM / catalogue backend)

Node + Express + PostgreSQL + Prisma. This is the **headless** counterpart to the React site: it covers what WordPress + WooCommerce + Elementor would do for a lighting supplier, without running PHP.

## Feature mapping

| WordPress / WooCommerce / Elementor idea | This backend |
| --- | --- |
| Products, SKUs, prices, publish/draft | `Product` model + `/api/v1/admin/products` |
| Product categories (B2C vs B2B visibility) | `ProductCategory` + `/api/v1/admin/categories` + `GET /api/v1/categories?portal=studio\|trade` |
| Technical datasheets (PDF) | `Asset` with `kind: PRODUCT_TECH_SHEET` (+ optional S3/R2 presign) |
| Custom pages, flexible layouts | `Page.contentJson` (block JSON — Elementor-style) + `/api/v1/admin/pages` — public: `GET /api/v1/pages/:slug` (React renders at `/projects/cms/:slug` and `/professionals/cms/:slug`) |
| Projects / case studies | `Project` + gallery URLs + product links |
| B2B registration & approval | `User` role `B2B` + `ApprovalStatus` + admin approve/reject |
| Public catalogue + gated pricing | `GET /api/v1/products` hides `priceCents` unless session is approved B2B |

## Setup

1. **PostgreSQL** running locally or hosted. From the **repo root**, Docker is available as:

```bash
npm run db:up
```

(This uses `backend/docker-compose.yml` on port **5433**, matching `DATABASE_URL` in `.env.example`.)

2. Copy env:

```bash
cd backend
cp .env.example .env
```

Required variables (see `src/lib/env.ts`):

- `DATABASE_URL` — PostgreSQL connection string  
- `JWT_SECRET` — long random string (20+ chars)  
- `APP_ORIGIN` — frontend origin for CORS, e.g. `http://localhost:5173`  
- `SESSION_COOKIE_SAMESITE` — default `lax`; use `none` when the site and API are on different domains (see repo `VERCEL.md`)  
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — optional; used by `POST /api/v1/admin/bootstrap` and `prisma db seed`

3. Install, migrate, seed, run:

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

From the **repo root** you can run the API with `npm run dev:api` (after `cd backend && npm install` once).

API listens on `PORT` (default **8080**). Health: `GET /health`.

## Production: Vercel frontend + API on another host

See the repo root **[VERCEL.md](../VERCEL.md)**. Set `APP_ORIGIN` to your Vercel URL, `SESSION_COOKIE_SAMESITE=none`, and on Vercel set `VITE_API_BASE` to this API’s public URL (then redeploy).

## Frontend wiring

The Vite app proxies `/api` → `http://localhost:8080` in development (`vite.config.ts`). With an empty `VITE_API_BASE`, the browser calls `/api/v1/...` on the same host as the dev server.

Production: set `VITE_API_BASE` to your API URL (no trailing slash).

## Portal flags on products

- **Studio (B2C showcase):** `isStudioProject: true` — listed with `GET /api/v1/products?portal=studio`  
- **Trade (B2B):** `isNovaTrade: true` — listed with `GET /api/v1/products?portal=trade` (`portal=nova` still accepted for backwards compatibility)

A product can be in one or both portals. Categories can be limited per portal with `visibleStudio` / `visibleTrade` on `ProductCategory`.
