import type { MonthlyFinancePlan } from "@/features/finance/types";
import type { FinancialMemoryReport } from "@/features/memory/types";
import type { InterestRateSnapshot } from "@/features/rates/types";
import type { CoachContext, CoachInputSummary, CoachMemoryContext } from "./types";

function bandAmount(valueKurus: number): CoachInputSummary["salaryBand"] {
  if (valueKurus <= 0) {
    return "none";
  }

  if (valueKurus < 40_000_00) {
    return "low";
  }

  if (valueKurus < 120_000_00) {
    return "medium";
  }

  return "high";
}

function bandDailyLimit(valueKurus: number): CoachInputSummary["dailyLimitBand"] {
  if (valueKurus <= 0) {
    return "none";
  }

  if (valueKurus < 500_00) {
    return "tight";
  }

  if (valueKurus < 1_500_00) {
    return "moderate";
  }

  return "comfortable";
}

function bandRate(value: number): CoachInputSummary["topDebtRateBand"] {
  if (value <= 0) {
    return "none";
  }

  if (value < 2) {
    return "low";
  }

  if (value < 4) {
    return "medium";
  }

  return "high";
}

function debtTrendFromDelta(delta: number | undefined): CoachMemoryContext["totalDebtTrend"] {
  if (delta == null) {
    return "unknown";
  }

  if (Math.abs(delta) < 1) {
    return "flat";
  }

  return delta < 0 ? "decreasing" : "increasing";
}

function survivalBudgetTrendFromDelta(delta: number | undefined): CoachMemoryContext["survivalBudgetTrend"] {
  if (delta == null) {
    return "unknown";
  }

  if (Math.abs(delta) < 1) {
    return "flat";
  }

  return delta > 0 ? "improving" : "worsening";
}

export function buildCoachInputSummary(
  monthlyPlan: MonthlyFinancePlan,
  rateSnapshot: InterestRateSnapshot,
): CoachInputSummary {
  const salaryKurus = monthlyPlan.cashFlow.salaryKurus;
  const activeDebts = monthlyPlan.debtPriorities;
  const topDebtRate = activeDebts[0]?.interestRateMonthly ?? 0;

  return {
    month: monthlyPlan.monthLabel,
    riskLevel: monthlyPlan.riskLevel,
    salaryBand: bandAmount(salaryKurus),
    mandatoryExpenseShare: salaryKurus > 0 ? monthlyPlan.cashFlow.mandatoryExpenseTotalKurus / salaryKurus : 0,
    minimumPaymentShare: salaryKurus > 0 ? monthlyPlan.cashFlow.minimumDebtPaymentsKurus / salaryKurus : 0,
    survivalBudgetDirection:
      monthlyPlan.livingBudget.remainingForMonthKurus < 0
        ? "negative"
        : monthlyPlan.livingBudget.remainingForMonthKurus < monthlyPlan.cashFlow.emergencyBufferKurus
          ? "thin"
          : "stable",
    dailyLimitBand: bandDailyLimit(monthlyPlan.livingBudget.dailyLimitKurus),
    activeDebtCount: activeDebts.length,
    highInterestDebtCount: activeDebts.filter((debt) => debt.interestRateMonthly >= 4).length,
    topDebtRateBand: bandRate(topDebtRate),
    warningCount: monthlyPlan.warnings.length,
    criticalReasonCount: monthlyPlan.criticalReasons.length,
    actionTitles: monthlyPlan.actionPlan.slice(0, 3).map((action) => action.title),
    rateContext: {
      source: rateSnapshot.source,
      providerStatus: rateSnapshot.providerStatus,
      isFallback: rateSnapshot.providerStatus === "fallback" || rateSnapshot.source === "fallback",
    },
  };
}

export function buildCoachMemoryContext(memoryReport: FinancialMemoryReport | null | undefined): CoachMemoryContext {
  const primaryComparison = memoryReport?.comparisons.find((comparison) => comparison.hasEnoughHistory);

  return {
    hasAnySnapshot: memoryReport?.hasAnySnapshot ?? false,
    hasEnoughHistory: memoryReport?.hasEnoughHistory ?? false,
    snapshotCount: memoryReport?.snapshotCount ?? 0,
    latestPeriodMonth: memoryReport?.latestSnapshot?.periodMonth ?? null,
    highRiskMonthCount: primaryComparison?.highRiskMonthCount ?? 0,
    cashSqueezeCount: primaryComparison?.cashSqueezeCount ?? 0,
    totalDebtTrend: debtTrendFromDelta(primaryComparison?.totalDebtDeltaKurus),
    survivalBudgetTrend: survivalBudgetTrendFromDelta(primaryComparison?.survivalBudgetDeltaKurus),
    planAdherenceScore: memoryReport?.planAdherence.score ?? null,
    insightTitles: memoryReport?.insights.slice(0, 3).map((insight) => insight.title) ?? [],
  };
}

export function buildCoachContext(params: {
  monthlyPlan: MonthlyFinancePlan;
  rateSnapshot: InterestRateSnapshot;
  memoryReport?: FinancialMemoryReport | null;
  builtAt?: Date;
}): CoachContext {
  return {
    version: "coach-context-v1",
    builtAtIso: (params.builtAt ?? new Date()).toISOString(),
    summary: buildCoachInputSummary(params.monthlyPlan, params.rateSnapshot),
    memory: buildCoachMemoryContext(params.memoryReport),
  };
}

export function buildCoachContextFromSummary(summary: CoachInputSummary, builtAt = new Date()): CoachContext {
  return {
    version: "coach-context-v1",
    builtAtIso: builtAt.toISOString(),
    summary,
    memory: buildCoachMemoryContext(null),
  };
}
