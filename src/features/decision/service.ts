import { buildMonthlyFinancePlan, rankDebtsByAvalanche } from "@/features/finance/calculations";
import type { FinanceSnapshot } from "@/features/finance/data-service";
import type {
  DebtAccount,
  MandatoryExpense,
  MonthlyFinancePlan,
  MonthlyFinancePlanOptions,
  Profile,
  UiRiskLevel,
} from "@/features/finance/types";
import { formatTry } from "@/features/finance/money";
import type {
  DecisionCoachComment,
  DecisionScenarioDelta,
  DecisionScenarioInput,
  DecisionScenarioResult,
  DecisionScenarioWarning,
} from "./types";

const DECISION_HORIZON_MONTHS = 24;

const scenarioTitles: Record<DecisionScenarioInput["type"], string> = {
  extra_debt_payment: "Bu ay ekstra borç ödemesi",
  salary_increase: "Maaş artışı",
  one_time_bonus: "Tek seferlik ek gelir",
  reduce_expenses_percent: "Zorunlu gider azaltımı",
  specific_debt_payment: "Belirli borca ekstra ödeme",
  no_extra_payment: "Bu ay ekstra ödeme yok",
};

function riskRank(riskLevel: UiRiskLevel): number {
  return { low: 1, medium: 2, high: 3 }[riskLevel];
}

function maxRisk(...levels: UiRiskLevel[]): UiRiskLevel {
  return levels.reduce((highest, current) => (riskRank(current) > riskRank(highest) ? current : highest), "low");
}

function cloneDebts(debts: DebtAccount[]): DebtAccount[] {
  return debts.map((debt) => ({ ...debt }));
}

function cloneExpenses(expenses: MandatoryExpense[]): MandatoryExpense[] {
  return expenses.map((expense) => ({ ...expense }));
}

function getPlanTotalRemainingDebt(plan: MonthlyFinancePlan, index: number): number {
  const month = plan.payoffForecast[index];

  if (!month) {
    return 0;
  }

  return month.totalRemainingDebtKurus ?? month.debtProjections.reduce((total, debt) => total + debt.endingBalanceKurus, 0);
}

function getPayoffIndex(plan: MonthlyFinancePlan): number | null {
  const payoffIndex = plan.payoffForecast.findIndex((month) => getPlanTotalRemainingDebt({ ...plan, payoffForecast: [month] }, 0) === 0);

  return payoffIndex >= 0 ? payoffIndex : null;
}

function getPayoffMonth(plan: MonthlyFinancePlan, index: number | null): string | null {
  if (index === null) {
    return null;
  }

  return plan.payoffForecast[index]?.month ?? null;
}

function buildDebtsAfterFirstMonth(debts: DebtAccount[], plan: MonthlyFinancePlan): DebtAccount[] {
  const allocationByDebtId = new Map(plan.paymentAllocations.map((allocation) => [allocation.debtAccountId, allocation]));

  return debts.map((debt) => ({
    ...debt,
    balanceKurus: allocationByDebtId.get(debt.id)?.endingBalanceKurus ?? debt.balanceKurus,
  }));
}

function getNextMonthTopDebtName(debts: DebtAccount[], plan: MonthlyFinancePlan): string | null {
  const nextMonthDebts = buildDebtsAfterFirstMonth(debts, plan);
  return rankDebtsByAvalanche(nextMonthDebts)[0]?.name ?? null;
}

function getAdjustedScenarioRisk(plan: MonthlyFinancePlan, profile: Profile, warnings: DecisionScenarioWarning[]): UiRiskLevel {
  const livingBudgetRisk = plan.livingBudget.remainingForMonthKurus < profile.survivalThresholdKurus ? "high" : "low";
  const warningRisk = warnings.reduce<UiRiskLevel>((highest, warning) => maxRisk(highest, warning.severity), "low");

  return maxRisk(plan.riskLevel, livingBudgetRisk, warningRisk);
}

