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
  severity: UiRiskLevel;
};

export type ForecastAssumption = {
  id: string;
  label: string;
  value: string;
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
  coachSummary: ForecastCoachSummary;
  totalEstimatedInterestKurus: number;
  finalRemainingDebtKurus: number;
  estimatedPayoffMonth: string | null;
  payoffOutsideHorizon: boolean;
  highestRiskLevel: UiRiskLevel;
};
