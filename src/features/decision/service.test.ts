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
  });

  it("marks unsafe extra payments when the living budget threshold is not protected", () => {
    const result = simulateDecisionScenario(makeSnapshot(), {
      type: "extra_debt_payment",
      amountKurus: liraToKurus(40_000),
    });

    expect(result.delta.scenarioRiskLevel).toBe("high");
    expect(result.warnings.map((warning) => warning.id)).toContain("threshold-below");
  });
});
