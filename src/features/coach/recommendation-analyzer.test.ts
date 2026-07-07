import { describe, expect, it } from "vitest";
import { analyzeCoachRecommendations } from "./recommendation-analyzer";
import type { CoachInputSummary, CoachMemoryContext, CoachTrendContext } from "./types";

const baseSummary: CoachInputSummary = {
  month: "Temmuz 2026",
  riskLevel: "medium",
  salaryBand: "medium",
  mandatoryExpenseShare: 0.4,
  minimumPaymentShare: 0.15,
  survivalBudgetDirection: "thin",
  dailyLimitBand: "moderate",
  activeDebtCount: 2,
  highInterestDebtCount: 1,
  topDebtRateBand: "high",
  warningCount: 1,
  criticalReasonCount: 0,
  actionTitles: ["Asgari ödemeleri güvenceye al"],
  rateContext: {
    source: "provider",
    providerStatus: "fresh",
    isFallback: false,
  },
};

const baseMemory: CoachMemoryContext = {
  hasAnySnapshot: true,
  hasEnoughHistory: true,
  snapshotCount: 3,
  latestPeriodMonth: "2026-07",
  highRiskMonthCount: 1,
  cashSqueezeCount: 1,
  totalDebtTrend: "decreasing",
  survivalBudgetTrend: "improving",
  planAdherenceScore: 70,
  insightTitles: ["Toplam borç azalıyor"],
};

const baseTrends: CoachTrendContext = {
  hasEnoughHistory: true,
  reason: "none",
  windowMonths: 3,
  availableMonths: 3,
  incomeTrend: "flat",
  mandatoryExpenseTrend: "flat",
  totalDebtTrend: "decreasing",
  activeDebtTrend: "decreasing",
  survivalBudgetTrend: "improving",
  minimumPaymentBurdenTrend: "flat",
  minimumPaymentBurden: "medium",
  riskTrend: "flat",
  debtPayoffVelocity: "medium",
  cashSqueezeRecurrence: "occasional",
  highRiskMonthCount: 1,
  labels: ["Borç yükü azalıyor"],
};

function recommendations(
  summary: Partial<CoachInputSummary> = {},
  memory: Partial<CoachMemoryContext> = {},
  trends: Partial<CoachTrendContext> = {},
) {
  return analyzeCoachRecommendations({
    summary: { ...baseSummary, ...summary },
    memory: { ...baseMemory, ...memory },
    trends: { ...baseTrends, ...trends },
  });
}

describe("coach recommendation analyzer", () => {
  it("prioritizes high-interest debt and sorts recommendations by priority", () => {
    const context = recommendations();

    expect(context.hasRecommendations).toBe(true);
    expect(context.items[0]).toMatchObject({
      id: "prioritize-high-interest-debt",
      title: "En yüksek faizli borca öncelik ver",
      priority: "HIGH",
      category: "DEBT",
    });
    expect(context.items).toHaveLength(5);
  });

  it("recommends not making extra payment when survival budget is negative", () => {
    const context = recommendations({ survivalBudgetDirection: "negative" }, {}, { survivalBudgetTrend: "worsening" });

    expect(context.items[0]).toMatchObject({
      id: "protect-survival-budget",
      title: "Bu ay ekstra ödeme yapma",
      priority: "HIGH",
      category: "CASHFLOW",
    });
    expect(context.items[0]?.reason).toContain("yaşam bütçesi korunmadan");
  });

  it("marks repeated cash squeeze and worsening risk as high-priority coaching signals", () => {
    const context = recommendations(
      { riskLevel: "high", criticalReasonCount: 1 },
      { cashSqueezeCount: 3 },
      { cashSqueezeRecurrence: "repeated", riskTrend: "worsening", highRiskMonthCount: 3 },
    );

    expect(context.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "reduce-cash-squeeze", priority: "HIGH" }),
        expect.objectContaining({ id: "lower-risk-level", priority: "HIGH" }),
      ]),
    );
  });

  it("uses lower confidence when history is insufficient or rate context is fallback", () => {
    const context = recommendations(
      { rateContext: { source: "fallback", providerStatus: "fallback", isFallback: true } },
      { hasEnoughHistory: false, snapshotCount: 1 },
      { hasEnoughHistory: false, reason: "single_snapshot", windowMonths: null, availableMonths: 1 },
    );

    expect(context.items.every((item) => item.confidence <= 0.78)).toBe(true);
  });

  it("does not leak raw financial identifiers in source signals", () => {
    const context = recommendations();
    const serializedSignals = JSON.stringify(context.items.map((item) => item.sourceSignals));

    expect(serializedSignals).not.toContain("Örnek Banka");
    expect(serializedSignals).not.toContain("Örnek Kart");
    expect(serializedSignals).not.toContain("IBAN");
  });

  it("suggests increasing saving capacity when debt pressure is gone and survival budget is stable", () => {
    const context = recommendations({
      riskLevel: "low",
      survivalBudgetDirection: "stable",
      activeDebtCount: 0,
      highInterestDebtCount: 0,
      topDebtRateBand: "none",
      warningCount: 0,
    }, { cashSqueezeCount: 0 }, {
      totalDebtTrend: "flat",
      activeDebtTrend: "flat",
      survivalBudgetTrend: "improving",
      cashSqueezeRecurrence: "none",
      riskTrend: "flat",
    });

    expect(context.items).toEqual(expect.arrayContaining([expect.objectContaining({ id: "increase-saving-capacity", category: "SAVING" })]));
  });
});
