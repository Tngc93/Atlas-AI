import { describe, expect, it, vi } from "vitest";
import { createDemoSeed } from "./seed";
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
