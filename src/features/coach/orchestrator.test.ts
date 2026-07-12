import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildCoachInputSummary, generateCoachInsight, selectAIProvider } from "./orchestrator";
import type { MonthlyFinancePlan } from "@/features/finance/types";
import { sampleInterestRateSnapshot } from "@/features/rates/tcmb-provider";

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

describe("AI coach orchestrator", () => {
  it("defaults to mock provider", () => {
    vi.stubEnv("AI_PROVIDER", undefined);

    expect(selectAIProvider().name).toBe("mock");
  });

  it("selects the self-host OpenAI adapter without calling it", () => {
    vi.stubEnv("AI_PROVIDER", "openai");

    const provider = selectAIProvider();

    expect(provider.name).toBe("openai");
    expect(provider.mode).toBe("live");
    expect(provider.descriptor.browserSupport).toBe("self-host-only");
  });

  it("builds a minimized summary without raw debt names or lender names", () => {
    const summary = buildCoachInputSummary(makePlan(), sampleInterestRateSnapshot);
    const serialized = JSON.stringify(summary);

    expect(summary.activeDebtCount).toBe(1);
    expect(serialized).not.toContain("Örnek Kart");
    expect(serialized).not.toContain("Örnek Banka");
  });

  it("generates Turkish mock insight with zero estimated cost", async () => {
    vi.stubEnv("AI_PROVIDER", "mock");
    const insight = await generateCoachInsight(buildCoachInputSummary(makePlan(), sampleInterestRateSnapshot));

    expect(insight.provider).toBe("mock");
    expect(insight.summary).toContain("finansal veri üçüncü partiye gönderilmez");
    expect(insight.usage.estimatedCostKurus).toBe(0);
    expect(insight.sections.financialStatus.title).toBe("Finansal Durum");
    expect(insight.sections.risks.length).toBeGreaterThan(0);
    expect(insight.sections.monthlyActions[0]?.why).toContain("Çünkü");
    expect(insight.sections.priorities[0]?.why).toContain("finans motor");
    expect(insight.sections.decisionSimulatorPreview).toHaveLength(3);
    expect(insight.sections.coachComment.title).toBe("Koç yorumu");
  });
});
