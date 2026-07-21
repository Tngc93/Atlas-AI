import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const ALLOWED_SCHEMA_PREFIXES = ["pfc_it_", "pfc_e2e_"];
const REQUIRED_CONFIRMATION = "test-preview";
const PREVIEW_SCHEMA_NAME = "preview_app";
const BASELINE_DEPLOY_CONFIRMATION = "test-preview:preview_app";

function parseDatabaseUrl(value, variableName) {
  if (!value) {
    throw new Error(`${variableName} test veritabanı için zorunludur.`);
  }

  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${variableName} geçerli bir PostgreSQL URL olmalıdır.`);
  }

  if (!["postgresql:", "postgres:"].includes(parsed.protocol)) {
    throw new Error(`${variableName} PostgreSQL protokolü kullanmalıdır.`);
  }

  if (!parsed.hostname.endsWith(".neon.tech")) {
    throw new Error(`${variableName} yalnızca izin verilen Neon test endpoint'ini kullanabilir.`);
  }

  if (parsed.searchParams.get("sslmode") !== "require") {
    throw new Error(`${variableName} sslmode=require içermelidir.`);
  }

  return parsed;
}

function endpointIdFromHostname(hostname) {
  return hostname.split(".")[0].replace(/-pooler$/, "");
}

export function validatePostgresTestEnvironment(env = process.env) {
  if (env.NODE_ENV !== "test") {
    throw new Error("PostgreSQL test veritabanı yalnızca NODE_ENV=test iken kullanılabilir.");
  }

  if (env.TEST_DATABASE_RESET_CONFIRM !== REQUIRED_CONFIRMATION) {
    throw new Error("Test veritabanı işlemi için açık test-preview onayı eksik.");
  }

  const endpointId = env.TEST_NEON_ENDPOINT_ID?.trim();
  if (!endpointId || !/^ep-[a-z0-9-]+$/.test(endpointId)) {
    throw new Error("TEST_NEON_ENDPOINT_ID geçerli bir Neon test endpoint kimliği olmalıdır.");
  }

  const pooled = parseDatabaseUrl(env.TEST_DATABASE_URL, "TEST_DATABASE_URL");
  const direct = parseDatabaseUrl(env.TEST_DIRECT_URL, "TEST_DIRECT_URL");
  const pooledEndpointId = endpointIdFromHostname(pooled.hostname);
  const directEndpointId = endpointIdFromHostname(direct.hostname);

  if (pooledEndpointId !== endpointId || directEndpointId !== endpointId) {
    throw new Error("Test bağlantıları izin verilen Neon test endpoint'iyle eşleşmiyor.");
  }

  if (!pooled.hostname.startsWith(`${endpointId}-pooler.`)) {
    throw new Error("TEST_DATABASE_URL pooled Neon endpoint kullanmalıdır.");
  }

  if (direct.hostname.startsWith(`${endpointId}-pooler.`)) {
    throw new Error("TEST_DIRECT_URL direct Neon endpoint kullanmalıdır.");
  }

  if (pooled.pathname !== direct.pathname) {
    throw new Error("Pooled ve direct test bağlantıları aynı veritabanını hedeflemelidir.");
  }

  return {
    pooledUrl: pooled.toString(),
    directUrl: direct.toString(),
    endpointId,
  };
}

export function validateBaselineDeployEnvironment(env = process.env) {
  const testEnvironment = validatePostgresTestEnvironment(env);

  if (env.TEST_BASELINE_DEPLOY_CONFIRM !== BASELINE_DEPLOY_CONFIRMATION) {
    throw new Error("PostgreSQL baseline deploy için açık test-preview:preview_app onayı eksik.");
  }

  return {
    ...testEnvironment,
    schemaName: PREVIEW_SCHEMA_NAME,
  };
}

function assertSafeSchemaName(schemaName) {
  const hasAllowedPrefix = ALLOWED_SCHEMA_PREFIXES.some((prefix) => schemaName.startsWith(prefix));

  if (!hasAllowedPrefix || !/^[a-z0-9_]+$/.test(schemaName) || schemaName.length > 63) {
    throw new Error("Güvenli olmayan PostgreSQL test schema adı reddedildi.");
  }
}

export function buildSchemaDatabaseUrl(databaseUrl, schemaName) {
  assertSafeSchemaName(schemaName);
  const parsed = new URL(databaseUrl);
  parsed.searchParams.set("schema", schemaName);
  return parsed.toString();
}

export function buildPreviewSchemaDatabaseUrl(databaseUrl) {
  const parsed = new URL(databaseUrl);
  parsed.searchParams.set("schema", PREVIEW_SCHEMA_NAME);
  return parsed.toString();
}

function createSchemaName(kind, suiteName) {
  const prefix = kind === "integration" ? "pfc_it_" : "pfc_e2e_";
  const safeSuite = suiteName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 20);
  const runId = `${Date.now().toString(36)}_${process.pid}`;
  return `${prefix}${safeSuite || "suite"}_${runId}`.slice(0, 63);
}

function createAdminClient(directUrl) {
  const adminUrl = new URL(directUrl);
  adminUrl.searchParams.set("schema", "public");

  return new PrismaClient({
    datasources: {
      db: { url: adminUrl.toString() },
    },
  });
}

async function dropTestSchema(admin, schemaName) {
  assertSafeSchemaName(schemaName);
  await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
}

export async function cleanupPostgresTestSchema(schemaName) {
  const testEnvironment = validatePostgresTestEnvironment();
  const admin = createAdminClient(testEnvironment.directUrl);

  try {
    await dropTestSchema(admin, schemaName);
  } finally {
    await admin.$disconnect();
  }
}

export async function createPostgresTestContext(suiteName, kind = "integration") {
  const testEnvironment = validatePostgresTestEnvironment();
  const schemaName = createSchemaName(kind, suiteName);
  assertSafeSchemaName(schemaName);

  const databaseUrl = buildSchemaDatabaseUrl(testEnvironment.pooledUrl, schemaName);
  const directUrl = buildSchemaDatabaseUrl(testEnvironment.directUrl, schemaName);
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousDirectUrl = process.env.DIRECT_URL;
  const admin = createAdminClient(testEnvironment.directUrl);
  let schemaCreated = false;
  let preparationStage = "schema bağlantısı";

  try {
    preparationStage = "geçici schema oluşturma";
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schemaName}"`);
    schemaCreated = true;

    preparationStage = "PostgreSQL baseline migration";
    execFileSync("npx", ["prisma", "migrate", "deploy"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        DIRECT_URL: directUrl,
      },
      stdio: "pipe",
    });

    process.env.DATABASE_URL = databaseUrl;
    process.env.DIRECT_URL = directUrl;
  } catch (error) {
    if (schemaCreated) {
      await dropTestSchema(admin, schemaName);
    }
    await admin.$disconnect();
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`İzole PostgreSQL test schema'sı hazırlanamadı: ${preparationStage}. ${detail}`, {
      cause: error,
    });
  }

  let cleanedUp = false;

  return {
    schemaName,
    databaseUrl,
    directUrl,
    cleanup: async () => {
      if (cleanedUp) {
        return;
      }

      cleanedUp = true;

      try {
        await dropTestSchema(admin, schemaName);
      } finally {
        await admin.$disconnect();

        if (previousDatabaseUrl === undefined) {
          delete process.env.DATABASE_URL;
        } else {
          process.env.DATABASE_URL = previousDatabaseUrl;
        }

        if (previousDirectUrl === undefined) {
          delete process.env.DIRECT_URL;
        } else {
          process.env.DIRECT_URL = previousDirectUrl;
        }
      }
    },
  };
}
