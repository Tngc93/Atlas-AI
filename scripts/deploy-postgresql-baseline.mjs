import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import {
  buildPreviewSchemaDatabaseUrl,
  validateBaselineDeployEnvironment,
} from "./postgres-test-context.mjs";

async function main() {
  const testEnvironment = validateBaselineDeployEnvironment();
  const databaseUrl = buildPreviewSchemaDatabaseUrl(testEnvironment.pooledUrl);
  const directUrl = buildPreviewSchemaDatabaseUrl(testEnvironment.directUrl);
  const adminUrl = new URL(testEnvironment.directUrl);
  adminUrl.searchParams.set("schema", "public");

  const admin = new PrismaClient({
    datasources: {
      db: { url: adminUrl.toString() },
    },
  });

  try {
    await admin.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS "preview_app"');
  } finally {
    await admin.$disconnect();
  }

  try {
    execFileSync("npx", ["prisma", "migrate", "deploy"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        DIRECT_URL: directUrl,
      },
      stdio: "pipe",
    });
  } catch {
    throw new Error("PostgreSQL baseline yalnız onaylı test-preview schema'sına uygulanamadı.");
  }

  console.log("PostgreSQL baseline onaylı test-preview/preview_app schema'sına uygulandı.");
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : "PostgreSQL baseline deploy başarısız.");
  process.exit(1);
}
