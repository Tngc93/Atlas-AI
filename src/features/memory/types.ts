import type { UiRiskLevel } from "@/features/finance/types";

export type FinancialMemoryTrigger =
  | "manual_refresh"
  | "income_changed"
  | "salary_record_changed"
  | "debt_changed"
  | "expense_changed";

export type MemoryWindow = 3 | 6 | 12;

export type FinancialMemorySnapshotInput = {
  periodMonth: string;
  capturedAt: Date;
  trigger: FinancialMemoryTrigger;
  salaryKurus: number;
  mandatoryExpenseTotalKurus: number;
  minimumDebtPaymentsKurus: number;
  survivalBudgetKurus: number;
  dailyLimitKurus: number;
  weeklyLimitKurus: number;
  extraDebtPaymentCapacityKurus: number;
  totalDebtKurus: number;
  activeDebtKurus: number;
  creditCardDebtKurus: number;
  activeDebtCount: number;
  paidOffDebtCount: number;
  riskLevel: UiRiskLevel;
  criticalReasonCount: number;
  warningCount: number;
  fallbackRateDebtCount: number;
  missingRateDebtCount: number;
  manualRateDebtCount: number;
  providerRateDebtCount: number;
  planExtraDebtPaymentKurus: number;
  planMinimumPaymentsCovered: boolean;
  categoryTotals: FinancialMemoryCategoryTotalInput[];
};

export type FinancialMemoryCategoryTotalInput = {
  category: string;
  amountKurus: number;
  itemCount: number;
};

export type FinancialMemorySnapshotRecord = Omit<FinancialMemorySnapshotInput, "categoryTotals"> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  categoryTotals: FinancialMemoryCategoryTotalInput[];
};

export type MemoryTrendPoint = {
  periodMonth: string;
  totalDebtKurus: number;
  activeDebtKurus: number;
  creditCardDebtKurus: number;
  mandatoryExpenseTotalKurus: number;
  salaryKurus: number;
  survivalBudgetKurus: number;
  minimumDebtPaymentsKurus: number;
  extraDebtPaymentCapacityKurus: number;
  riskLevel: UiRiskLevel;
};

export type MemoryWindowComparison = {
  months: MemoryWindow;
  hasEnoughHistory: boolean;
  availableMonths: number;
  totalDebtDeltaKurus: number;
  activeDebtDeltaKurus: number;
  survivalBudgetDeltaKurus: number;
  mandatoryExpenseRatioDelta: number;
  creditCardDebtShareDelta: number;
  highRiskMonthCount: number;
  cashSqueezeCount: number;
  debtVelocityKurus: number;
};

export type FinancialMemoryInsight = {
  id: string;
  title: string;
  body: string;
  tone: UiRiskLevel;
};

export type FinancialMemoryReport = {
  generatedAtIso: string;
  hasAnySnapshot: boolean;
  hasEnoughHistory: boolean;
  snapshotCount: number;
  latestSnapshot: FinancialMemorySnapshotRecord | null;
  trend: MemoryTrendPoint[];
  comparisons: MemoryWindowComparison[];
  insights: FinancialMemoryInsight[];
  categoryChanges: {
    category: string;
    currentAmountKurus: number;
    previousAmountKurus: number;
    deltaKurus: number;
  }[];
  planAdherence: {
    label: string;
    score: number | null;
    helper: string;
  };
};
