# Formaluna API

Express + PostgreSQL + Prisma. Serves JSON for the React app (catalogue, admin, CMS-style pages, B2B flows).

## Features (API surface)

| Area | Implementation |
| --- | --- |
| Products, SKUs, publish/draft | `Product` + `/api/v1/admin/products` |
| Categories (B2C / B2B visibility) | `ProductCategory` + admin routes + `GET /api/v1/categories?portal=studio\|trade` |
| Technical datasheets (PDF) | `Asset` with `kind: PRODUCT_TECH_SHEET` (+ optional S3/R2 presign) |
| Custom pages (block JSON) | `Page.contentJson` + `/api/v1/admin/pages` — public `GET /api/v1/pages/:slug` |
| Projects / case studies | `Project` + gallery URLs + product links |
| B2B registration & approval | `User` role `B2B` + `ApprovalStatus` + admin approve/reject |
| Public catalogue + gated pricing | `GET /api/v1/products` hides `priceCents` unless session is approved B2B |

## Setup

1. **PostgreSQL** — from the **repo root**:

```bash
npm run db:up
```

Uses `backend/docker-compose.yml` on port **5433** (see `.env.example`).

2. **Environment**

```bash
cd backend
cp .env.example .env
```

Required (see `src/lib/env.ts`):

- `DATABASE_URL` — PostgreSQL connection string  
- `JWT_SECRET` — long random string (20+ chars)  
- `APP_ORIGIN` — frontend origin for CORS, e.g. `http://localhost:5173`  
- `SESSION_COOKIE_SAMESITE` — default `lax`; use `none` when frontend and API are on different domains (see root **README.md**)  
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — optional; bootstrap + seed

3. **Install, migrate, seed, run**

Prefer installing from the **repo root** (`npm install`) if you use the monorepo workspace. Then:

```bash
cd backend
npm run db:migrate
npm run db:seed
npm run dev
```

Or from root: `npm run dev:api` (after dependencies are installed).

API listens on `PORT` (default **8080**). Health: `GET /health`.

## Deploy

Same-origin Vercel (frontend + `api/` handler): see root **[README.md](../README.md)**.

Split frontend/API hosts: set `APP_ORIGIN` to your Vite host, `SESSION_COOKIE_SAMESITE=none`, and `VITE_API_BASE` on the frontend to this API’s URL.

## Frontend wiring

Dev: Vite proxies `/api` → `http://localhost:8080`. Production: empty `VITE_API_BASE` means same-origin `/api/v1/...`.

## Portal flags on products

- **Studio (B2C):** `isStudioProject: true` — `GET /api/v1/products?portal=studio`  
- **Trade (B2B):** `isNovaTrade: true` — `GET /api/v1/products?portal=trade` (`portal=nova` still accepted)

Categories use `visibleStudio` / `visibleTrade` on `ProductCategory`.
