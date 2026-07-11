import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "./prisma";

describe("resolveDatabaseUrl", () => {
  it("accepts a PostgreSQL URL", () => {
    expect(
      resolveDatabaseUrl({
        DATABASE_URL: "postgresql://unused:unused@localhost:5432/unused",
      }),
    ).toBe("postgresql://unused:unused@localhost:5432/unused");
  });

  it("rejects missing and SQLite datasource URLs", () => {
    expect(() => resolveDatabaseUrl({})).toThrow("DATABASE_URL is required");
    expect(() => resolveDatabaseUrl({ DATABASE_URL: "file:./dev.db" })).toThrow("PostgreSQL protocol");
  });
});
