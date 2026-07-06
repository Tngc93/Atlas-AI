import { execFileSync, spawn } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL ?? "file:./e2e.db";
const env = { ...process.env, DATABASE_URL: databaseUrl };

execFileSync("npx", ["prisma", "db", "push", "--skip-generate"], {
  cwd: process.cwd(),
  env,
  stdio: "inherit",
});

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

await prisma.$transaction([
  prisma.financialMemoryCategoryTotal.deleteMany(),
  prisma.financialMemorySnapshot.deleteMany(),
  prisma.coachInsight.deleteMany(),
  prisma.interestRateSnapshot.deleteMany(),
  prisma.debtProjection.deleteMany(),
  prisma.paymentPlanMonth.deleteMany(),
  prisma.mandatoryExpense.deleteMany(),
  prisma.debtAccount.deleteMany(),
  prisma.salaryRecord.deleteMany(),
  prisma.profile.deleteMany(),
]);
await prisma.$disconnect();

const server = spawn("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", "3100"], {
  cwd: process.cwd(),
  env,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.kill(signal);
  });
}

server.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
