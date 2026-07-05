import type {
  DebtAccount,
  DebtPriority,
  DueDateRisk,
  DueDateStatus,
  LivingBudgetPlan,
  MandatoryExpense,
  MonthlyActionItem,
  MonthlyFinancePlan,
  MonthlyFinancePlanOptions,
  MonthlyObligations,
  PaymentAllocation,
  PaymentPlanMonth,
  Profile,
  RiskLevel,
  SalaryAllocation,
  UiRiskLevel,
} from "./types";

const DEFAULT_HORIZON_MONTHS = 24;
const DEFAULT_DUE_SOON_WINDOW_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function activeDebts(debts: DebtAccount[]): DebtAccount[] {
  return debts.filter((debt) => debt.status === "active" && debt.balanceKurus > 0);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getDueDateForMonth(dueDay: number, date: Date): Date {
  const safeDueDay = Math.min(Math.max(1, dueDay), getDaysInMonth(date));
  return new Date(date.getFullYear(), date.getMonth(), safeDueDay);
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_IN_MS);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

function getShortMonthLabel(date: Date): string {
  return date.toLocaleDateString("tr-TR", { month: "short", year: "numeric" });
}

function clampPositive(value: number): number {
  return Math.max(0, Math.round(value));
}

function mapUiRiskToLegacy(riskLevel: UiRiskLevel, hasCriticalReasons: boolean): RiskLevel {
  return hasCriticalReasons ? "critical" : riskLevel;
}

export function calculateMonthlyObligations(
  profile: Profile,
  debts: DebtAccount[],
  expenses: MandatoryExpense[],
): MonthlyObligations {
  const mandatoryExpenseTotalKurus = expenses.reduce((total, expense) => total + expense.amountKurus, 0);
  const minimumDebtPaymentsKurus = activeDebts(debts).reduce(
    (total, debt) => total + Math.min(debt.minimumPaymentKurus, debt.balanceKurus),
    0,
  );

  return {
    salaryKurus: profile.monthlySalaryKurus,
    mandatoryExpenseTotalKurus,
    minimumDebtPaymentsKurus,
    totalRequiredKurus: mandatoryExpenseTotalKurus + minimumDebtPaymentsKurus,
  };
}

export function calculateSurvivalBudget(
  salaryKurus: number,
  mandatoryExpenseTotalKurus: number,
  minimumDebtPaymentsKurus: number,
): number {
  return salaryKurus - mandatoryExpenseTotalKurus - minimumDebtPaymentsKurus;
}

export function calculateLivingBudgetPlan(
  remainingForMonthKurus: number,
  protectedBufferKurus: number,
  asOfDate = new Date(),
): LivingBudgetPlan {
  const daysRemainingInMonth = Math.max(1, getDaysInMonth(asOfDate) - asOfDate.getDate() + 1);
  const spendableKurus = clampPositive(remainingForMonthKurus);
  const dailyLimitKurus = Math.floor(spendableKurus / daysRemainingInMonth);

  return {
    remainingForMonthKurus,
    protectedBufferKurus,
    dailyLimitKurus,
    weeklyLimitKurus: dailyLimitKurus * 7,
    daysRemainingInMonth,
  };
}

export function analyzeDueDateRisks(
  debts: DebtAccount[],
  asOfDate = new Date(),
  warningWindowDays = DEFAULT_DUE_SOON_WINDOW_DAYS,
): DueDateRisk[] {
  return activeDebts(debts)
    .map((debt) => {
      const dueDate = getDueDateForMonth(debt.dueDay, asOfDate);
      const daysUntilDue = daysBetween(asOfDate, dueDate);
      let status: DueDateStatus = "safe";
      let riskLevel: UiRiskLevel = "low";

      if (daysUntilDue < 0) {
        status = "overdue";
        riskLevel = "high";
      } else if (daysUntilDue === 0) {
        status = "due_today";
        riskLevel = "high";
      } else if (daysUntilDue <= warningWindowDays) {
        status = "due_soon";
        riskLevel = "medium";
      } else {
        status = "upcoming";
      }

      const messageByStatus: Record<DueDateStatus, string> = {
        safe: `${debt.name} için son ödeme tarihi bu ay güvenli aralıkta.`,
        upcoming: `${debt.name} için son ödeme tarihine ${daysUntilDue} gün var.`,
        due_soon: `${debt.name} için son ödeme tarihi yaklaşıyor: ${daysUntilDue} gün kaldı.`,
        due_today: `${debt.name} için son ödeme bugün yapılmalı.`,
        overdue: `${debt.name} için son ödeme tarihi ${Math.abs(daysUntilDue)} gün geçmiş.`,
        paid: `${debt.name} bu ay ödenmiş görünüyor.`,
      };

      return {
        debtAccountId: debt.id,
        debtName: debt.name,
        dueDateIso: toIsoDate(dueDate),
        daysUntilDue,
        status,
        riskLevel,
        message: messageByStatus[status],
      };
    })
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

export function assessCashFlowRisk(summary: {
  salaryKurus: number;
  totalRequiredKurus: number;
  survivalBudgetKurus: number;
  survivalThresholdKurus: number;
  debts: DebtAccount[];
}): RiskLevel {
  if (summary.salaryKurus < summary.totalRequiredKurus) {
    return "critical";
  }

  if (summary.survivalBudgetKurus < summary.survivalThresholdKurus) {
    return "high";
  }

  const hasHighInterestBalance = activeDebts(summary.debts).some((debt) => debt.interestRateMonthly >= 4);
  if (hasHighInterestBalance || summary.survivalBudgetKurus < summary.survivalThresholdKurus * 1.5) {
    return "medium";
  }

  return "low";
}

function assessMonthlyRisk(args: {
  obligations: MonthlyObligations;
  survivalBudgetKurus: number;
  survivalThresholdKurus: number;
  dueDateRisks: DueDateRisk[];
  paymentAllocations: PaymentAllocation[];
}): { riskLevel: UiRiskLevel; criticalReasons: string[]; warnings: string[] } {
  const criticalReasons: string[] = [];
  const warnings: string[] = [];

  if (args.obligations.salaryKurus < args.obligations.mandatoryExpenseTotalKurus) {
    criticalReasons.push("Maaş zorunlu yaşam giderlerini karşılamıyor.");
  }

  if (args.obligations.salaryKurus < args.obligations.totalRequiredKurus) {
    criticalReasons.push("Maaş, zorunlu giderler ve asgari borç ödemelerinin tamamına yetmiyor.");
  }

  if (args.survivalBudgetKurus < 0) {
    criticalReasons.push("Nakit akışı ay başında negatif görünüyor.");
  }

  if (args.paymentAllocations.some((allocation) => !allocation.minimumPaymentCovered)) {
    criticalReasons.push("En az bir borç için asgari ödeme güvenceye alınamıyor.");
  }

  const overdueDebts = args.dueDateRisks.filter((risk) => risk.status === "overdue" || risk.status === "due_today");
  if (overdueDebts.length > 0) {
    criticalReasons.push("Bugün ödenmesi gereken veya gecikmiş borç var.");
  }

  if (args.survivalBudgetKurus < args.survivalThresholdKurus && args.survivalBudgetKurus >= 0) {
    warnings.push("Hayatta kalma bütçesi hedef eşiğin altında.");
  }

  const dueSoonDebts = args.dueDateRisks.filter((risk) => risk.status === "due_soon");
  if (dueSoonDebts.length > 0) {
    warnings.push("Önümüzdeki 7 gün içinde son ödeme tarihi yaklaşan borç var.");
  }

  if (criticalReasons.length > 0) {
    return { riskLevel: "high", criticalReasons, warnings };
  }

  if (warnings.length > 0) {
    return { riskLevel: "medium", criticalReasons, warnings };
  }

  return { riskLevel: "low", criticalReasons, warnings };
}

export function rankDebtsByAvalanche(debts: DebtAccount[], dueDateRisks: DueDateRisk[] = []): DebtPriority[] {
  const riskByDebtId = new Map(dueDateRisks.map((risk) => [risk.debtAccountId, risk]));

  return [...activeDebts(debts)]
    .sort((a, b) => {
      if (b.interestRateMonthly !== a.interestRateMonthly) {
        return b.interestRateMonthly - a.interestRateMonthly;
      }

      const dueA = riskByDebtId.get(a.id)?.daysUntilDue ?? Number.POSITIVE_INFINITY;
      const dueB = riskByDebtId.get(b.id)?.daysUntilDue ?? Number.POSITIVE_INFINITY;
      if (dueA !== dueB) {
        return dueA - dueB;
      }

      return b.balanceKurus - a.balanceKurus;
    })
    .map((debt, index) => {
      const dueDateRisk = riskByDebtId.get(debt.id);

      return {
        ...debt,
        priorityRank: index + 1,
        dueDateStatus: dueDateRisk?.status,
        reason:
          index === 0
            ? "En yüksek aylık faiz oranı; ek ödeme önce buraya yönlendirilir."
            : "Asgari ödeme korunur; daha yüksek faizli bakiyeler önce azaltılır.",
      };
    });
}

export function allocateMonthlyPayments(
  debts: DebtAccount[],
  extraDebtPaymentKurus: number,
  dueDateRisks: DueDateRisk[] = [],
  availableDebtPaymentBudgetKurus = Number.POSITIVE_INFINITY,
  extraPaymentTargetDebtId?: string,
): PaymentAllocation[] {
  const activeDebtList = activeDebts(debts);
  const riskByDebtId = new Map(dueDateRisks.map((risk) => [risk.debtAccountId, risk]));
  const dueOrderedDebts = [...activeDebtList].sort((a, b) => {
    const dueA = riskByDebtId.get(a.id)?.daysUntilDue ?? Number.POSITIVE_INFINITY;
    const dueB = riskByDebtId.get(b.id)?.daysUntilDue ?? Number.POSITIVE_INFINITY;
    if (dueA !== dueB) {
      return dueA - dueB;
    }

    return b.interestRateMonthly - a.interestRateMonthly;
  });
  const rankedDebts = rankDebtsByAvalanche(debts, dueDateRisks);
  const allocationsByDebtId = new Map<string, PaymentAllocation>();
  let remainingMinimumBudgetKurus = availableDebtPaymentBudgetKurus;

  for (const debt of dueOrderedDebts) {
    const startingBalanceKurus = clampPositive(debt.balanceKurus);
    const interestChargedKurus = Math.round(startingBalanceKurus * (debt.interestRateMonthly / 100));
    const balanceWithInterestKurus = startingBalanceKurus + interestChargedKurus;
    const minimumPaymentDueKurus = Math.min(debt.minimumPaymentKurus, balanceWithInterestKurus);
    const minimumPaymentKurus = Math.min(minimumPaymentDueKurus, remainingMinimumBudgetKurus);
    remainingMinimumBudgetKurus -= minimumPaymentKurus;

    allocationsByDebtId.set(debt.id, {
      debtAccountId: debt.id,
      debtName: debt.name,
      startingBalanceKurus,
      interestChargedKurus,
      minimumPaymentDueKurus,
      minimumPaymentKurus,
      minimumPaymentCovered: minimumPaymentKurus >= minimumPaymentDueKurus,
      extraPaymentKurus: 0,
      totalPaymentKurus: minimumPaymentKurus,
      endingBalanceKurus: clampPositive(balanceWithInterestKurus - minimumPaymentKurus),
      payoffThisMonth: clampPositive(balanceWithInterestKurus - minimumPaymentKurus) === 0,
    });
  }

  if ([...allocationsByDebtId.values()].some((allocation) => !allocation.minimumPaymentCovered)) {
    return activeDebtList.map((debt) => allocationsByDebtId.get(debt.id)).filter(Boolean) as PaymentAllocation[];
  }

  let remainingExtraKurus = clampPositive(extraDebtPaymentKurus);
  const targetedDebt = extraPaymentTargetDebtId
    ? rankedDebts.find((debt) => debt.id === extraPaymentTargetDebtId)
    : undefined;

  if (targetedDebt) {
    const currentAllocation = allocationsByDebtId.get(targetedDebt.id);

    if (currentAllocation) {
      const extraPaymentKurus = Math.min(remainingExtraKurus, currentAllocation.endingBalanceKurus);
      remainingExtraKurus -= extraPaymentKurus;
      const endingBalanceKurus = clampPositive(currentAllocation.endingBalanceKurus - extraPaymentKurus);

      allocationsByDebtId.set(targetedDebt.id, {
        ...currentAllocation,
        extraPaymentKurus,
        totalPaymentKurus: currentAllocation.minimumPaymentKurus + extraPaymentKurus,
        endingBalanceKurus,
        payoffThisMonth: endingBalanceKurus === 0,
      });
    }
  }

  for (const debt of rankedDebts) {
    if (debt.id === targetedDebt?.id) {
      continue;
    }

    const currentAllocation = allocationsByDebtId.get(debt.id);
    if (!currentAllocation) {
      continue;
    }

    const balanceAfterMinimumKurus = currentAllocation.endingBalanceKurus;
    const extraPaymentKurus = Math.min(remainingExtraKurus, balanceAfterMinimumKurus);
    remainingExtraKurus -= extraPaymentKurus;
    const endingBalanceKurus = clampPositive(balanceAfterMinimumKurus - extraPaymentKurus);

    allocationsByDebtId.set(debt.id, {
      ...currentAllocation,
      extraPaymentKurus,
      totalPaymentKurus: currentAllocation.minimumPaymentKurus + extraPaymentKurus,
      endingBalanceKurus,
      payoffThisMonth: endingBalanceKurus === 0,
    });
  }

  return activeDebts(debts).map((debt) => allocationsByDebtId.get(debt.id)).filter(Boolean) as PaymentAllocation[];
}

export function buildSalaryAllocation(
  profile: Profile,
  debts: DebtAccount[],
  expenses: MandatoryExpense[],
  asOfDate = new Date(),
  options: Pick<MonthlyFinancePlanOptions, "extraDebtPaymentOverrideKurus" | "extraPaymentTargetDebtId"> = {},
): SalaryAllocation {
  const obligations = calculateMonthlyObligations(profile, debts, expenses);
  const survivalBudgetKurus = calculateSurvivalBudget(
    obligations.salaryKurus,
    obligations.mandatoryExpenseTotalKurus,
    obligations.minimumDebtPaymentsKurus,
  );
  const emergencyBufferKurus = Math.max(0, Math.min(survivalBudgetKurus, profile.survivalThresholdKurus));
  const recommendedExtraDebtPaymentKurus =
    survivalBudgetKurus >= profile.survivalThresholdKurus ? survivalBudgetKurus - profile.survivalThresholdKurus : 0;
  const extraDebtPaymentKurus = Math.max(
    0,
    Math.round(options.extraDebtPaymentOverrideKurus ?? recommendedExtraDebtPaymentKurus),
  );
  const dueDateRisks = analyzeDueDateRisks(debts, asOfDate);
  const availableDebtPaymentBudgetKurus = Math.max(0, obligations.salaryKurus - obligations.mandatoryExpenseTotalKurus);
  const paymentAllocations = allocateMonthlyPayments(
    debts,
    extraDebtPaymentKurus,
    dueDateRisks,
    availableDebtPaymentBudgetKurus,
    options.extraPaymentTargetDebtId,
  );
  const monthlyRisk = assessMonthlyRisk({
    obligations,
    survivalBudgetKurus,
    survivalThresholdKurus: profile.survivalThresholdKurus,
    dueDateRisks,
    paymentAllocations,
  });

  return {
    ...obligations,
    survivalBudgetKurus,
    emergencyBufferKurus,
    extraDebtPaymentKurus,
    unallocatedKurus: Math.max(0, survivalBudgetKurus - emergencyBufferKurus - extraDebtPaymentKurus),
    riskLevel: mapUiRiskToLegacy(monthlyRisk.riskLevel, monthlyRisk.criticalReasons.length > 0),
  };
}

export function projectDebtPayoff(
  profile: Profile,
  debts: DebtAccount[],
  expenses: MandatoryExpense[],
  horizonMonths = DEFAULT_HORIZON_MONTHS,
  asOfDate = new Date(),
  options: Pick<
    MonthlyFinancePlanOptions,
    "currentMonthIncomeAdjustmentKurus" | "extraDebtPaymentOverrideKurus" | "extraPaymentTargetDebtId"
  > = {},
): PaymentPlanMonth[] {
  const projectedDebts = activeDebts(debts).map((debt) => ({ ...debt }));
  const months: PaymentPlanMonth[] = [];

  for (let offset = 0; offset < horizonMonths; offset += 1) {
    const monthDate = new Date(asOfDate.getFullYear(), asOfDate.getMonth() + offset, 1);
    const month = getShortMonthLabel(monthDate);
    const monthProfile =
      offset === 0 && options.currentMonthIncomeAdjustmentKurus
        ? { ...profile, monthlySalaryKurus: profile.monthlySalaryKurus + options.currentMonthIncomeAdjustmentKurus }
        : profile;
    const firstMonthAllocationOptions =
      offset === 0
        ? {
            extraDebtPaymentOverrideKurus: options.extraDebtPaymentOverrideKurus,
            extraPaymentTargetDebtId: options.extraPaymentTargetDebtId,
          }
        : {};
    const allocation = buildSalaryAllocation(monthProfile, projectedDebts, expenses, monthDate, firstMonthAllocationOptions);
    const dueDateRisks = analyzeDueDateRisks(projectedDebts, monthDate);
    const availableDebtPaymentBudgetKurus = Math.max(
      0,
      monthProfile.monthlySalaryKurus - allocation.mandatoryExpenseTotalKurus,
    );
    const paymentAllocations = allocateMonthlyPayments(
      projectedDebts,
      allocation.extraDebtPaymentKurus,
      dueDateRisks,
      availableDebtPaymentBudgetKurus,
      offset === 0 ? options.extraPaymentTargetDebtId : undefined,
    );
    const allocationByDebtId = new Map(paymentAllocations.map((payment) => [payment.debtAccountId, payment]));

    const debtProjections = projectedDebts.map((debt) => {
      const allocationForDebt = allocationByDebtId.get(debt.id);

      if (!allocationForDebt) {
        return {
          debtAccountId: debt.id,
          debtName: debt.name,
          startingBalanceKurus: 0,
          interestChargedKurus: 0,
          minimumPaymentDueKurus: 0,
          minimumPaymentKurus: 0,
          minimumPaymentCovered: true,
          extraPaymentKurus: 0,
          endingBalanceKurus: 0,
          projectedPayoffMonth: month,
        };
      }

      debt.balanceKurus = allocationForDebt.endingBalanceKurus;

      return {
        debtAccountId: debt.id,
        debtName: debt.name,
        startingBalanceKurus: allocationForDebt.startingBalanceKurus,
        interestChargedKurus: allocationForDebt.interestChargedKurus,
        minimumPaymentDueKurus: allocationForDebt.minimumPaymentDueKurus,
        minimumPaymentKurus: allocationForDebt.minimumPaymentKurus,
        minimumPaymentCovered: allocationForDebt.minimumPaymentCovered,
        extraPaymentKurus: allocationForDebt.extraPaymentKurus,
        endingBalanceKurus: allocationForDebt.endingBalanceKurus,
        projectedPayoffMonth: allocationForDebt.payoffThisMonth ? month : undefined,
      };
    });

    const actualExtraPaymentKurus = paymentAllocations.reduce((total, payment) => total + payment.extraPaymentKurus, 0);

    months.push({
      month,
      salaryKurus: monthProfile.monthlySalaryKurus,
      mandatoryExpenseTotalKurus: allocation.mandatoryExpenseTotalKurus,
      minimumDebtPaymentsKurus: allocation.minimumDebtPaymentsKurus,
      extraDebtPaymentKurus: actualExtraPaymentKurus,
      survivalBudgetKurus: allocation.survivalBudgetKurus - actualExtraPaymentKurus,
      riskLevel: allocation.riskLevel,
      debtProjections,
      totalRemainingDebtKurus: debtProjections.reduce((total, debt) => total + debt.endingBalanceKurus, 0),
      totalInterestChargedKurus: debtProjections.reduce((total, debt) => total + debt.interestChargedKurus, 0),
    });

    if (projectedDebts.every((debt) => debt.balanceKurus <= 0)) {
      break;
    }
  }

  return months;
}

export function buildMonthlyActionPlan(args: {
  riskLevel: UiRiskLevel;
  criticalReasons: string[];
  warnings: string[];
  dueDateRisks: DueDateRisk[];
  paymentAllocations: PaymentAllocation[];
  livingBudget: LivingBudgetPlan;
}): MonthlyActionItem[] {
  const actions: MonthlyActionItem[] = [];
  const urgentDueRisk = args.dueDateRisks.find(
    (risk) => risk.status === "overdue" || risk.status === "due_today" || risk.status === "due_soon",
  );
  const highestPayment = [...args.paymentAllocations].sort((a, b) => b.extraPaymentKurus - a.extraPaymentKurus)[0];

  if (args.criticalReasons.length > 0) {
    actions.push({
      id: "critical-cash-flow",
      title: "Önce nakit akışını güvenceye al",
      description: args.criticalReasons[0],
      priority: "high",
    });
  }

  if (urgentDueRisk) {
    actions.push({
      id: `due-${urgentDueRisk.debtAccountId}`,
      title: "Yaklaşan son ödeme tarihini kaçırma",
      description: urgentDueRisk.message,
      priority: urgentDueRisk.riskLevel,
      dueDateIso: urgentDueRisk.dueDateIso,
      debtAccountId: urgentDueRisk.debtAccountId,
    });
  }

  if (highestPayment && highestPayment.extraPaymentKurus > 0) {
    actions.push({
      id: `extra-${highestPayment.debtAccountId}`,
      title: "Ek ödemeyi yüksek faizli borca yönlendir",
      description: `${highestPayment.debtName} için bu ay asgariye ek ödeme öneriliyor.`,
      priority: "medium",
      amountKurus: highestPayment.extraPaymentKurus,
      debtAccountId: highestPayment.debtAccountId,
    });
  }

  actions.push({
    id: "daily-limit",
    title: "Günlük harcama limitini takip et",
    description: `Ay sonuna kadar günlük güvenli harcama limiti hesaplandı.`,
    priority: args.livingBudget.dailyLimitKurus > 0 ? "low" : "high",
    amountKurus: args.livingBudget.dailyLimitKurus,
  });

  if (actions.length < 4 && args.warnings.length > 0) {
    actions.push({
      id: "warning-review",
      title: "Risk uyarılarını gözden geçir",
      description: args.warnings[0],
      priority: args.riskLevel,
    });
  }

  return actions;
}

export function buildMonthlyFinancePlan(
  profile: Profile,
  debts: DebtAccount[],
  expenses: MandatoryExpense[],
  options: MonthlyFinancePlanOptions = {},
): MonthlyFinancePlan {
  const asOfDate = options.asOfDate ?? new Date();
  const dueSoonWindowDays = options.dueSoonWindowDays ?? DEFAULT_DUE_SOON_WINDOW_DAYS;
  const horizonMonths = options.horizonMonths ?? DEFAULT_HORIZON_MONTHS;
  const currentMonthProfile = options.currentMonthIncomeAdjustmentKurus
    ? { ...profile, monthlySalaryKurus: profile.monthlySalaryKurus + options.currentMonthIncomeAdjustmentKurus }
    : profile;
  const obligations = calculateMonthlyObligations(currentMonthProfile, debts, expenses);
  const survivalBudgetKurus = calculateSurvivalBudget(
    obligations.salaryKurus,
    obligations.mandatoryExpenseTotalKurus,
    obligations.minimumDebtPaymentsKurus,
  );
  const recommendedExtraDebtPaymentKurus =
    survivalBudgetKurus >= profile.survivalThresholdKurus ? survivalBudgetKurus - profile.survivalThresholdKurus : 0;
  const extraDebtPaymentKurus = Math.max(
    0,
    Math.round(options.extraDebtPaymentOverrideKurus ?? recommendedExtraDebtPaymentKurus),
  );
  const dueDateRisks = analyzeDueDateRisks(debts, asOfDate, dueSoonWindowDays);
  const availableDebtPaymentBudgetKurus = Math.max(0, obligations.salaryKurus - obligations.mandatoryExpenseTotalKurus);
  const paymentAllocations = allocateMonthlyPayments(
    debts,
    extraDebtPaymentKurus,
    dueDateRisks,
    availableDebtPaymentBudgetKurus,
    options.extraPaymentTargetDebtId,
  );
  const risk = assessMonthlyRisk({
    obligations,
    survivalBudgetKurus,
    survivalThresholdKurus: profile.survivalThresholdKurus,
    dueDateRisks,
    paymentAllocations,
  });
  const livingBudget = calculateLivingBudgetPlan(
    survivalBudgetKurus - extraDebtPaymentKurus,
    Math.max(0, Math.min(survivalBudgetKurus, profile.survivalThresholdKurus)),
    asOfDate,
  );
  const debtPriorities = rankDebtsByAvalanche(debts, dueDateRisks).map((debt) => {
    const allocation = paymentAllocations.find((payment) => payment.debtAccountId === debt.id);

    return {
      ...debt,
      recommendedPaymentKurus: allocation?.totalPaymentKurus ?? 0,
      projectedEndingBalanceKurus: allocation?.endingBalanceKurus ?? debt.balanceKurus,
      interestChargedKurus: allocation?.interestChargedKurus ?? 0,
    };
  });
  const payoffForecast = projectDebtPayoff(profile, debts, expenses, horizonMonths, asOfDate, {
    currentMonthIncomeAdjustmentKurus: options.currentMonthIncomeAdjustmentKurus,
    extraDebtPaymentOverrideKurus: options.extraDebtPaymentOverrideKurus,
    extraPaymentTargetDebtId: options.extraPaymentTargetDebtId,
  });
  const actionPlan = buildMonthlyActionPlan({
    ...risk,
    dueDateRisks,
    paymentAllocations,
    livingBudget,
  });

  return {
    asOfDateIso: toIsoDate(asOfDate),
    monthLabel: getMonthLabel(asOfDate),
    strategy: "avalanche",
    cashFlow: {
      ...obligations,
      survivalBudgetKurus,
      emergencyBufferKurus: livingBudget.protectedBufferKurus,
      extraDebtPaymentKurus,
      unallocatedKurus: 0,
      riskLevel: mapUiRiskToLegacy(risk.riskLevel, risk.criticalReasons.length > 0),
      negativeCashFlowKurus: clampPositive(-survivalBudgetKurus),
      minimumPaymentsCovered: obligations.salaryKurus >= obligations.totalRequiredKurus,
    },
    livingBudget,
    dueDateRisks,
    debtPriorities,
    paymentAllocations,
    payoffForecast,
    actionPlan,
    riskLevel: risk.riskLevel,
    criticalReasons: risk.criticalReasons,
    warnings: risk.warnings,
  };
}
