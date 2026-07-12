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
});
