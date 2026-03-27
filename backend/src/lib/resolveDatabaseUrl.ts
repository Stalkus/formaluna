/**
 * Vercel’s Supabase integration often sets POSTGRES_PRISMA_URL / POSTGRES_URL.
 * Prisma and our env schema expect DATABASE_URL — align them before any DB client use.
 *
 * Supabase + Prisma: transaction pooler (port 6543 / `*.pooler.supabase.com`) needs
 * `pgbouncer=true` and `connection_limit=1`. All remote Postgres should use TLS (`sslmode=require`).
 */
function cleanEnvUrl(raw: string): string {
  let s = raw.trim().replace(/^\uFEFF/, '');
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s.replace(/\r?\n|\r/g, '');
}

function normalizePostgresUrl(raw: string): string {
  const trimmed = cleanEnvUrl(raw);
  if (!trimmed) return trimmed;
  try {
    const u = new URL(trimmed);
    const host = u.hostname.toLowerCase();
    const isSupabase =
      host.includes('supabase.co') || host.includes('supabase.com') || host.includes('pooler.supabase');
    // Supavisor: 5432 = session pooler; 6543 = transaction pooler. Prisma + serverless need 6543.
    if (host.includes('pooler.supabase') && (!u.port || u.port === '5432')) {
      u.port = '6543';
    }
    const port = u.port || (u.protocol === 'postgresql:' || u.protocol === 'postgres:' ? '5432' : '');
    const usesPooler = port === '6543' || host.includes('pooler');

    if (isSupabase) {
      if (!u.searchParams.has('sslmode')) {
        u.searchParams.set('sslmode', 'require');
      }
      if (!u.searchParams.has('schema')) {
        u.searchParams.set('schema', 'public');
      }
      if (!u.searchParams.has('connect_timeout')) {
        u.searchParams.set('connect_timeout', '15');
      }
      if (usesPooler) {
        if (!u.searchParams.has('pgbouncer')) {
          u.searchParams.set('pgbouncer', 'true');
        }
        if (!u.searchParams.has('connection_limit')) {
          u.searchParams.set('connection_limit', '1');
        }
      }
    }
    return u.toString();
  } catch {
    return trimmed;
  }
}

export function resolveDatabaseUrl(): void {
  const direct = process.env.DATABASE_URL ? cleanEnvUrl(process.env.DATABASE_URL) : '';
  const fallback =
    direct ||
    (process.env.POSTGRES_PRISMA_URL ? cleanEnvUrl(process.env.POSTGRES_PRISMA_URL) : '') ||
    (process.env.POSTGRES_URL ? cleanEnvUrl(process.env.POSTGRES_URL) : '') ||
    (process.env.SUPABASE_DATABASE_URL ? cleanEnvUrl(process.env.SUPABASE_DATABASE_URL) : '');

  if (!fallback) return;

  process.env.DATABASE_URL = normalizePostgresUrl(fallback);
}

/**
 * Prisma `directUrl` — direct Postgres for migrations. Supabase: `db.<project-ref>.supabase.co:5432`
 * (not the pooler). Vercel often only sets DATABASE_URL; fall back so the client can start.
 * For `prisma migrate`, set DIRECT_URL explicitly in `.env` (see `.env.example`).
 */
export function resolveDirectUrl(): void {
  resolveDatabaseUrl();

  const explicit = process.env.DIRECT_URL ? cleanEnvUrl(process.env.DIRECT_URL) : '';
  const fromIntegration =
    (process.env.POSTGRES_URL_NON_POOLING ? cleanEnvUrl(process.env.POSTGRES_URL_NON_POOLING) : '') ||
    (process.env.SUPABASE_DIRECT_URL ? cleanEnvUrl(process.env.SUPABASE_DIRECT_URL) : '');

  const raw = explicit || fromIntegration || process.env.DATABASE_URL || '';
  if (!raw) return;

  process.env.DIRECT_URL = normalizePostgresUrl(raw);
}
