/**
 * Loads backend/.env and ensures DIRECT_URL exists when the schema defines `directUrl`
 * (Supabase: set DIRECT_URL to `db.<ref>.supabase.co:5432` for migrations; for local Docker
 * you can omit it and we fall back to DATABASE_URL).
 */
import { spawnSync } from 'node:child_process';
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(__dirname, '..');
config({ path: resolve(backendRoot, '.env') });

if (!process.env.DIRECT_URL?.trim() && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/prisma-with-env.mjs <prisma subcommand> [...args]');
  process.exit(1);
}

const result = spawnSync('npx', ['prisma', ...args], {
  stdio: 'inherit',
  cwd: backendRoot,
  env: process.env,
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
