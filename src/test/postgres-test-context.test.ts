import { describe, expect, it } from "vitest";
import {
  buildPreviewSchemaDatabaseUrl,
  buildSchemaDatabaseUrl,
  validateBaselineDeployEnvironment,
  validatePostgresTestEnvironment,
} from "./postgres-test-context";

const pooledUrl =
  "postgresql://test_user:test_password@ep-test-preview-pooler.us-east-2.aws.neon.tech/testdb?sslmode=require";
const directUrl =
  "postgresql://test_user:test_password@ep-test-preview.us-east-2.aws.neon.tech/testdb?sslmode=require";

function makeEnv(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "test",
    TEST_DATABASE_URL: pooledUrl,
    TEST_DIRECT_URL: directUrl,
    TEST_NEON_ENDPOINT_ID: "ep-test-preview",
    TEST_DATABASE_RESET_CONFIRM: "test-preview",
    ...overrides,
  };
}

describe("PostgreSQL test context guardrails", () => {
  it("accepts matching pooled and direct Neon test endpoints", () => {
    const result = validatePostgresTestEnvironment(makeEnv());

    expect(result.endpointId).toBe("ep-test-preview");
    expect(result.pooledUrl).not.toContain("public");
  });

  it("rejects a mismatched endpoint before any database operation", () => {
    expect(() =>
      validatePostgresTestEnvironment(
        makeEnv({
          TEST_NEON_ENDPOINT_ID: "ep-other-preview",
        }),
      ),
    ).toThrow("izin verilen Neon test endpoint'iyle eşleşmiyor");
  });

  it("rejects production-like and public schema names", () => {
    expect(() => buildSchemaDatabaseUrl(pooledUrl, "public")).toThrow("Güvenli olmayan");
    expect(() => buildSchemaDatabaseUrl(pooledUrl, "preview_app")).toThrow("Güvenli olmayan");
  });

  it("adds an isolated schema without exposing credentials separately", () => {
    const result = new URL(buildSchemaDatabaseUrl(pooledUrl, "pfc_it_finance_run1"));

    expect(result.searchParams.get("schema")).toBe("pfc_it_finance_run1");
    expect(result.searchParams.get("sslmode")).toBe("require");
  });

  it("requires a separate explicit confirmation for the persistent preview baseline", () => {
    expect(() => validateBaselineDeployEnvironment(makeEnv())).toThrow("baseline deploy");

    const result = validateBaselineDeployEnvironment(
      makeEnv({ TEST_BASELINE_DEPLOY_CONFIRM: "test-preview:preview_app" }),
    );
    const previewUrl = new URL(buildPreviewSchemaDatabaseUrl(result.directUrl));

    expect(result.schemaName).toBe("preview_app");
    expect(previewUrl.searchParams.get("schema")).toBe("preview_app");
  });
});
