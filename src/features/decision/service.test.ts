import { describe, expect, it } from "vitest";
import type { FinanceSnapshot } from "@/features/finance/data-service";
import { liraToKurus } from "@/features/finance/money";
import { sampleDebts, sampleExpenses, sampleProfile } from "@/lib/sample-data/finance";
import { simulateDecisionScenario } from "./service";

function makeSnapshot(): FinanceSnapshot {
  return {
    hasProfile: true,
    profile: sampleProfile,
    debts: sampleDebts.map((debt) => ({ ...debt })),
    expenses: sampleExpenses.map((expense) => ({ ...expense })),
  };
}

describe("decision intelligence engine", () => {
  it("simulates an avalanche extra debt payment without mutating the source snapshot", () => {
    const snapshot = makeSnapshot();
    const originalBalance = snapshot.debts[0].balanceKurus;
    const result = simulateDecisionScenario(snapshot, {
      type: "extra_debt_payment",
      amountKurus: liraToKurus(10_000),
    });

    expect(result.delta.firstMonthRemainingDebtDeltaKurus).toBeLessThan(0);
    expect(result.scenarioPlan.paymentAllocations[0].extraPaymentKurus).toBeGreaterThan(0);
    expect(result.frame.sequence.map((item) => item.label)).toEqual(["Gerçeklik", "Kısıt", "Seçenek", "Risk", "Kullanıcı kararı"]);
    expect(result.tradeoffSummary.improvements.length).toBeGreaterThan(0);
    expect(result.horizonLens.currentMonthImpact).toContain("Bu ay");
    expect(snapshot.debts[0].balanceKurus).toBe(originalBalance);
  });

  it("applies a specific debt payment to the selected active debt first", () => {
    const result = simulateDecisionScenario(makeSnapshot(), {
      type: "specific_debt_payment",
      amountKurus: liraToKurus(7_000),
      debtAccountId: "card-travel",
    });
    const selectedDebtPayment = result.scenarioPlan.paymentAllocations.find(
      (payment) => payment.debtAccountId === "card-travel",
    );

    expect(selectedDebtPayment?.extraPaymentKurus).toBe(liraToKurus(7_000));
  });

  it("treats salary increase as recurring income and bonus as first-month income only", () => {
    const salaryIncrease = simulateDecisionScenario(makeSnapshot(), {
      type: "salary_increase",
      amountKurus: liraToKurus(5_000),
    });
    const bonus = simulateDecisionScenario(makeSnapshot(), {
      type: "one_time_bonus",
      amountKurus: liraToKurus(5_000),
    });

    expect(salaryIncrease.scenarioPlan.payoffForecast[1]?.salaryKurus).toBe(sampleProfile.monthlySalaryKurus + liraToKurus(5_000));
    expect(bonus.scenarioPlan.payoffForecast[0]?.salaryKurus).toBe(sampleProfile.monthlySalaryKurus + liraToKurus(5_000));
    expect(bonus.scenarioPlan.payoffForecast[1]?.salaryKurus).toBe(sampleProfile.monthlySalaryKurus);
  });

  it("reduces mandatory expenses by percent", () => {
    const result = simulateDecisionScenario(makeSnapshot(), {
      type: "reduce_expenses_percent",
      percent: 10,
    });

    expect(result.scenarioPlan.cashFlow.mandatoryExpenseTotalKurus).toBeLessThan(
      result.baselinePlan.cashFlow.mandatoryExpenseTotalKurus,
    );
    expect(result.delta.firstMonthRemainingDebtDeltaKurus).toBeLessThan(0);
  });

  it("can simulate no extra payment for the current month", () => {
    const result = simulateDecisionScenario(makeSnapshot(), {
      type: "no_extra_payment",
    });

    expect(result.scenarioPlan.cashFlow.extraDebtPaymentKurus).toBe(0);
    expect(result.delta.firstMonthRemainingDebtDeltaKurus).toBeGreaterThan(0);
    expect(result.tradeoffSummary.tradeOffs.map((item) => item.id)).toContain("budget-wide-debt-up");
  });

  it("marks unsafe extra payments when the living budget threshold is not protected", () => {
    const result = simulateDecisionScenario(makeSnapshot(), {
      type: "extra_debt_payment",
      amountKurus: liraToKurus(40_000),
    });

    expect(result.delta.scenarioRiskLevel).toBe("high");
    expect(result.warnings.map((warning) => warning.id)).toContain("threshold-below");
    expect(result.frame.deferral).toContain("Erteleme geçerli");
    expect(result.tradeoffSummary.decisionNote).toContain("son karar sizindir");
    expect(result.explanationContext.hasWarnings).toBe(true);
    expect(result.explanationContext.userDecisionBoundary).toContain("karar vermez");
  });

  it("keeps decision intelligence summaries free from raw technical and sensitive details", () => {
    const result = simulateDecisionScenario(makeSnapshot(), {
      type: "extra_debt_payment",
      amountKurus: liraToKurus(10_000),
    });
    const publicText = [
      ...result.frame.sequence.map((item) => `${item.label} ${item.value}`),
      result.tradeoffSummary.summary,
      result.tradeoffSummary.riskImpact,
      result.tradeoffSummary.livingBudgetImpact,
      result.horizonLens.currentMonthImpact,
      result.horizonLens.horizonImpact,
      result.horizonLens.payoffImpact,
      result.horizonLens.spendingLimitImpact,
      ...result.tradeoffSummary.improvements.map((item) => `${item.title} ${item.description}`),
      ...result.tradeoffSummary.worsenings.map((item) => `${item.title} ${item.description}`),
      ...result.tradeoffSummary.tradeOffs.map((item) => `${item.title} ${item.description}`),
    ].join(" ");

    expect(publicText).not.toContain("Örnek Banka");
    expect(publicText).not.toContain("card-market");
    expect(publicText).not.toContain("provider");
    expect(publicText).not.toContain("cache");
    expect(publicText).not.toContain("hash");
    expect(publicText).not.toContain("token");
  });
});
