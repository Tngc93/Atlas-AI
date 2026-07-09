export type CurrencyCode = "TRY";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type UiRiskLevel = "low" | "medium" | "high";

export type DebtType = "credit_card" | "loan" | "installment" | "other";

export type DebtStatus = "active" | "paused" | "paid_off";

export type Profile = {
  id: string;
  currency: CurrencyCode;
  monthlySalaryKurus: number;
  survivalThresholdKurus: number;
  salaryDay?: number;
};

export type DebtAccount = {
  id: string;
  type: DebtType;
  name: string;
  lender: string;
  balanceKurus: number;
  creditLimitKurus?: number;
  interestRateMonthly: number;
  interestRateAnnual?: number;
  manualInterestRateMonthly?: number;
  resolvedInterestRateMonthly?: number;
  interestRateSource?: string;
  interestRateResolvedAt?: string;
  interestRateNote?: string;
  minimumPaymentKurus: number;
  dueDay: number;
  statementDay?: number;
  installmentCount?: number;
  remainingInstallments?: number;
  status: DebtStatus;
};

export type MandatoryExpense = {
  id: string;
  name: string;
  category: string;
  amountKurus: number;
  dueDay?: number;
  isFixed: boolean;
  notes?: string;
};

export type MonthlyObligations = {
  salaryKurus: number;
  mandatoryExpenseTotalKurus: number;
  minimumDebtPaymentsKurus: number;
  totalRequiredKurus: number;
};

export type SalaryAllocation = MonthlyObligations & {
  survivalBudgetKurus: number;
  emergencyBufferKurus: number;
  extraDebtPaymentKurus: number;
  unallocatedKurus: number;
  riskLevel: RiskLevel;
};

export type DebtPriority = DebtAccount & {
  priorityRank: number;
  reason: string;
  dueDateStatus?: DueDateStatus;
  recommendedPaymentKurus?: number;
  projectedEndingBalanceKurus?: number;
  interestChargedKurus?: number;
};

export type DebtProjection = {
  debtAccountId: string;
  debtName: string;
  startingBalanceKurus: number;
  interestChargedKurus: number;
  minimumPaymentDueKurus: number;
  minimumPaymentKurus: number;
  minimumPaymentCovered: boolean;
  extraPaymentKurus: number;
  endingBalanceKurus: number;
  projectedPayoffMonth?: string;
};

export type PaymentPlanMonth = {
  month: string;
  salaryKurus: number;
  mandatoryExpenseTotalKurus: number;
  minimumDebtPaymentsKurus: number;
  extraDebtPaymentKurus: number;
  survivalBudgetKurus: number;
  riskLevel: RiskLevel;
  debtProjections: DebtProjection[];
  totalRemainingDebtKurus?: number;
  totalInterestChargedKurus?: number;
};

export type DueDateStatus = "safe" | "upcoming" | "due_soon" | "due_today" | "overdue" | "paid";

export type DueDateRisk = {
  debtAccountId: string;
  debtName: string;
  dueDateIso: string;
  daysUntilDue: number;
  status: DueDateStatus;
  riskLevel: UiRiskLevel;
  message: string;
};

export type PaymentAllocation = {
  debtAccountId: string;
  debtName: string;
  startingBalanceKurus: number;
  interestChargedKurus: number;
  minimumPaymentDueKurus: number;
  minimumPaymentKurus: number;
  minimumPaymentCovered: boolean;
  extraPaymentKurus: number;
  totalPaymentKurus: number;
  endingBalanceKurus: number;
  payoffThisMonth: boolean;
};

export type LivingBudgetPlan = {
  remainingForMonthKurus: number;
  protectedBufferKurus: number;
  dailyLimitKurus: number;
  weeklyLimitKurus: number;
  daysRemainingInMonth: number;
};

export type MonthlyActionItem = {
  id: string;
  title: string;
  description: string;
  priority: UiRiskLevel;
  amountKurus?: number;
  dueDateIso?: string;
  debtAccountId?: string;
};

export type MonthlyFinancePlan = {
  asOfDateIso: string;
  monthLabel: string;
  strategy: "avalanche";
  cashFlow: SalaryAllocation & {
    negativeCashFlowKurus: number;
    minimumPaymentsCovered: boolean;
  };
  livingBudget: LivingBudgetPlan;
  dueDateRisks: DueDateRisk[];
  debtPriorities: DebtPriority[];
  paymentAllocations: PaymentAllocation[];
  payoffForecast: PaymentPlanMonth[];
  actionPlan: MonthlyActionItem[];
  riskLevel: UiRiskLevel;
  criticalReasons: string[];
  warnings: string[];
};

export type MonthlyFinancePlanOptions = {
  asOfDate?: Date;
  dueSoonWindowDays?: number;
  horizonMonths?: number;
  currentMonthIncomeAdjustmentKurus?: number;
  extraDebtPaymentOverrideKurus?: number;
  extraPaymentTargetDebtId?: string;
};