function comparePlans(args: {
  baselinePlan: MonthlyFinancePlan;
  scenarioPlan: MonthlyFinancePlan;
  baselineDebts: DebtAccount[];
  scenarioDebts: DebtAccount[];
  scenarioRiskLevel: UiRiskLevel;
}): DecisionScenarioDelta {
  const baselinePayoffIndex = getPayoffIndex(args.baselinePlan);
  const scenarioPayoffIndex = getPayoffIndex(args.scenarioPlan);
  const baselineTopDebtName = getNextMonthTopDebtName(args.baselineDebts, args.baselinePlan);
  const scenarioTopDebtName = getNextMonthTopDebtName(args.scenarioDebts, args.scenarioPlan);

  return {
    firstMonthRemainingDebtDeltaKurus:
      getPlanTotalRemainingDebt(args.scenarioPlan, 0) - getPlanTotalRemainingDebt(args.baselinePlan, 0),
    horizonRemainingDebtDeltaKurus:
      getPlanTotalRemainingDebt(args.scenarioPlan, args.scenarioPlan.payoffForecast.length - 1) -
      getPlanTotalRemainingDebt(args.baselinePlan, args.baselinePlan.payoffForecast.length - 1),
    livingBudgetDeltaKurus:
      args.scenarioPlan.livingBudget.remainingForMonthKurus - args.baselinePlan.livingBudget.remainingForMonthKurus,
    dailyLimitDeltaKurus: args.scenarioPlan.livingBudget.dailyLimitKurus - args.baselinePlan.livingBudget.dailyLimitKurus,
    weeklyLimitDeltaKurus: args.scenarioPlan.livingBudget.weeklyLimitKurus - args.baselinePlan.livingBudget.weeklyLimitKurus,
    payoffMonthDelta:
      baselinePayoffIndex === null || scenarioPayoffIndex === null ? null : baselinePayoffIndex - scenarioPayoffIndex,
    baselinePayoffMonth: getPayoffMonth(args.baselinePlan, baselinePayoffIndex),
    scenarioPayoffMonth: getPayoffMonth(args.scenarioPlan, scenarioPayoffIndex),
    baselineRiskLevel: args.baselinePlan.riskLevel,
    scenarioRiskLevel: args.scenarioRiskLevel,
    priorityChanged: baselineTopDebtName !== scenarioTopDebtName,
    baselineTopDebtName,
    scenarioTopDebtName,
  };
}

function buildScenarioWarnings(args: {
  input: DecisionScenarioInput;
  baselinePlan: MonthlyFinancePlan;
  scenarioPlan: MonthlyFinancePlan;
  profile: Profile;
  debts: DebtAccount[];
}): DecisionScenarioWarning[] {
  const warnings: DecisionScenarioWarning[] = [];

  if (args.scenarioPlan.livingBudget.remainingForMonthKurus < 0) {
    warnings.push({
      id: "negative-living-budget",
      severity: "high",
      message: "Bu senaryo ay sonu yaşam bütçesini negatife indiriyor.",
    });
  }

  if (args.scenarioPlan.livingBudget.remainingForMonthKurus < args.profile.survivalThresholdKurus) {
    warnings.push({
      id: "threshold-below",
      severity: "high",
      message: "Bu senaryo hayatta kalma bütçesi eşiğini koruyamıyor; hesaplandı ama öneri olarak görülmemeli.",
    });
  }

  if (args.input.type === "specific_debt_payment") {
    const selectedDebt = args.debts.find((debt) => debt.id === args.input.debtAccountId && debt.status === "active");
    if (!selectedDebt) {
      warnings.push({
        id: "missing-target-debt",
        severity: "high",
        message: "Seçilen aktif borç bulunamadığı için senaryo güvenilir biçimde uygulanamadı.",
      });
    }
  }

  if (args.input.type === "no_extra_payment" && args.baselinePlan.cashFlow.extraDebtPaymentKurus > 0) {
    warnings.push({
      id: "extra-payment-paused",
      severity: "medium",
      message: "Ek ödeme durdurulduğunda borç kapanış hızı yavaşlayabilir.",
    });
  }

  return warnings;
}

