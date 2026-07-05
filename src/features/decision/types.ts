import type { DebtAccount, MonthlyFinancePlan, UiRiskLevel } from "@/features/finance/types";

export type DecisionScenarioType =
  | "extra_debt_payment"
  | "salary_increase"
  | "one_time_bonus"
  | "reduce_expenses_percent"
  | "specific_debt_payment"
  | "no_extra_payment";

export type DecisionScenarioInput = {
  type: DecisionScenarioType;
  amountKurus?: number;
  percent?: number;
  debtAccountId?: string;
};

export type DecisionScenarioWarning = {
  id: string;
  message: string;
  severity: UiRiskLevel;
};

export type DecisionCoachComment = {
  summary: string;
  why: string;
};

export type DecisionScenarioDelta = {
  firstMonthRemainingDebtDeltaKurus: number;
  horizonRemainingDebtDeltaKurus: number;
  livingBudgetDeltaKurus: number;
  dailyLimitDeltaKurus: number;
  weeklyLimitDeltaKurus: number;
  payoffMonthDelta: number | null;
  baselinePayoffMonth: string | null;
  scenarioPayoffMonth: string | null;
  baselineRiskLevel: UiRiskLevel;
  scenarioRiskLevel: UiRiskLevel;
  priorityChanged: boolean;
  baselineTopDebtName: string | null;
  scenarioTopDebtName: string | null;
};

export type DecisionScenarioResult = {
  input: DecisionScenarioInput;
  title: string;
  baselinePlan: MonthlyFinancePlan;
  scenarioPlan: MonthlyFinancePlan;
  activeDebts: Pick<DebtAccount, "id" | "name" | "status">[];
  delta: DecisionScenarioDelta;
  warnings: DecisionScenarioWarning[];
  coachComment: DecisionCoachComment;
};
