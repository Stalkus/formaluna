# Formaluna Backend

Express REST API + Postgres (Prisma) + S3/R2 uploads.

## Local setup

1) Copy env file:

- `cp .env.example .env`

2) Start Postgres:

- `docker compose up -d`

3) Install deps:

- `npm i`

4) Run migrations + generate client:

- `npx prisma migrate dev`

5) (Optional) Bootstrap first admin:

- Set `ADMIN_EMAIL` + `ADMIN_PASSWORD` in `.env`
- `POST /admin/bootstrap`

6) Start API:

- `npm run dev`

API runs at `http://localhost:8080`.

## Key endpoints (starter set)

- Base URL: `/api/v1`
- `POST /api/v1/auth/register` (B2B user signup → pending approval)
- `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`, `POST /api/v1/auth/refresh`
- `POST /api/v1/admin/bootstrap` (create first admin if none exist)
- `POST /api/v1/admin/login`, `POST /api/v1/admin/logout`, `GET /api/v1/admin/me`
- `GET /api/v1/admin/users`, `POST /api/v1/admin/users/:id/approve`, `POST /api/v1/admin/users/:id/reject`
- `POST /api/v1/admin/uploads/presign` (S3/R2 presigned upload URL + asset record)
- `GET/POST/PATCH/DELETE /api/v1/admin/products`
- `GET/POST/PATCH/DELETE /api/v1/admin/projects`
- Public: `GET /api/v1/products`, `GET /api/v1/products/:slug`, `GET /api/v1/projects`, `GET /api/v1/projects/:slug`
