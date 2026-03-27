import { resolveDatabaseUrl, resolveDirectUrl } from './lib/resolveDatabaseUrl.js';
import { PrismaClient } from '@prisma/client';

resolveDatabaseUrl();
resolveDirectUrl();

/** Reuse one client per warm serverless instance (Vercel) to avoid exhausting DB connections. */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined,
  );

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

