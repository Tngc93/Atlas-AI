import { describe, expect, it } from "vitest";
import type { FinancialMemoryReport, FinancialMemorySnapshotRecord, MemoryTrendPoint, MemoryWindowComparison } from "@/features/memory/types";
import { analyzeCoachTrends } from "./trend-analyzer";

function makeSnapshot(periodMonth: string, overrides: Partial<FinancialMemorySnapshotRecord> = {}): FinancialMemorySnapshotRecord {
  return {
    id: periodMonth,
    periodMonth,
    capturedAt: new Date(`${periodMonth}-05T00:00:00.000Z`),
    trigger: "manual_refresh",
    salaryKurus: 80_000_00,
    mandatoryExpenseTotalKurus: 30_000_00,
    minimumDebtPaymentsKurus: 8_000_00,
    survivalBudgetKurus: 20_000_00,
    dailyLimitKurus: 1_000_00,
    weeklyLimitKurus: 7_000_00,
    extraDebtPaymentCapacityKurus: 10_000_00,
    totalDebtKurus: 100_000_00,
    activeDebtKurus: 100_000_00,
    creditCardDebtKurus: 50_000_00,
    activeDebtCount: 2,
    paidOffDebtCount: 0,
    riskLevel: "medium",
    criticalReasonCount: 0,
    warningCount: 1,
    fallbackRateDebtCount: 0,
    missingRateDebtCount: 0,
    manualRateDebtCount: 1,
    providerRateDebtCount: 0,
    planExtraDebtPaymentKurus: 10_000_00,
    planMinimumPaymentsCovered: true,
    createdAt: new Date(`${periodMonth}-05T00:00:00.000Z`),
    updatedAt: new Date(`${periodMonth}-05T00:00:00.000Z`),
    categoryTotals: [],
    ...overrides,
  };
}

function trendPoint(snapshot: FinancialMemorySnapshotRecord): MemoryTrendPoint {
  return {
    periodMonth: snapshot.periodMonth,
    totalDebtKurus: snapshot.totalDebtKurus,
    activeDebtKurus: snapshot.activeDebtKurus,
    creditCardDebtKurus: snapshot.creditCardDebtKurus,
    mandatoryExpenseTotalKurus: snapshot.mandatoryExpenseTotalKurus,
    salaryKurus: snapshot.salaryKurus,
    survivalBudgetKurus: snapshot.survivalBudgetKurus,
    minimumDebtPaymentsKurus: snapshot.minimumDebtPaymentsKurus,
    extraDebtPaymentCapacityKurus: snapshot.extraDebtPaymentCapacityKurus,
    riskLevel: snapshot.riskLevel,
  };
}

function comparison(overrides: Partial<MemoryWindowComparison> = {}): MemoryWindowComparison {
  return {
    months: 3,
    hasEnoughHistory: true,
    availableMonths: 3,
    totalDebtDeltaKurus: -30_000_00,
    activeDebtDeltaKurus: -30_000_00,
    survivalBudgetDeltaKurus: 5_000_00,
    mandatoryExpenseRatioDelta: -0.02,
    creditCardDebtShareDelta: 0,
    highRiskMonthCount: 1,
    cashSqueezeCount: 1,
    debtVelocityKurus: 15_000_00,
    ...overrides,
  };
}

function report(snapshots: FinancialMemorySnapshotRecord[], comparisons: MemoryWindowComparison[] = [comparison()]): FinancialMemoryReport {
  return {
    generatedAtIso: "2026-07-05T00:00:00.000Z",
    hasAnySnapshot: snapshots.length > 0,
    hasEnoughHistory: snapshots.length >= 2,
    snapshotCount: snapshots.length,
    latestSnapshot: snapshots.at(-1) ?? null,
    trend: snapshots.map(trendPoint),
    comparisons,
    insights: [],
    categoryChanges: [],
    planAdherence: {
      label: "Plan uyumu",
      score: null,
      helper: "Test",
    },
  };
}

