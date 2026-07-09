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

function makeLongDebtSnapshot(): FinanceSnapshot {
  return {
    hasProfile: true,
    profile: {
      id: "scenario-test-profile",
      currency: "TRY",
      monthlySalaryKurus: liraToKurus(47_000),
      survivalThresholdKurus: liraToKurus(12_000),
    },
    debts: [
      {
        id: "scenario-test-debt",
        type: "credit_card",
        name: "Örnek Uzun Vadeli Borç",
        lender: "Örnek Kurum",
        balanceKurus: liraToKurus(500_000),
        interestRateMonthly: 2,
        minimumPaymentKurus: liraToKurus(5_000),
        dueDay: 15,
        status: "active",
      },
    ],
    expenses: [
      {
        id: "scenario-test-expense",
        name: "Örnek Gider",
        category: "Yaşam",
        amountKurus: liraToKurus(30_000),
        isFixed: true,
      },
    ],
  };
}

describe("forecast scenario engine", () => {
  it("simulates salary increase and improves the debt forecast without mutating the source snapshot", () => {
    const snapshot = makeSnapshot();
    const originalSalary = snapshot.profile.monthlySalaryKurus;
    const result = simulateForecastScenario(snapshot, { type: "salary_increase", amountKurus: liraToKurus(10_000) }, asOfDate);

    expect(result.delta.finalRemainingDebtDeltaKurus).toBeLessThanOrEqual(0);
    expect(result.delta.totalInterestDeltaKurus).toBeLessThanOrEqual(0);
    expect(result.comparison.improvements.length).toBeGreaterThan(0);
    expect(snapshot.profile.monthlySalaryKurus).toBe(originalSalary);
  });

  it("simulates salary decrease and increases risk pressure", () => {
    const result = simulateForecastScenario(makeSnapshot(), { type: "salary_decrease", amountKurus: liraToKurus(50_000) }, asOfDate);

    expect(result.delta.averageLivingBudgetDeltaKurus).toBeLessThan(0);
    expect(result.comparison.worsenings.map((item) => item.id)).toContain("living-budget-tighter");
    expect(result.comparison.riskImpact).toContain("yükselebilir");
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
    expect(result.comparison.tradeOffs.length).toBeGreaterThan(0);
    expect(result.explanation.why).toContain("mevcut veriyi değiştirmez");
  });

  it("classifies lower remaining debt with tighter living budget as a trade-off", () => {
    const result = simulateForecastScenario(makeLongDebtSnapshot(), { type: "extra_debt_payment", amountKurus: liraToKurus(10_000) }, asOfDate);

    expect(result.delta.finalRemainingDebtDeltaKurus).toBeLessThan(0);
    expect(result.delta.averageLivingBudgetDeltaKurus).toBeLessThan(0);
    expect(result.comparison.improvements.map((item) => item.id)).toContain("remaining-debt-lower");
    expect(result.comparison.worsenings.map((item) => item.id)).toContain("living-budget-tighter");
    expect(result.comparison.tradeOffs.map((item) => item.id)).toContain("debt-down-budget-tight");
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
    expect(result.comparison.tradeOffs.map((item) => item.id)).toContain("temporary-new-debt");
    expect(result.warnings.map((warning) => warning.id)).toContain("new-debt-missing-rate");
  });

  it("keeps uncertain payoff differences conditional instead of exact", () => {
    const result = simulateForecastScenario(makeSnapshot(), { type: "new_debt", amountKurus: liraToKurus(25_000), minimumPaymentKurus: liraToKurus(2_000) }, asOfDate);

    if (result.delta.payoffMonthDelta === null) {
      expect(result.comparison.tradeOffs.map((item) => item.id)).toContain("payoff-outside-horizon");
      expect(result.comparison.tradeOffs.map((item) => item.description).join(" ")).toContain("kesin tarih gibi okunmamalıdır");
    }
  });

  it("keeps scenario explanation free from raw lender and card names", () => {
    const result = simulateForecastScenario(makeSnapshot(), { type: "expense_decrease", percent: 5 }, asOfDate);
    const comparisonText = [
      result.comparison.summary,
      result.comparison.riskImpact,
      result.comparison.paymentCapacityImpact,
      ...result.comparison.improvements.map((item) => `${item.title} ${item.description}`),
      ...result.comparison.worsenings.map((item) => `${item.title} ${item.description}`),
      ...result.comparison.tradeOffs.map((item) => `${item.title} ${item.description}`),
    ].join(" ");
    const publicText = `${result.explanation.summary} ${result.explanation.why} ${comparisonText} ${result.warnings
      .map((warning) => warning.message)
      .join(" ")}`;

    expect(publicText).not.toContain("Banka");
    expect(publicText).not.toContain("Kart");
    expect(publicText).not.toContain("IBAN");
    expect(publicText).not.toContain("forecast-temporary-scenario-debt");
    expect(publicText).not.toContain("provider");
    expect(publicText).not.toContain("cache");
  });
});
