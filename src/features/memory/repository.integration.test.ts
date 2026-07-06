import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("financial memory repository", () => {
  const dbFileName = `qa-memory-${Date.now()}-${process.pid}.db`;
  let disconnectPrismaForTests: () => Promise<void>;
  let upsertMemorySnapshot: typeof import("./repository").upsertMemorySnapshot;
  let getMemorySnapshotByMonth: typeof import("./repository").getMemorySnapshotByMonth;
  let getMemoryReportData: typeof import("./repository").getMemoryReportData;

  beforeAll(async () => {
    const migrationsPath = join(process.cwd(), "prisma/migrations");
    const migrationSql = readdirSync(migrationsPath)
      .sort()
      .map((folder) => readFileSync(join(migrationsPath, folder, "migration.sql"), "utf8"))
      .join("\n");
    execFileSync("sqlite3", [join(process.cwd(), "prisma", dbFileName)], { input: migrationSql });
    process.env.DATABASE_URL = `file:./${dbFileName}`;

    ({ disconnectPrismaForTests } = await import("@/lib/db/prisma"));
    ({ upsertMemorySnapshot, getMemorySnapshotByMonth, getMemoryReportData } = await import("./repository"));
  });

  afterAll(async () => {
    await disconnectPrismaForTests();
  });

  it("upserts one canonical monthly snapshot and replaces category totals", async () => {
    const baseInput = {
      periodMonth: "2026-07",
      capturedAt: new Date("2026-07-05T12:00:00.000Z"),
      trigger: "manual_refresh" as const,
      salaryKurus: 100_000_00,
      mandatoryExpenseTotalKurus: 40_000_00,
      minimumDebtPaymentsKurus: 10_000_00,
      survivalBudgetKurus: 50_000_00,
      dailyLimitKurus: 1_000_00,
      weeklyLimitKurus: 7_000_00,
      extraDebtPaymentCapacityKurus: 20_000_00,
      totalDebtKurus: 100_000_00,
      activeDebtKurus: 100_000_00,
      creditCardDebtKurus: 60_000_00,
      activeDebtCount: 2,
      paidOffDebtCount: 0,
      riskLevel: "low" as const,
      criticalReasonCount: 0,
      warningCount: 0,
      fallbackRateDebtCount: 0,
      missingRateDebtCount: 0,
      manualRateDebtCount: 1,
      providerRateDebtCount: 1,
      planExtraDebtPaymentKurus: 20_000_00,
      planMinimumPaymentsCovered: true,
      categoryTotals: [{ category: "rent", amountKurus: 25_000_00, itemCount: 1 }],
    };

    const first = await upsertMemorySnapshot(baseInput);
    const second = await upsertMemorySnapshot({
      ...baseInput,
      totalDebtKurus: 90_000_00,
      categoryTotals: [{ category: "internet", amountKurus: 1_000_00, itemCount: 1 }],
    });
    const stored = await getMemorySnapshotByMonth("2026-07");

    expect(second.id).toBe(first.id);
    expect(stored?.totalDebtKurus).toBe(90_000_00);
    expect(stored?.categoryTotals).toEqual([{ category: "internet", amountKurus: 1_000_00, itemCount: 1 }]);
    expect(await getMemoryReportData()).toHaveLength(1);
  });
});
