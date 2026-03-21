import { PrismaClient } from '@prisma/client';

/** Reuse one client per warm serverless instance (Vercel) to avoid exhausting DB connections. */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

