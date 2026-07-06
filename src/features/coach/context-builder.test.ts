import { describe, expect, it } from "vitest";
import type { MonthlyFinancePlan } from "@/features/finance/types";
import type { FinancialMemoryReport } from "@/features/memory/types";
import { sampleInterestRateSnapshot } from "@/features/rates/tcmb-provider";
import { buildCoachContext, buildCoachInputSummary, buildCoachMemoryContext } from "./context-builder";

function makePlan(): MonthlyFinancePlan {
  return {
    asOfDateIso: "2026-07-05T00:00:00.000Z",
    monthLabel: "Temmuz 2026",
    strategy: "avalanche",
    cashFlow: {
      salaryKurus: 85_000_00,
      mandatoryExpenseTotalKurus: 30_000_00,
      minimumDebtPaymentsKurus: 5_000_00,
      totalRequiredKurus: 35_000_00,
      survivalBudgetKurus: 20_000_00,
      emergencyBufferKurus: 10_000_00,
      extraDebtPaymentKurus: 10_000_00,
      unallocatedKurus: 0,
      riskLevel: "low",
      negativeCashFlowKurus: 0,
      minimumPaymentsCovered: true,
    },
    livingBudget: {
      remainingForMonthKurus: 20_000_00,
      protectedBufferKurus: 10_000_00,
      dailyLimitKurus: 1_000_00,
      weeklyLimitKurus: 7_000_00,
      daysRemainingInMonth: 20,
    },
    riskLevel: "low",
    criticalReasons: [],
    warnings: [],
    dueDateRisks: [],
    debtPriorities: [
      {
        id: "debt-1",
        type: "credit_card",
        name: "Örnek Kart",
        lender: "Örnek Banka",
        balanceKurus: 10_000_00,
        interestRateMonthly: 4.25,
        minimumPaymentKurus: 1_000_00,
        dueDay: 15,
        status: "active",
        priorityRank: 1,
        reason: "Yüksek faiz",
      },
    ],
    paymentAllocations: [],
    payoffForecast: [],
    actionPlan: [
      {
        id: "action-1",
        title: "Asgari ödemeleri güvenceye al",
        description: "Önce asgari ödemeleri koru.",
        priority: "high",
      },
    ],
  };
}

function makeMemoryReport(): FinancialMemoryReport {
  return {
    generatedAtIso: "2026-07-05T00:00:00.000Z",
    hasAnySnapshot: true,
    hasEnoughHistory: true,
    snapshotCount: 3,
    latestSnapshot: {
      id: "snapshot-3",
      periodMonth: "2026-07",
      capturedAt: new Date("2026-07-05T00:00:00.000Z"),
      trigger: "manual_refresh",
      salaryKurus: 85_000_00,
      mandatoryExpenseTotalKurus: 30_000_00,
      minimumDebtPaymentsKurus: 5_000_00,
      survivalBudgetKurus: 20_000_00,
      dailyLimitKurus: 1_000_00,
      weeklyLimitKurus: 7_000_00,
      extraDebtPaymentCapacityKurus: 10_000_00,
      totalDebtKurus: 10_000_00,
      activeDebtKurus: 10_000_00,
      creditCardDebtKurus: 10_000_00,
      activeDebtCount: 1,
      paidOffDebtCount: 0,
      riskLevel: "low",
      criticalReasonCount: 0,
      warningCount: 0,
      fallbackRateDebtCount: 0,
      missingRateDebtCount: 0,
      manualRateDebtCount: 1,
      providerRateDebtCount: 0,
      planExtraDebtPaymentKurus: 10_000_00,
      planMinimumPaymentsCovered: true,
      createdAt: new Date("2026-07-05T00:00:00.000Z"),
      updatedAt: new Date("2026-07-05T00:00:00.000Z"),
      categoryTotals: [],
    },
    trend: [],
    comparisons: [
      {
        months: 3,
        hasEnoughHistory: true,
        availableMonths: 3,
        totalDebtDeltaKurus: -5_000_00,
        activeDebtDeltaKurus: -5_000_00,
        survivalBudgetDeltaKurus: 2_000_00,
        mandatoryExpenseRatioDelta: -0.02,
        creditCardDebtShareDelta: 0,
        highRiskMonthCount: 1,
        cashSqueezeCount: 1,
        debtVelocityKurus: 2_500_00,
      },
    ],
    insights: [
      { id: "debt-trend", title: "Toplam borç azalıyor", body: "Borç trendi aşağı yönlü.", tone: "low" },
      { id: "local-only", title: "Analiz lokal veriye dayanır", body: "Veri cihazda kalır.", tone: "low" },
    ],
    categoryChanges: [],
    planAdherence: {
      label: "Plan uyumu",
      score: 70,
      helper: "Sınırlı güvenilirlikte göstergedir.",
    },
  };
}

describe("coach context builder", () => {
  it("builds the existing minimized coach input summary without raw debt names", () => {
    const summary = buildCoachInputSummary(makePlan(), sampleInterestRateSnapshot);
    const serialized = JSON.stringify(summary);

    expect(summary.activeDebtCount).toBe(1);
    expect(summary.topDebtRateBand).toBe("high");
    expect(serialized).not.toContain("Örnek Kart");
    expect(serialized).not.toContain("Örnek Banka");
  });

  it("adds reduced financial memory signals to the coach context", () => {
    const context = buildCoachContext({
      monthlyPlan: makePlan(),
      rateSnapshot: sampleInterestRateSnapshot,
      memoryReport: makeMemoryReport(),
      builtAt: new Date("2026-07-05T00:00:00.000Z"),
    });

    expect(context.version).toBe("coach-context-v1");
    expect(context.summary.month).toBe("Temmuz 2026");
    expect(context.memory).toMatchObject({
      hasAnySnapshot: true,
      hasEnoughHistory: true,
      snapshotCount: 3,
      latestPeriodMonth: "2026-07",
      highRiskMonthCount: 1,
      cashSqueezeCount: 1,
      totalDebtTrend: "decreasing",
      survivalBudgetTrend: "improving",
      planAdherenceScore: 70,
    });
    expect(context.memory.insightTitles).toEqual(["Toplam borç azalıyor", "Analiz lokal veriye dayanır"]);
  });

  it("uses an empty memory context when memory history is unavailable", () => {
    expect(buildCoachMemoryContext(null)).toEqual({
      hasAnySnapshot: false,
      hasEnoughHistory: false,
      snapshotCount: 0,
      latestPeriodMonth: null,
      highRiskMonthCount: 0,
      cashSqueezeCount: 0,
      totalDebtTrend: "unknown",
      survivalBudgetTrend: "unknown",
      planAdherenceScore: null,
      insightTitles: [],
    });
  });
});
