import { describe, expect, it, vi } from "vitest";
import { buildMonthlyFinancePlan } from "@/features/finance/calculations";
import { liraToKurus } from "@/features/finance/money";
import { createDemoSeed, DEMO_MONTHLY_SALARY_KURUS } from "./seed";
import { demoFinanceReducer } from "./store";

describe("demo finance store", () => {
  it("keeps store instances isolated and does not mutate the seed", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "demo-id" });
    const first = createDemoSeed();
    const second = createDemoSeed();
    const changed = demoFinanceReducer(first, { type: "delete_debt", id: first.debts[0].id });

    expect(changed.debts).toHaveLength(first.debts.length - 1);
    expect(second.debts).toHaveLength(first.debts.length);
    expect(createDemoSeed().debts).toHaveLength(first.debts.length);
    vi.unstubAllGlobals();
  });

  it("restores fictional seed data on reset", () => {
    const seed = createDemoSeed();
    const changed = demoFinanceReducer(seed, { type: "delete_expense", id: seed.expenses[0].id });
    const reset = demoFinanceReducer(changed, { type: "reset" });
    expect(reset.expenses).toHaveLength(seed.expenses.length);
    expect(reset.revision).toBe(0);
  });

  it("propagates the 150,000 TRY seed salary through deterministic plan outputs", () => {
    const seed = createDemoSeed();
    const plan = buildMonthlyFinancePlan(seed.profile, seed.debts, seed.expenses, {
      asOfDate: new Date("2026-07-15T12:00:00.000Z"),
      horizonMonths: 24,
    });

    expect(seed.profile.monthlySalaryKurus).toBe(DEMO_MONTHLY_SALARY_KURUS);
    expect(seed.salaryRecords[0].amountKurus).toBe(DEMO_MONTHLY_SALARY_KURUS);
    expect(plan.cashFlow.salaryKurus).toBe(liraToKurus(150_000));
    expect(plan.cashFlow.mandatoryExpenseTotalKurus).toBe(liraToKurus(50_000));
    expect(plan.cashFlow.minimumDebtPaymentsKurus).toBe(liraToKurus(17_200));
    expect(plan.cashFlow.totalRequiredKurus).toBe(liraToKurus(67_200));
    expect(plan.cashFlow.survivalBudgetKurus).toBe(liraToKurus(82_800));
    expect(plan.cashFlow.extraDebtPaymentKurus).toBe(liraToKurus(70_800));
    expect(plan.livingBudget.remainingForMonthKurus).toBe(liraToKurus(12_000));
    expect(plan.cashFlow.minimumPaymentsCovered).toBe(true);
  });

  it("clears every temporary domain change when reset", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "temporary-id" });
    const seed = createDemoSeed();
    const now = new Date("2026-07-15T10:00:00.000Z");
    let changed = demoFinanceReducer(seed, { type: "set_salary", amountKurus: seed.profile.monthlySalaryKurus + 100_000 });
    changed = demoFinanceReducer(changed, { type: "delete_debt", id: seed.debts[0].id });
    changed = demoFinanceReducer(changed, { type: "delete_expense", id: seed.expenses[0].id });
    changed = demoFinanceReducer(changed, {
      type: "set_reminder_state",
      state: { id: "temporary-reminder", reminderKey: "temporary", status: "dismissed", dismissedAt: now, createdAt: now, updatedAt: now },
    });
    changed = demoFinanceReducer(changed, {
      type: "refresh_memory",
      snapshot: { ...seed.memorySnapshots[0], id: "temporary-memory", periodMonth: "2099-01" },
    });

    expect(changed.revision).toBe(5);
    expect(changed.reminderStates).toHaveLength(1);
    expect(changed.memorySnapshots.some((snapshot) => snapshot.periodMonth === "2099-01")).toBe(true);

    const reset = demoFinanceReducer(changed, { type: "reset" });
    const fresh = createDemoSeed();
    expect(reset.profile).toEqual(fresh.profile);
    expect(reset.salaryRecords).toHaveLength(fresh.salaryRecords.length);
    expect(reset.debts).toEqual(fresh.debts);
    expect(reset.expenses).toEqual(fresh.expenses);
    expect(reset.reminderStates).toEqual([]);
    expect(reset.memorySnapshots.map((snapshot) => snapshot.periodMonth)).toEqual(fresh.memorySnapshots.map((snapshot) => snapshot.periodMonth));
    expect(reset.revision).toBe(0);
    expect(reset).not.toBe(seed);
    vi.unstubAllGlobals();
  });
});
