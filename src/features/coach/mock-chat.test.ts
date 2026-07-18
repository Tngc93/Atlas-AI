import { describe, expect, it } from "vitest";
import type { CoachFinancialSnapshot } from "./types";
import { buildMockCoachChatResponse, categorizeCoachQuestion } from "./mock-chat";

const snapshot: CoachFinancialSnapshot = {
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
  reminders: { total: 2, highPriorityCount: 1, kinds: ["debt_due", "salary_day"] },
};

describe("mock coach chat", () => {
  it.each([
    ["Which debt should I pay first?", "debt"],
    ["Can I save ₺20,000 per month?", "saving"],
    ["What happens if my income drops by 20%?", "income_drop"],
    ["How can I reduce my monthly expenses?", "expenses"],
    ["Explain my financial health.", "health"],
    ["Can I afford a major purchase?", "purchase"],
  ] as const)("categorizes %s", (question, category) => {
    expect(categorizeCoachQuestion(question)).toBe(category);
  });

  it("produces a contextual English demo response without a live provider claim", () => {
    const result = buildMockCoachChatResponse("Can I save ₺20,000 per month?", snapshot, "en");
    expect(result.summary).toContain("₺20,000");
    expect(result.summary).toContain("₺82,800");
    expect(result.providerLabel).toBe("Mock AI · Demo Mode");
    expect(result.simulated).toBe(true);
  });

  it("switches the response and labels to Turkish", () => {
    const result = buildMockCoachChatResponse("Önce hangi borcu ödemeliyim?", snapshot, "tr");
    expect(result.summary).toContain("Avalanche sırası");
    expect(result.keyNumbers.map((item) => item.label)).toContain("Aylık gelir");
    expect(result.providerLabel).toBe("Mock AI · Demo Modu");
  });
});
