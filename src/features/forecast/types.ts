import type { RiskLevel, UiRiskLevel } from "@/features/finance/types";

export type ForecastHorizon = 3 | 6 | 12 | 24;

export type ForecastCheckpoint = {
  horizonMonths: ForecastHorizon;
  label: string;
  remainingDebtKurus: number;
  periodInterestKurus: number;
  averageLivingBudgetKurus: number;
  highestRiskLevel: UiRiskLevel;
  cashSqueezeMonths: string[];
  paidOffDebtNames: string[];
};

export type ForecastMonthlyTrend = {
  month: string;
  remainingDebtKurus: number;
  interestKurus: number;
  livingBudgetKurus: number;
  riskLevel: RiskLevel;
  extraDebtPaymentKurus: number;
};

export type ForecastDebtPayoffMilestone = {
  debtAccountId: string;
  debtName: string;
  month: string;
};

export type ForecastRiskWarning = {
  id: string;
  month: string;
  message: string;
  reason: string;
  reviewSuggestion: string;
  severity: UiRiskLevel;
};

export type ForecastAssumption = {
  id: string;
  label: string;
  value: string;
};

export type ForecastEvidenceItem = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type ForecastDecisionPrompt = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type ForecastNarrativeContext = {
  status: "stable" | "watch" | "strained";
  primaryRisk: string;
  primaryOpportunity: string;
  uncertaintyNote: string;
};

export type ForecastCoachSummary = {
  title: string;
  body: string;
  why: string;
};

export type ForecastReport = {
  generatedAtIso: string;
  horizons: ForecastHorizon[];
  checkpoints: ForecastCheckpoint[];
  monthlyTrend: ForecastMonthlyTrend[];
  payoffMilestones: ForecastDebtPayoffMilestone[];
  riskWarnings: ForecastRiskWarning[];
  assumptions: ForecastAssumption[];
  evidenceItems: ForecastEvidenceItem[];
  decisionPrompts: ForecastDecisionPrompt[];
  narrativeContext: ForecastNarrativeContext;
  coachSummary: ForecastCoachSummary;
  totalEstimatedInterestKurus: number;
  finalRemainingDebtKurus: number;
  estimatedPayoffMonth: string | null;
  payoffOutsideHorizon: boolean;
  highestRiskLevel: UiRiskLevel;
};

export type ForecastScenarioType =
  | "salary_increase"
  | "salary_decrease"
  | "expense_decrease"
  | "expense_increase"
  | "extra_debt_payment"
  | "new_debt";

export type ForecastScenarioInput = {
  type: ForecastScenarioType;
  amountKurus?: number;
  percent?: number;
  minimumPaymentKurus?: number;
  interestRateMonthly?: number;
};

export type ForecastScenarioDelta = {
  finalRemainingDebtDeltaKurus: number;
  totalInterestDeltaKurus: number;
  averageLivingBudgetDeltaKurus: number;
  payoffMonthDelta: number | null;
  baselineRiskLevel: UiRiskLevel;
  scenarioRiskLevel: UiRiskLevel;
  riskWarningCountDelta: number;
};

export type ForecastScenarioWarning = {
  id: string;
  severity: UiRiskLevel;
  message: string;
};

export type ForecastScenarioExplanation = {
  summary: string;
  why: string;
};

export type ForecastScenarioResult = {
  input: ForecastScenarioInput;
  title: string;
  baselineReport: ForecastReport;
  scenarioReport: ForecastReport;
  delta: ForecastScenarioDelta;
  warnings: ForecastScenarioWarning[];
  explanation: ForecastScenarioExplanation;
};
