import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL ?? "file:./dev.db",
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
