import { describe, expect, it } from "vitest";
import { createDemoSeed, DEMO_MONTHLY_SALARY_KURUS } from "@/features/demo/seed";
import { buildMonthlyFinancePlan } from "@/features/finance/calculations";
import { buildCoachFinancialSnapshot } from "./chat-context";

describe("buildCoachFinancialSnapshot", () => {
  it("uses deterministic demo outputs and excludes record identity fields", () => {
    const seed = createDemoSeed();
    const snapshot = {
      hasProfile: true,
      profile: seed.profile,
      debts: seed.debts,
      expenses: seed.expenses,
      monthlyPlan: buildMonthlyFinancePlan(seed.profile, seed.debts, seed.expenses, { horizonMonths: 24 }),
    };

    const result = buildCoachFinancialSnapshot(snapshot);
    const serialized = JSON.stringify(result);

    expect(result.monthlyIncomeKurus).toBe(DEMO_MONTHLY_SALARY_KURUS);
    expect(result.totalDebtKurus).toBe(seed.debts.reduce((total, debt) => total + debt.balanceKurus, 0));
    expect(result.monthlyExpensesKurus).toBe(seed.expenses.reduce((total, expense) => total + expense.amountKurus, 0));
    expect(result.forecast.horizonMonths).toBe(24);
    expect(result.priorityDebt?.interestRateMonthly).toBe(4.25);
    expect(serialized).not.toContain("Fictional Grocery Card");
    expect(serialized).not.toContain("Example Bank");
    expect(serialized).not.toContain("demo-card-grocery");
    expect(serialized).not.toContain('"name"');
    expect(serialized).not.toContain('"lender"');
  });
});
