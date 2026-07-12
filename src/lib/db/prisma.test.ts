import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveDatabaseUrl } from "./prisma";

describe("resolveDatabaseUrl", () => {
  it("accepts a PostgreSQL URL", () => {
    expect(resolveDatabaseUrl({ DATABASE_URL: "postgresql://unused:unused@localhost:5432/unused" })).toBe(
      "postgresql://unused:unused@localhost:5432/unused",
    );
  });

  it("rejects missing and SQLite datasource URLs", () => {
    expect(() => resolveDatabaseUrl({})).toThrow("DATABASE_URL is required");
    expect(() => resolveDatabaseUrl({ DATABASE_URL: "file:./dev.db" })).toThrow("PostgreSQL protocol");
  });
});

describe("Prisma public demo guard", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("rejects database initialization before resolving DATABASE_URL in demo mode", async () => {
    vi.stubEnv("PUBLIC_DEMO_MODE", "true");
    vi.stubEnv("DATABASE_URL", "");
    const { getPrisma } = await import("./prisma");

    expect(() => getPrisma()).toThrow("Database access is disabled");
  });
});
