import { describe, expect, it } from "vitest";
import { buildMonthlyFinancePlan } from "@/features/finance/calculations";
import type { FinanceSnapshot } from "@/features/finance/data-service";
import { sampleDebts, sampleExpenses, sampleProfile } from "@/lib/sample-data/finance";
import {
  buildCurrentMemorySnapshotInput,
  buildFinancialMemoryReport,
  captureFinancialMemorySnapshot,
  compareMemoryWindows,
} from "./service";
import type { FinancialMemorySnapshotRecord } from "./types";

function makeSnapshot(overrides: Partial<FinancialMemorySnapshotRecord>): FinancialMemorySnapshotRecord {
  return {
    id: overrides.periodMonth ?? "2026-07",
    periodMonth: "2026-07",
    capturedAt: new Date("2026-07-05T12:00:00.000Z"),
    trigger: "manual_refresh",
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
    riskLevel: "low",
    criticalReasonCount: 0,
    warningCount: 0,
    fallbackRateDebtCount: 0,
    missingRateDebtCount: 0,
    manualRateDebtCount: 1,
    providerRateDebtCount: 1,
    planExtraDebtPaymentKurus: 20_000_00,
    planMinimumPaymentsCovered: true,
    categoryTotals: [{ category: "rent", amountKurus: 25_000_00, itemCount: 1 }],
    createdAt: new Date("2026-07-05T12:00:00.000Z"),
    updatedAt: new Date("2026-07-05T12:00:00.000Z"),
    ...overrides,
  };
}

describe("financial memory service", () => {
  it("captures a deterministic snapshot from finance engine output", () => {
    const financeSnapshot: FinanceSnapshot = {
      hasProfile: true,
      profile: sampleProfile,
      debts: sampleDebts,
      expenses: sampleExpenses,
    };
    const monthlyPlan = buildMonthlyFinancePlan(sampleProfile, sampleDebts, sampleExpenses, {
      asOfDate: new Date("2026-07-05T12:00:00.000Z"),
      horizonMonths: 3,
    });
    const snapshot = captureFinancialMemorySnapshot(
      financeSnapshot,
      monthlyPlan,
      "manual_refresh",
      new Date("2026-07-05T12:00:00.000Z"),
    );

    expect(snapshot.periodMonth).toBe("2026-07");
    expect(snapshot.salaryKurus).toBe(sampleProfile.monthlySalaryKurus);
    expect(snapshot.totalDebtKurus).toBe(sampleDebts.reduce((total, debt) => total + debt.balanceKurus, 0));
    expect(snapshot.categoryTotals).toEqual(
      expect.arrayContaining([expect.objectContaining({ category: "Barınma", amountKurus: 25_000_00 })]),
    );
  });

  it("compares 3 month windows and calculates trend deltas", () => {
    const snapshots = [
      makeSnapshot({ periodMonth: "2026-05", totalDebtKurus: 120_000_00, survivalBudgetKurus: 30_000_00 }),
      makeSnapshot({ periodMonth: "2026-06", totalDebtKurus: 105_000_00, survivalBudgetKurus: 35_000_00, riskLevel: "high" }),
      makeSnapshot({ periodMonth: "2026-07", totalDebtKurus: 90_000_00, survivalBudgetKurus: 45_000_00 }),
    ];
    const comparison = compareMemoryWindows(snapshots, 3);

    expect(comparison.hasEnoughHistory).toBe(true);
    expect(comparison.totalDebtDeltaKurus).toBe(-30_000_00);
    expect(comparison.survivalBudgetDeltaKurus).toBe(15_000_00);
    expect(comparison.highRiskMonthCount).toBe(1);
  });

  it("reports insufficient history when there is only one snapshot", () => {
    const report = buildFinancialMemoryReport([makeSnapshot({ periodMonth: "2026-07" })]);

    expect(report.hasEnoughHistory).toBe(false);
    expect(report.insights[0].title).toBe("Yeterli geçmiş yok");
    expect(report.comparisons.every((comparison) => !comparison.hasEnoughHistory)).toBe(true);
  });

  it("builds insights for increasing debt and shrinking living budget", () => {
    const report = buildFinancialMemoryReport([
      makeSnapshot({ periodMonth: "2026-06", totalDebtKurus: 80_000_00, survivalBudgetKurus: 50_000_00 }),
      makeSnapshot({ periodMonth: "2026-07", totalDebtKurus: 95_000_00, survivalBudgetKurus: 35_000_00 }),
    ]);

    expect(report.insights.map((item) => item.title)).toContain("Toplam borç artıyor");
    expect(report.insights.map((item) => item.title)).toContain("Yaşam bütçesi daralıyor");
  });

  it("counts fallback and missing interest usage", () => {
    const financeSnapshot: FinanceSnapshot = {
      hasProfile: true,
      profile: sampleProfile,
      debts: [
        { ...sampleDebts[0], interestRateSource: "fallback:sample" },
        { ...sampleDebts[1], interestRateMonthly: 0, interestRateSource: "missing" },
      ],
      expenses: sampleExpenses,
    };
    const snapshot = buildCurrentMemorySnapshotInput(financeSnapshot, "manual_refresh", new Date("2026-07-05T12:00:00.000Z"));

    expect(snapshot.fallbackRateDebtCount).toBe(1);
    expect(snapshot.missingRateDebtCount).toBe(1);
  });
});
