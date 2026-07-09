import { describe, expect, it } from "vitest";
import type { FinanceSnapshot } from "@/features/finance/data-service";
import { liraToKurus } from "@/features/finance/money";
import { sampleDebts, sampleExpenses, sampleProfile } from "@/lib/sample-data/finance";
import { simulateForecastScenario } from "./scenario-engine";

const asOfDate = new Date(2026, 6, 4);

function makeSnapshot(): FinanceSnapshot {
  return {
    hasProfile: true,
    profile: { ...sampleProfile },
    debts: sampleDebts.map((debt) => ({ ...debt })),
    expenses: sampleExpenses.map((expense) => ({ ...expense })),
  };
}

describe("forecast scenario engine", () => {
  it("simulates salary increase and improves the debt forecast without mutating the source snapshot", () => {
    const snapshot = makeSnapshot();
    const originalSalary = snapshot.profile.monthlySalaryKurus;
    const result = simulateForecastScenario(snapshot, { type: "salary_increase", amountKurus: liraToKurus(10_000) }, asOfDate);

    expect(result.delta.finalRemainingDebtDeltaKurus).toBeLessThanOrEqual(0);
    expect(result.delta.totalInterestDeltaKurus).toBeLessThanOrEqual(0);
    expect(snapshot.profile.monthlySalaryKurus).toBe(originalSalary);
  });

  it("simulates salary decrease and increases risk pressure", () => {
    const result = simulateForecastScenario(makeSnapshot(), { type: "salary_decrease", amountKurus: liraToKurus(50_000) }, asOfDate);

    expect(result.delta.averageLivingBudgetDeltaKurus).toBeLessThan(0);
    expect(result.warnings.map((warning) => warning.id)).toContain("high-risk-scenario");
  });

  it("simulates expense decrease and expense increase in opposite directions", () => {
    const decrease = simulateForecastScenario(makeSnapshot(), { type: "expense_decrease", percent: 10 }, asOfDate);
    const increase = simulateForecastScenario(makeSnapshot(), { type: "expense_increase", percent: 10 }, asOfDate);

    expect(decrease.delta.averageLivingBudgetDeltaKurus).toBeGreaterThan(0);
    expect(increase.delta.averageLivingBudgetDeltaKurus).toBeLessThan(0);
  });

  it("simulates extra debt payment through the forecast engine override", () => {
    const result = simulateForecastScenario(makeSnapshot(), { type: "extra_debt_payment", amountKurus: liraToKurus(8_000) }, asOfDate);

    expect(result.delta.finalRemainingDebtDeltaKurus).toBeLessThanOrEqual(0);
    expect(result.explanation.why).toContain("mevcut veriyi değiştirmez");
  });

  it("adds temporary new debt only to the scenario forecast", () => {
    const snapshot = makeSnapshot();
    const originalDebtCount = snapshot.debts.length;
    const result = simulateForecastScenario(
      snapshot,
      {
        type: "new_debt",
        amountKurus: liraToKurus(25_000),
        minimumPaymentKurus: liraToKurus(2_000),
      },
      asOfDate,
    );

    expect(snapshot.debts.length).toBe(originalDebtCount);
    expect(result.delta.totalInterestDeltaKurus).toBeGreaterThanOrEqual(0);
    expect(result.delta.averageLivingBudgetDeltaKurus).toBeLessThanOrEqual(0);
    expect(result.warnings.map((warning) => warning.id)).toContain("new-debt-missing-rate");
  });

  it("keeps scenario explanation free from raw lender and card names", () => {
    const result = simulateForecastScenario(makeSnapshot(), { type: "expense_decrease", percent: 5 }, asOfDate);
    const publicText = `${result.explanation.summary} ${result.explanation.why} ${result.warnings
      .map((warning) => warning.message)
      .join(" ")}`;

    expect(publicText).not.toContain("Banka");
    expect(publicText).not.toContain("Kart");
    expect(publicText).not.toContain("IBAN");
  });
});
