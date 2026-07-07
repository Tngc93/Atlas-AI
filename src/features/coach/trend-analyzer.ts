import type { FinancialMemoryReport, MemoryTrendPoint, MemoryWindowComparison } from "@/features/memory/types";
import type { CoachTrendBurden, CoachTrendContext, CoachTrendDirection, CoachTrendMagnitude } from "./types";

const FLAT_KURUS_THRESHOLD = 100_00;
const RATIO_THRESHOLD = 0.005;

function emptyTrendContext(reason: CoachTrendContext["reason"], availableMonths: number): CoachTrendContext {
  return {
    hasEnoughHistory: false,
    reason,
    windowMonths: null,
    availableMonths,
    incomeTrend: "unknown",
    mandatoryExpenseTrend: "unknown",
    totalDebtTrend: "unknown",
    activeDebtTrend: "unknown",
    survivalBudgetTrend: "unknown",
    minimumPaymentBurdenTrend: "unknown",
    minimumPaymentBurden: "unknown",
    riskTrend: "unknown",
    debtPayoffVelocity: "none",
    cashSqueezeRecurrence: "none",
    highRiskMonthCount: 0,
    labels: reason === "no_snapshot" ? ["Yeterli geçmiş yok"] : ["Trend için en az iki aylık hafıza gerekir"],
  };
}

function ratio(part: number, total: number): number {
  return total > 0 ? part / total : 0;
}

function riskScore(riskLevel: MemoryTrendPoint["riskLevel"]): number {
  if (riskLevel === "high") {
    return 3;
  }

  if (riskLevel === "medium") {
    return 2;
  }

  return 1;
}

function directionFromDelta(delta: number, positiveDirection: "increasing" | "improving" = "increasing"): CoachTrendDirection {
  if (Math.abs(delta) < FLAT_KURUS_THRESHOLD) {
    return "flat";
  }

  if (positiveDirection === "improving") {
    return delta > 0 ? "improving" : "worsening";
  }

  return delta > 0 ? "increasing" : "decreasing";
}

function ratioDirectionFromDelta(delta: number): CoachTrendDirection {
  if (Math.abs(delta) < RATIO_THRESHOLD) {
    return "flat";
  }

  return delta > 0 ? "increasing" : "decreasing";
}

function riskDirection(first: MemoryTrendPoint, latest: MemoryTrendPoint): CoachTrendDirection {
  const delta = riskScore(latest.riskLevel) - riskScore(first.riskLevel);

  if (delta === 0) {
    return "flat";
  }

  return delta > 0 ? "worsening" : "improving";
}

function burdenBand(value: number): CoachTrendBurden {
  if (value <= 0) {
    return "unknown";
  }

  if (value < 0.15) {
    return "low";
  }

  if (value < 0.3) {
    return "medium";
  }

  return "high";
}

function velocityBand(valueKurus: number): CoachTrendMagnitude {
  if (valueKurus <= 0) {
    return "none";
  }

  if (valueKurus < 2_500_00) {
    return "small";
  }

  if (valueKurus < 10_000_00) {
    return "medium";
  }

  return "large";
}

function cashSqueezeRecurrence(cashSqueezeCount: number): CoachTrendContext["cashSqueezeRecurrence"] {
  if (cashSqueezeCount <= 0) {
    return "none";
  }

  if (cashSqueezeCount === 1) {
    return "occasional";
  }

  return "repeated";
}

function selectComparison(report: FinancialMemoryReport): MemoryWindowComparison | undefined {
  return report.comparisons.find((comparison) => comparison.hasEnoughHistory);
}

function buildLabels(context: Omit<CoachTrendContext, "labels">): string[] {
  const labels: string[] = [];

  if (context.totalDebtTrend === "decreasing" || context.activeDebtTrend === "decreasing") {
    labels.push("Borç yükü azalıyor");
  } else if (context.totalDebtTrend === "increasing" || context.activeDebtTrend === "increasing") {
    labels.push("Borç yükü artıyor");
  }

  if (context.mandatoryExpenseTrend === "increasing") {
    labels.push("Zorunlu gider baskısı artıyor");
  }

  if (context.survivalBudgetTrend === "worsening") {
    labels.push("Yaşam bütçesi daralıyor");
  } else if (context.survivalBudgetTrend === "improving") {
    labels.push("Yaşam bütçesi güçleniyor");
  }

  if (context.riskTrend === "worsening" || context.cashSqueezeRecurrence === "repeated") {
    labels.push("Risk tekrar ediyor");
  }

  return labels.slice(0, 4);
}

export function analyzeCoachTrends(memoryReport: FinancialMemoryReport | null | undefined): CoachTrendContext {
  if (!memoryReport?.hasAnySnapshot) {
    return emptyTrendContext("no_snapshot", 0);
  }

  if (memoryReport.snapshotCount < 2 || memoryReport.trend.length < 2) {
    return emptyTrendContext("single_snapshot", memoryReport.snapshotCount);
  }

  const comparison = selectComparison(memoryReport);
  const windowMonths = comparison?.months ?? null;
  const availableMonths = comparison?.availableMonths ?? memoryReport.trend.length;
  const trendWindow = windowMonths ? memoryReport.trend.slice(-windowMonths) : memoryReport.trend;
  const first = trendWindow[0];
  const latest = trendWindow.at(-1);

  if (!first || !latest) {
    return emptyTrendContext("single_snapshot", memoryReport.snapshotCount);
  }

  const latestMinimumPaymentBurden = ratio(latest.minimumDebtPaymentsKurus, latest.salaryKurus);
  const firstMinimumPaymentBurden = ratio(first.minimumDebtPaymentsKurus, first.salaryKurus);
  const highRiskMonthCount = comparison?.highRiskMonthCount ?? trendWindow.filter((point) => point.riskLevel === "high").length;
  const cashSqueezeCount =
    comparison?.cashSqueezeCount ?? trendWindow.filter((point) => point.survivalBudgetKurus < 0 || point.riskLevel === "high").length;

  const context: Omit<CoachTrendContext, "labels"> = {
    hasEnoughHistory: true,
    reason: "none",
    windowMonths,
    availableMonths,
    incomeTrend: directionFromDelta(latest.salaryKurus - first.salaryKurus),
    mandatoryExpenseTrend: directionFromDelta(latest.mandatoryExpenseTotalKurus - first.mandatoryExpenseTotalKurus),
    totalDebtTrend: directionFromDelta(latest.totalDebtKurus - first.totalDebtKurus),
    activeDebtTrend: directionFromDelta(latest.activeDebtKurus - first.activeDebtKurus),
    survivalBudgetTrend: directionFromDelta(latest.survivalBudgetKurus - first.survivalBudgetKurus, "improving"),
    minimumPaymentBurdenTrend: ratioDirectionFromDelta(latestMinimumPaymentBurden - firstMinimumPaymentBurden),
    minimumPaymentBurden: burdenBand(latestMinimumPaymentBurden),
    riskTrend: riskDirection(first, latest),
    debtPayoffVelocity: velocityBand(comparison?.debtVelocityKurus ?? 0),
    cashSqueezeRecurrence: cashSqueezeRecurrence(cashSqueezeCount),
    highRiskMonthCount,
  };

  return {
    ...context,
    labels: buildLabels(context),
  };
}