describe("coach trend analyzer", () => {
  it("returns no-snapshot and single-snapshot insufficient history signals", () => {
    expect(analyzeCoachTrends(null)).toMatchObject({
      hasEnoughHistory: false,
      reason: "no_snapshot",
      labels: ["Yeterli geçmiş yok"],
    });

    expect(analyzeCoachTrends(report([makeSnapshot("2026-07")]))).toMatchObject({
      hasEnoughHistory: false,
      reason: "single_snapshot",
      availableMonths: 1,
    });
  });

  it("detects improving income, debt, survival budget, risk and repeated cash squeeze trends", () => {
    const first = makeSnapshot("2026-05", {
      salaryKurus: 70_000_00,
      mandatoryExpenseTotalKurus: 32_000_00,
      minimumDebtPaymentsKurus: 12_000_00,
      survivalBudgetKurus: 8_000_00,
      totalDebtKurus: 140_000_00,
      activeDebtKurus: 140_000_00,
      riskLevel: "high",
    });
    const middle = makeSnapshot("2026-06", { riskLevel: "high" });
    const latest = makeSnapshot("2026-07", {
      salaryKurus: 90_000_00,
      mandatoryExpenseTotalKurus: 28_000_00,
      minimumDebtPaymentsKurus: 8_000_00,
      survivalBudgetKurus: 20_000_00,
      totalDebtKurus: 90_000_00,
      activeDebtKurus: 90_000_00,
      riskLevel: "medium",
    });

    const trends = analyzeCoachTrends(report([first, middle, latest], [comparison({ cashSqueezeCount: 2, highRiskMonthCount: 2 })]));

    expect(trends).toMatchObject({
      hasEnoughHistory: true,
      windowMonths: 3,
      incomeTrend: "increasing",
      mandatoryExpenseTrend: "decreasing",
      totalDebtTrend: "decreasing",
      activeDebtTrend: "decreasing",
      survivalBudgetTrend: "improving",
      minimumPaymentBurdenTrend: "decreasing",
      minimumPaymentBurden: "low",
      riskTrend: "improving",
      debtPayoffVelocity: "large",
      cashSqueezeRecurrence: "repeated",
      highRiskMonthCount: 2,
    });
    expect(trends.labels).toEqual(expect.arrayContaining(["Borç yükü azalıyor", "Yaşam bütçesi güçleniyor", "Risk tekrar ediyor"]));
  });

  it("detects worsening expense, debt, survival budget and risk pressure", () => {
    const first = makeSnapshot("2026-06", {
      salaryKurus: 90_000_00,
      mandatoryExpenseTotalKurus: 25_000_00,
      minimumDebtPaymentsKurus: 8_000_00,
      survivalBudgetKurus: 25_000_00,
      totalDebtKurus: 80_000_00,
      activeDebtKurus: 70_000_00,
      riskLevel: "low",
    });
    const latest = makeSnapshot("2026-07", {
      salaryKurus: 90_000_00,
      mandatoryExpenseTotalKurus: 40_000_00,
      minimumDebtPaymentsKurus: 30_000_00,
      survivalBudgetKurus: -5_000_00,
      totalDebtKurus: 110_000_00,
      activeDebtKurus: 100_000_00,
      riskLevel: "high",
    });

    const trends = analyzeCoachTrends(
      report([first, latest], [comparison({ availableMonths: 2, totalDebtDeltaKurus: 30_000_00, cashSqueezeCount: 1, debtVelocityKurus: 0 })]),
    );

    expect(trends).toMatchObject({
      incomeTrend: "flat",
      mandatoryExpenseTrend: "increasing",
      totalDebtTrend: "increasing",
      activeDebtTrend: "increasing",
      survivalBudgetTrend: "worsening",
      minimumPaymentBurdenTrend: "increasing",
      minimumPaymentBurden: "high",
      riskTrend: "worsening",
      debtPayoffVelocity: "none",
      cashSqueezeRecurrence: "occasional",
    });
    expect(trends.labels).toEqual(expect.arrayContaining(["Borç yükü artıyor", "Zorunlu gider baskısı artıyor", "Yaşam bütçesi daralıyor"]));
  });
});
