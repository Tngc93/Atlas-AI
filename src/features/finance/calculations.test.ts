import { describe, expect, it } from "vitest";
import { sampleDebts, sampleExpenses, sampleProfile } from "@/lib/sample-data/finance";
import {
  analyzeDueDateRisks,
  buildMonthlyFinancePlan,
  buildSalaryAllocation,
  calculateSurvivalBudget,
  projectDebtPayoff,
  rankDebtsByAvalanche,
} from "./calculations";

describe("finance calculation engine", () => {
  const julyFourth = new Date(2026, 6, 4);

  it("calculates remaining survival budget after mandatory expenses and minimum debt payments", () => {
    const allocation = buildSalaryAllocation(sampleProfile, sampleDebts, sampleExpenses, julyFourth);

    expect(allocation.survivalBudgetKurus).toBeGreaterThan(0);
    expect(allocation.minimumDebtPaymentsKurus).toBeGreaterThan(0);
  });

  it("flags critical risk when required obligations exceed salary", () => {
    const allocation = buildSalaryAllocation(
      { ...sampleProfile, monthlySalaryKurus: 10_000_00 },
      sampleDebts,
      sampleExpenses,
      julyFourth,
    );

    expect(allocation.riskLevel).toBe("critical");
  });

  it("prioritizes the highest monthly interest debt first", () => {
    const [first] = rankDebtsByAvalanche(sampleDebts, analyzeDueDateRisks(sampleDebts, julyFourth));

    expect(first.id).toBe("card-market");
  });

  it("projects at least one month of payoff activity", () => {
    const months = projectDebtPayoff(sampleProfile, sampleDebts, sampleExpenses, 3, julyFourth);

    expect(months).toHaveLength(3);
    expect(months[0].debtProjections.length).toBeGreaterThan(0);
  });

  it("supports direct survival budget calculation", () => {
    expect(calculateSurvivalBudget(100_000_00, 60_000_00, 25_000_00)).toBe(15_000_00);
  });

  it("builds a monthly plan with daily and weekly living limits based on days left in the month", () => {
    const plan = buildMonthlyFinancePlan(sampleProfile, sampleDebts, sampleExpenses, {
      asOfDate: julyFourth,
      horizonMonths: 3,
    });

    expect(plan.livingBudget.daysRemainingInMonth).toBe(28);
    expect(plan.livingBudget.remainingForMonthKurus).toBe(sampleProfile.survivalThresholdKurus);
    expect(plan.livingBudget.dailyLimitKurus).toBe(Math.floor(sampleProfile.survivalThresholdKurus / 28));
    expect(plan.livingBudget.weeklyLimitKurus).toBe(plan.livingBudget.dailyLimitKurus * 7);
  });

  it("marks debts due within seven days as risky without turning them into critical UI risk", () => {
    const plan = buildMonthlyFinancePlan(sampleProfile, sampleDebts, sampleExpenses, {
      asOfDate: julyFourth,
      horizonMonths: 3,
    });
    const phoneInstallment = plan.dueDateRisks.find((risk) => risk.debtAccountId === "installment-phone");

    expect(phoneInstallment?.status).toBe("due_soon");
    expect(phoneInstallment?.riskLevel).toBe("medium");
    expect(plan.riskLevel).toBe("medium");
  });

  it("allocates extra payment to the highest-interest debt with avalanche strategy", () => {
    const plan = buildMonthlyFinancePlan(sampleProfile, sampleDebts, sampleExpenses, {
      asOfDate: julyFourth,
      horizonMonths: 3,
    });
    const marketCardPayment = plan.paymentAllocations.find((payment) => payment.debtAccountId === "card-market");
    const travelCardPayment = plan.paymentAllocations.find((payment) => payment.debtAccountId === "card-travel");

    expect(marketCardPayment?.extraPaymentKurus).toBe(5_800_00);
    expect(travelCardPayment?.extraPaymentKurus).toBe(0);
    expect(plan.debtPriorities[0].id).toBe("card-market");
  });

  it("does not make extra debt payments when the living budget threshold cannot be protected", () => {
    const plan = buildMonthlyFinancePlan(
      { ...sampleProfile, monthlySalaryKurus: 70_000_00 },
      sampleDebts,
      sampleExpenses,
      { asOfDate: julyFourth, horizonMonths: 3 },
    );

    expect(plan.cashFlow.extraDebtPaymentKurus).toBe(0);
    expect(plan.paymentAllocations.every((payment) => payment.extraPaymentKurus === 0)).toBe(true);
    expect(plan.warnings).toContain("Hayatta kalma bütçesi hedef eşiğin altında.");
  });

  it("reports high risk and critical reasons when minimum payments cannot be secured", () => {
    const plan = buildMonthlyFinancePlan(
      { ...sampleProfile, monthlySalaryKurus: 55_000_00 },
      sampleDebts,
      sampleExpenses,
      { asOfDate: julyFourth, horizonMonths: 3 },
    );

    expect(plan.riskLevel).toBe("high");
    expect(plan.cashFlow.minimumPaymentsCovered).toBe(false);
    expect(plan.criticalReasons).toContain("Maaş, zorunlu giderler ve asgari borç ödemelerinin tamamına yetmiyor.");
    expect(plan.paymentAllocations.some((payment) => !payment.minimumPaymentCovered)).toBe(true);
  });
});
