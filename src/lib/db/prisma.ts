import { PrismaClient } from "@prisma/client";
import { isPublicDemoMode } from "@/lib/runtime/execution-mode";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const databaseUrl = env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for the PostgreSQL datasource.");
  }

  if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
    throw new Error("DATABASE_URL must use the PostgreSQL protocol.");
  }

  return databaseUrl;
}

export function getPrisma(): PrismaClient {
  if (isPublicDemoMode()) {
    throw new Error("Database access is disabled while PUBLIC_DEMO_MODE is enabled.");
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: resolveDatabaseUrl(),
        },
      },
    });
  }

  return globalForPrisma.prisma;
}

export async function disconnectPrismaForTests() {
  if (process.env.NODE_ENV !== "test" || !globalForPrisma.prisma) {
    return;
  }

  await globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}
