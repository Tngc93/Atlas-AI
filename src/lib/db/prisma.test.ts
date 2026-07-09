import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveDatabaseUrl } from "./prisma";

describe("resolveDatabaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps the local SQLite fallback outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DATABASE_URL", "");

    expect(resolveDatabaseUrl()).toBe("file:./dev.db");
  });

  it("requires DATABASE_URL in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "");

    expect(() => resolveDatabaseUrl()).toThrow("DATABASE_URL must be set in production.");
  });

  it("uses the configured DATABASE_URL when present", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "postgresql://example.invalid/app");

    expect(resolveDatabaseUrl()).toBe("postgresql://example.invalid/app");
  });
});
