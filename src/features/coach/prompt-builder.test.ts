import { describe, expect, it } from "vitest";
import { buildGeminiUserPrompt } from "./prompt-builder";
import type { CoachContext } from "./types";

const context: CoachContext = {
  version: "coach-context-v1",
  builtAtIso: "2026-07-05T00:00:00.000Z",
  summary: {
    month: "Temmuz 2026",
    riskLevel: "medium",
    salaryBand: "medium",
    mandatoryExpenseShare: 0.4,
    minimumPaymentShare: 0.1,
    survivalBudgetDirection: "thin",
    dailyLimitBand: "moderate",
    activeDebtCount: 2,
    highInterestDebtCount: 1,
    topDebtRateBand: "high",
    warningCount: 1,
    criticalReasonCount: 0,
    actionTitles: ["Asgari ödemeleri güvenceye al"],
    rateContext: {
      source: "fallback",
      providerStatus: "fallback",
      isFallback: true,
    },
  },
  memory: {
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
  },
  trends: {
    hasEnoughHistory: true,
    reason: "none",
    windowMonths: 3,
    availableMonths: 3,
    incomeTrend: "flat",
    mandatoryExpenseTrend: "decreasing",
    totalDebtTrend: "decreasing",
    activeDebtTrend: "decreasing",
    survivalBudgetTrend: "improving",
    minimumPaymentBurdenTrend: "decreasing",
    minimumPaymentBurden: "low",
    riskTrend: "improving",
    debtPayoffVelocity: "medium",
    cashSqueezeRecurrence: "occasional",
    highRiskMonthCount: 1,
    labels: ["Borç yükü azalıyor"],
  },
};

describe("Gemini prompt builder", () => {
  it("includes minimized trend context without raw financial records", () => {
    const prompt = buildGeminiUserPrompt(context);

    expect(prompt).toContain("Trendler deterministik Financial Memory analizinden gelir");
    expect(prompt).toContain("Trend bağlamı");
    expect(prompt).toContain("\"totalDebtTrend\":\"decreasing\"");
    expect(prompt).toContain("\"labels\":[\"Borç yükü azalıyor\"]");
    expect(prompt).not.toContain("capturedAt");
    expect(prompt).not.toContain("categoryTotals");
    expect(prompt).not.toContain("Örnek Banka");
    expect(prompt).not.toContain("Örnek Kart");
    expect(prompt).not.toContain("kart numarası\":\"");
  });
});