function buildCoachComment(delta: DecisionScenarioDelta, warnings: DecisionScenarioWarning[]): DecisionCoachComment {
  const debtDirection =
    delta.firstMonthRemainingDebtDeltaKurus < 0
      ? "Bu karar ilk ay sonunda toplam borcu azaltıyor."
      : delta.firstMonthRemainingDebtDeltaKurus > 0
        ? "Bu karar ilk ay sonunda toplam borcu mevcut plana göre daha yüksek bırakıyor."
        : "Bu karar ilk ay sonunda toplam borcu değiştirmiyor.";
  const riskText =
    riskRank(delta.scenarioRiskLevel) > riskRank(delta.baselineRiskLevel)
      ? "Risk seviyesi yükseliyor; önce yaşam bütçesini korumak gerekir."
      : riskRank(delta.scenarioRiskLevel) < riskRank(delta.baselineRiskLevel)
        ? "Risk seviyesi düşüyor; nakit akışı daha rahatlıyor."
        : "Risk seviyesi değişmiyor; kararın etkisi daha çok borç hızı ve yaşam bütçesinde görülüyor.";
  const priorityText = delta.priorityChanged
    ? `Öncelik değişiyor: mevcut planda ${delta.baselineTopDebtName ?? "borç yok"}, senaryoda ${delta.scenarioTopDebtName ?? "borç yok"} öne çıkıyor.`
    : `Borç önceliği değişmiyor; ${delta.scenarioTopDebtName ?? "aktif borç"} odağı korunuyor.`;
  const warningText =
    warnings.length > 0 ? ` Dikkat: ${warnings[0].message}` : " Senaryo mevcut güvenlik çerçevesinde uygulanabilir görünüyor.";

  return {
    summary: `${debtDirection} ${riskText}`,
    why: `${priorityText} Yaşam bütçesi farkı ${formatTry(delta.livingBudgetDeltaKurus)}; bu nedenle karar yalnızca borç azaltma hızına değil, ay sonuna kadar yaşanabilir nakde de göre değerlendirilmelidir.${warningText}`,
  };
}

function buildScenarioPlan(
  profile: Profile,
  debts: DebtAccount[],
  expenses: MandatoryExpense[],
  options: MonthlyFinancePlanOptions,
): MonthlyFinancePlan {
  return buildMonthlyFinancePlan(profile, debts, expenses, {
    horizonMonths: DECISION_HORIZON_MONTHS,
    ...options,
  });
}

export function simulateDecisionScenario(
  snapshot: FinanceSnapshot,
  input: DecisionScenarioInput,
): DecisionScenarioResult {
  const baselineDebts = cloneDebts(snapshot.debts);
  const baselineExpenses = cloneExpenses(snapshot.expenses);
  const baselinePlan = buildMonthlyFinancePlan(snapshot.profile, baselineDebts, baselineExpenses, {
    horizonMonths: DECISION_HORIZON_MONTHS,
  });
  let scenarioProfile = { ...snapshot.profile };
  const scenarioDebts = cloneDebts(snapshot.debts);
  let scenarioExpenses = cloneExpenses(snapshot.expenses);
  const options: MonthlyFinancePlanOptions = {};

  if (input.type === "salary_increase" && input.amountKurus) {
    scenarioProfile = {
      ...scenarioProfile,
      monthlySalaryKurus: scenarioProfile.monthlySalaryKurus + input.amountKurus,
    };
  }

  if (input.type === "one_time_bonus" && input.amountKurus) {
    options.currentMonthIncomeAdjustmentKurus = input.amountKurus;
  }

  if (input.type === "reduce_expenses_percent" && typeof input.percent === "number") {
    const multiplier = Math.max(0, 1 - input.percent / 100);
    scenarioExpenses = scenarioExpenses.map((expense) => ({
      ...expense,
      amountKurus: Math.round(expense.amountKurus * multiplier),
    }));
  }

  if (input.type === "extra_debt_payment") {
    options.extraDebtPaymentOverrideKurus = input.amountKurus ?? 0;
  }

  if (input.type === "specific_debt_payment") {
    options.extraDebtPaymentOverrideKurus = input.amountKurus ?? 0;
    options.extraPaymentTargetDebtId = input.debtAccountId;
  }

  if (input.type === "no_extra_payment") {
    options.extraDebtPaymentOverrideKurus = 0;
  }

  const scenarioPlan = buildScenarioPlan(scenarioProfile, scenarioDebts, scenarioExpenses, options);
  const warnings = buildScenarioWarnings({
    input,
    baselinePlan,
    scenarioPlan,
    profile: scenarioProfile,
    debts: scenarioDebts,
  });
  const scenarioRiskLevel = getAdjustedScenarioRisk(scenarioPlan, scenarioProfile, warnings);
  const delta = comparePlans({
    baselinePlan,
    scenarioPlan,
    baselineDebts,
    scenarioDebts,
    scenarioRiskLevel,
  });

  return {
    input,
    title: scenarioTitles[input.type],
    baselinePlan,
    scenarioPlan,
    activeDebts: snapshot.debts
      .filter((debt) => debt.status === "active" && debt.balanceKurus > 0)
      .map((debt) => ({ id: debt.id, name: debt.name, status: debt.status })),
    delta,
    warnings,
    coachComment: buildCoachComment(delta, warnings),
  };
}
