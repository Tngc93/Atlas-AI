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

export type DecisionFrameItem = {
  label: string;
  value: string;
};

export type DecisionFrame = {
  currentReality: string;
  protectedConstraint: string;
  openOption: string;
  riskToReview: string;
  deferral: string;
  sequence: DecisionFrameItem[];
};

export type DecisionTradeoffItem = {
  id: string;
  title: string;
  description: string;
  tone: "positive" | "negative" | "watch" | "neutral";
};

export type DecisionTradeoffSummary = {
  summary: string;
  improvements: DecisionTradeoffItem[];
  worsenings: DecisionTradeoffItem[];
  tradeOffs: DecisionTradeoffItem[];
  riskImpact: string;
  livingBudgetImpact: string;
  decisionNote: string;
};

export type DecisionHorizonLens = {
  currentMonthImpact: string;
  horizonImpact: string;
  payoffImpact: string;
  spendingLimitImpact: string;
};

export type DecisionExplanationContext = {
  version: "decision-explanation-context-v1";
  scenarioType: DecisionScenarioType;
  riskDirection: "lower" | "higher" | "same";
  livingBudgetDirection: "wider" | "tighter" | "same";
  debtDirection: "lower" | "higher" | "same";
  hasWarnings: boolean;
  tradeoffCount: number;
  userDecisionBoundary: string;
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
  frame: DecisionFrame;
  tradeoffSummary: DecisionTradeoffSummary;
  horizonLens: DecisionHorizonLens;
  explanationContext: DecisionExplanationContext;
  coachComment: DecisionCoachComment;
};
