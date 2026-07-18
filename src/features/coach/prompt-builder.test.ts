import { describe, expect, it } from "vitest";
import { buildGeminiSystemPrompt, buildGeminiUserPrompt } from "./prompt-builder";
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
  recommendations: {
    hasRecommendations: true,
    items: [
      {
        id: "prioritize-high-interest-debt",
        title: "En yüksek faizli borca öncelik ver",
        priority: "HIGH",
        category: "DEBT",
        reason: "Yüksek faiz baskısı var.",
        expectedImpact: "Faiz baskısı daha hızlı azalabilir.",
        confidence: 0.78,
        sourceSignals: ["high_interest_debt", "avalanche_strategy"],
      },
    ],
  },
};

describe("Gemini prompt builder", () => {
  it("includes minimized trend and recommendation context without raw financial records", () => {
    const prompt = buildGeminiUserPrompt(context);

    expect(prompt).toContain("Trendler deterministik Financial Memory analizinden gelir");
    expect(prompt).toContain("Öneriler deterministic recommendation analyzer tarafından üretildi");
    expect(prompt).toContain("Trend bağlamı");
    expect(prompt).toContain("Öneri bağlamı");
    expect(prompt).toContain("\"totalDebtTrend\":\"decreasing\"");
    expect(prompt).toContain("\"id\":\"prioritize-high-interest-debt\"");
    expect(prompt).toContain("\"labels\":[\"Borç yükü azalıyor\"]");
    expect(prompt).not.toContain("capturedAt");
    expect(prompt).not.toContain("categoryTotals");
    expect(prompt).not.toContain("Örnek Banka");
    expect(prompt).not.toContain("Örnek Kart");
    expect(prompt).not.toContain("kart numarası\":\"");
  });

  it("grounds a chat question in the minimized deterministic snapshot and selected language", () => {
    const prompt = buildGeminiUserPrompt({
      ...context,
      chatRequest: {
        question: "Can I save ₺20,000 per month?",
        language: "en",
        financialSnapshot: {
          monthlyIncomeKurus: 150_000_00,
          monthlyExpensesKurus: 50_000_00,
          minimumDebtPaymentsKurus: 17_200_00,
          totalDebtKurus: 88_500_00,
          availableMonthlyBalanceKurus: 82_800_00,
          protectedBufferKurus: 12_000_00,
          extraDebtPaymentCapacityKurus: 70_800_00,
          riskLevel: "low",
          minimumPaymentsCovered: true,
          activeDebtCount: 3,
          priorityDebt: { balanceKurus: 42_000_00, minimumPaymentKurus: 8_500_00, interestRateMonthly: 4.25 },
          forecast: { horizonMonths: 24, remainingDebtKurus: 0, estimatedPayoffMonth: "2026-09", highestRiskLevel: "low" },
          incomeDrop20: { averageLivingBudgetDeltaKurus: -30_000_00, riskLevel: "medium" },
          expenseReduction10: { averageLivingBudgetDeltaKurus: 5_000_00, riskLevel: "low" },
          reminders: { total: 2, highPriorityCount: 0, kinds: ["salary_day"] },
        },
      },
    });

    expect(buildGeminiSystemPrompt("en")).toContain("responding in natural English");
    expect(buildGeminiSystemPrompt("en")).toContain("Finance Engine is authoritative");
    expect(prompt).toContain("Can I save ₺20,000 per month?");
    expect(prompt).toContain("\"monthlyIncomeKurus\":15000000");
    expect(prompt).not.toContain("lender");
    expect(prompt).not.toContain("debtName");
  });
});
