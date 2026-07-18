import type { FinancePlanSnapshot } from "@/features/finance/data-service";
import { simulateForecastScenario } from "@/features/forecast/scenario-engine";
import { buildForecastReport } from "@/features/forecast/service";
import { buildReminderItems } from "@/features/reminders/service";
import type { CoachContext, CoachFinancialSnapshot, CoachLanguage } from "./types";

export function buildCoachFinancialSnapshot(snapshot: FinancePlanSnapshot): CoachFinancialSnapshot {
  const activeDebts = snapshot.debts.filter((debt) => debt.status === "active");
  const priorityDebt = snapshot.monthlyPlan.debtPriorities[0];
  const forecast = buildForecastReport(snapshot);
  const incomeDrop20 = simulateForecastScenario(snapshot, { type: "salary_decrease", percent: 20 });
  const expenseReduction10 = simulateForecastScenario(snapshot, { type: "expense_decrease", percent: 10 });
  const reminders = buildReminderItems(snapshot);

  return {
    monthlyIncomeKurus: snapshot.monthlyPlan.cashFlow.salaryKurus,
    monthlyExpensesKurus: snapshot.monthlyPlan.cashFlow.mandatoryExpenseTotalKurus,
    minimumDebtPaymentsKurus: snapshot.monthlyPlan.cashFlow.minimumDebtPaymentsKurus,
    totalDebtKurus: activeDebts.reduce((total, debt) => total + debt.balanceKurus, 0),
    availableMonthlyBalanceKurus: snapshot.monthlyPlan.livingBudget.remainingForMonthKurus,
    protectedBufferKurus: snapshot.monthlyPlan.livingBudget.protectedBufferKurus,
    extraDebtPaymentCapacityKurus: snapshot.monthlyPlan.cashFlow.extraDebtPaymentKurus,
    riskLevel: snapshot.monthlyPlan.riskLevel,
    minimumPaymentsCovered: snapshot.monthlyPlan.cashFlow.minimumPaymentsCovered,
    activeDebtCount: activeDebts.length,
    priorityDebt: priorityDebt
      ? {
          balanceKurus: priorityDebt.balanceKurus,
          minimumPaymentKurus: priorityDebt.minimumPaymentKurus,
          interestRateMonthly: priorityDebt.interestRateMonthly,
        }
      : null,
    forecast: {
      horizonMonths: 24,
      remainingDebtKurus: forecast.finalRemainingDebtKurus,
      estimatedPayoffMonth: forecast.estimatedPayoffMonth,
      highestRiskLevel: forecast.highestRiskLevel,
    },
    incomeDrop20: {
      averageLivingBudgetDeltaKurus: incomeDrop20.delta.averageLivingBudgetDeltaKurus,
      riskLevel: incomeDrop20.delta.scenarioRiskLevel,
    },
    expenseReduction10: {
      averageLivingBudgetDeltaKurus: expenseReduction10.delta.averageLivingBudgetDeltaKurus,
      riskLevel: expenseReduction10.delta.scenarioRiskLevel,
    },
    reminders: {
      total: reminders.length,
      highPriorityCount: reminders.filter((reminder) => reminder.severity === "high").length,
      kinds: [...new Set(reminders.map((reminder) => reminder.kind))].slice(0, 5),
    },
  };
}

export function withCoachChatRequest(
  context: CoachContext,
  question: string,
  language: CoachLanguage,
  financialSnapshot: CoachFinancialSnapshot,
): CoachContext {
  return {
    ...context,
    chatRequest: {
      question: question.trim().slice(0, 500),
      language,
      financialSnapshot,
    },
  };
}
