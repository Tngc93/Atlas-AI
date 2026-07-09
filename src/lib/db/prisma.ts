import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function resolveDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (process.env.NODE_ENV === "production" && !databaseUrl) {
    throw new Error("DATABASE_URL must be set in production.");
  }

  return databaseUrl || "file:./dev.db";
}

export function getPrisma(): PrismaClient {
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
