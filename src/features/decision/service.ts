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
  DecisionExplanationContext,
  DecisionFrame,
  DecisionHorizonLens,
  DecisionScenarioDelta,
  DecisionScenarioInput,
  DecisionScenarioResult,
  DecisionScenarioWarning,
  DecisionTradeoffItem,
  DecisionTradeoffSummary,
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

function riskLabel(riskLevel: UiRiskLevel): string {
  return { low: "Düşük", medium: "Orta", high: "Yüksek" }[riskLevel];
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

function buildDecisionFrame(args: {
  input: DecisionScenarioInput;
  baselinePlan: MonthlyFinancePlan;
  scenarioPlan: MonthlyFinancePlan;
  delta: DecisionScenarioDelta;
  warnings: DecisionScenarioWarning[];
}): DecisionFrame {
  const hasHighRisk = args.delta.scenarioRiskLevel === "high" || args.warnings.some((warning) => warning.severity === "high");
  const livingBudgetTight = args.scenarioPlan.livingBudget.remainingForMonthKurus < args.baselinePlan.cashFlow.emergencyBufferKurus;
  const currentReality =
    args.baselinePlan.cashFlow.minimumPaymentsCovered && args.baselinePlan.livingBudget.remainingForMonthKurus >= 0
      ? "Mevcut planda zorunlu ödemeler karşılanıyor; karar alanı yaşam bütçesi ve borç hızında oluşuyor."
      : "Mevcut planda önce zorunlu ödemeler ve yaşam bütçesi baskısı anlaşılmalı.";
  const protectedConstraint =
    args.scenarioPlan.livingBudget.remainingForMonthKurus < 0
      ? "Bu senaryoda ay sonu yaşam bütçesi negatif görünüyor."
      : livingBudgetTight
        ? "Bu senaryoda yaşam bütçesi koruma alanı daralıyor."
        : "Yaşam bütçesi kararın ana güvenlik sınırı olarak korunuyor.";
  const openOption =
    args.input.type === "no_extra_payment"
      ? "Açık seçenek, bu ay yalnızca minimum ödemelerle ilerlemeyi incelemek."
      : "Açık seçenek, bu senaryonun borç hızı ve nakit alanı üzerindeki etkisini incelemek.";
  const riskToReview =
    args.delta.scenarioRiskLevel === args.delta.baselineRiskLevel
      ? `Risk seviyesi ${riskLabel(args.delta.scenarioRiskLevel)} çizgisinde kalıyor.`
      : `Risk seviyesi ${riskLabel(args.delta.baselineRiskLevel)} → ${riskLabel(args.delta.scenarioRiskLevel)} olarak değişiyor.`;
  const deferral = hasHighRisk
    ? "Erteleme geçerli bir sonuçtur; risk yüksekken daha fazla kanıt toplamak veya tutarı küçültmek düşünülebilir."
    : "Erteleme hâlâ geçerli bir sonuçtur; bu ekran karar baskısı değil karşılaştırma sağlar.";

  return {
    currentReality,
    protectedConstraint,
    openOption,
    riskToReview,
    deferral,
    sequence: [
      { label: "Gerçeklik", value: currentReality },
      { label: "Kısıt", value: protectedConstraint },
      { label: "Seçenek", value: openOption },
      { label: "Risk", value: riskToReview },
      { label: "Kullanıcı kararı", value: deferral },
    ],
  };
}

function absoluteTry(value: number): string {
  return formatTry(Math.abs(value));
}

function addTradeoffItem(items: DecisionTradeoffItem[], item: DecisionTradeoffItem) {
  items.push(item);
}

function buildRiskImpact(delta: DecisionScenarioDelta): string {
  if (riskRank(delta.scenarioRiskLevel) > riskRank(delta.baselineRiskLevel)) {
    return "Risk seviyesi bu senaryoda yükselebilir; sonuç daha dikkatli okunmalıdır.";
  }

  if (riskRank(delta.scenarioRiskLevel) < riskRank(delta.baselineRiskLevel)) {
    return "Risk seviyesi bu senaryoda düşebilir; yine de karar kullanıcının değerlendirmesine kalır.";
  }

  return "Risk seviyesi bu senaryoda belirgin şekilde değişmiyor.";
}

function buildLivingBudgetImpact(delta: DecisionScenarioDelta): string {
  if (delta.livingBudgetDeltaKurus > 0) {
    return `Yaşam bütçesi ${absoluteTry(delta.livingBudgetDeltaKurus)} genişleyebilir.`;
  }

  if (delta.livingBudgetDeltaKurus < 0) {
    return `Yaşam bütçesi ${absoluteTry(delta.livingBudgetDeltaKurus)} daralabilir.`;
  }

  return "Yaşam bütçesi belirgin şekilde değişmiyor.";
}

function buildTradeoffSummary(delta: DecisionScenarioDelta, warnings: DecisionScenarioWarning[]): DecisionTradeoffSummary {
  const improvements: DecisionTradeoffItem[] = [];
  const worsenings: DecisionTradeoffItem[] = [];
  const tradeOffs: DecisionTradeoffItem[] = [];

  if (delta.firstMonthRemainingDebtDeltaKurus < 0) {
    addTradeoffItem(improvements, {
      id: "first-month-debt-lower",
      title: "Bu ay borç baskısı azalabilir",
      description: `İlk ay kalan borç mevcut plana göre ${absoluteTry(delta.firstMonthRemainingDebtDeltaKurus)} daha düşük görünüyor.`,
      tone: "positive",
    });
  }

  if (delta.firstMonthRemainingDebtDeltaKurus > 0) {
    addTradeoffItem(worsenings, {
      id: "first-month-debt-higher",
      title: "Bu ay borç baskısı artabilir",
      description: `İlk ay kalan borç mevcut plana göre ${absoluteTry(delta.firstMonthRemainingDebtDeltaKurus)} daha yüksek görünüyor.`,
      tone: "negative",
    });
  }

  if (delta.horizonRemainingDebtDeltaKurus < 0) {
    addTradeoffItem(improvements, {
      id: "horizon-debt-lower",
      title: "24 ay sonunda borç daha düşük olabilir",
      description: `24 ay sonu kalan borç ${absoluteTry(delta.horizonRemainingDebtDeltaKurus)} daha düşük görünüyor.`,
      tone: "positive",
    });
  }

  if (delta.horizonRemainingDebtDeltaKurus > 0) {
    addTradeoffItem(worsenings, {
      id: "horizon-debt-higher",
      title: "24 ay sonunda borç daha yüksek olabilir",
      description: `24 ay sonu kalan borç ${absoluteTry(delta.horizonRemainingDebtDeltaKurus)} daha yüksek görünüyor.`,
      tone: "negative",
    });
  }

  if (delta.livingBudgetDeltaKurus > 0) {
    addTradeoffItem(improvements, {
      id: "living-budget-wider",
      title: "Yaşam bütçesi rahatlayabilir",
      description: buildLivingBudgetImpact(delta),
      tone: "positive",
    });
  }

  if (delta.livingBudgetDeltaKurus < 0) {
    addTradeoffItem(worsenings, {
      id: "living-budget-tighter",
      title: "Yaşam bütçesi daralabilir",
      description: buildLivingBudgetImpact(delta),
      tone: "negative",
    });
  }

  if (riskRank(delta.scenarioRiskLevel) < riskRank(delta.baselineRiskLevel)) {
    addTradeoffItem(improvements, {
      id: "risk-lower",
      title: "Risk baskısı azalabilir",
      description: buildRiskImpact(delta),
      tone: "positive",
    });
  }

  if (riskRank(delta.scenarioRiskLevel) > riskRank(delta.baselineRiskLevel)) {
    addTradeoffItem(worsenings, {
      id: "risk-higher",
      title: "Risk baskısı artabilir",
      description: buildRiskImpact(delta),
      tone: "negative",
    });
  }

  if (delta.firstMonthRemainingDebtDeltaKurus < 0 && delta.livingBudgetDeltaKurus < 0) {
    addTradeoffItem(tradeOffs, {
      id: "debt-down-budget-tight",
      title: "Borç azalırken yaşam bütçesi daralabilir",
      description: "Bu senaryo borç hızını desteklerken ay içi nakit alanını daha sıkı hale getirebilir.",
      tone: "watch",
    });
  }

  if (delta.firstMonthRemainingDebtDeltaKurus > 0 && delta.livingBudgetDeltaKurus > 0) {
    addTradeoffItem(tradeOffs, {
      id: "budget-wide-debt-up",
      title: "Yaşam bütçesi rahatlayırken borç yavaşlayabilir",
      description: "Bu senaryo ay içi hareket alanını artırırken borç kapatma hızını azaltabilir.",
      tone: "watch",
    });
  }

  if (delta.payoffMonthDelta === null) {
    addTradeoffItem(tradeOffs, {
      id: "payoff-outside-horizon",
      title: "Kapanış farkı netleşmiyor",
      description: "Kapanış farkı 24 aylık pencerede netleşmediği için kesin tarih gibi okunmamalıdır.",
      tone: "neutral",
    });
  }

  if (warnings.length > 0) {
    addTradeoffItem(tradeOffs, {
      id: "warnings-present",
      title: "Uyarılar kararın parçası olarak okunmalı",
      description: warnings[0].message,
      tone: warnings[0].severity === "high" ? "negative" : "watch",
    });
  }

  const summary =
    improvements.length > 0 && worsenings.length > 0
      ? "Bu senaryo bazı alanları rahatlatırken bazı alanlarda dikkat gerektiren bir karşılık oluşturabilir."
      : improvements.length > 0
        ? "Bu senaryo mevcut plana göre bazı alanlarda rahatlama işaret ediyor; yine de karar değildir."
        : worsenings.length > 0
          ? "Bu senaryo mevcut plana göre bazı alanlarda baskıyı artırabilir; sonuç yalnızca karar desteğidir."
          : "Bu senaryo mevcut plana göre belirgin bir fark üretmiyor.";

  return {
    summary,
    improvements,
    worsenings,
    tradeOffs,
    riskImpact: buildRiskImpact(delta),
    livingBudgetImpact: buildLivingBudgetImpact(delta),
    decisionNote: "Bu özet karar vermez; son karar sizindir.",
  };
}

function payoffImpactText(delta: DecisionScenarioDelta): string {
  if (delta.payoffMonthDelta === null) {
    return "Kapanış süresi farkı 24 aylık pencerede netleşmiyor.";
  }

  if (delta.payoffMonthDelta > 0) {
    return `Tahmini kapanış ${delta.payoffMonthDelta} ay öne gelebilir.`;
  }

  if (delta.payoffMonthDelta < 0) {
    return `Tahmini kapanış ${Math.abs(delta.payoffMonthDelta)} ay gecikebilir.`;
  }

  return "Tahmini kapanış süresi değişmiyor.";
}

function buildHorizonLens(delta: DecisionScenarioDelta): DecisionHorizonLens {
  return {
    currentMonthImpact:
      delta.firstMonthRemainingDebtDeltaKurus === 0
        ? "Bu ay kalan borç üzerinde belirgin fark görünmüyor."
        : `Bu ay kalan borç farkı ${formatTry(delta.firstMonthRemainingDebtDeltaKurus)} görünüyor.`,
    horizonImpact:
      delta.horizonRemainingDebtDeltaKurus === 0
        ? "24 ay sonunda kalan borç üzerinde belirgin fark görünmüyor."
        : `24 ay sonu kalan borç farkı ${formatTry(delta.horizonRemainingDebtDeltaKurus)} görünüyor.`,
    payoffImpact: payoffImpactText(delta),
    spendingLimitImpact:
      delta.dailyLimitDeltaKurus === 0 && delta.weeklyLimitDeltaKurus === 0
        ? "Günlük ve haftalık limitlerde belirgin fark görünmüyor."
        : `Günlük limit farkı ${formatTry(delta.dailyLimitDeltaKurus)}, haftalık limit farkı ${formatTry(delta.weeklyLimitDeltaKurus)}.`,
  };
}

function directionFromDelta(value: number): "lower" | "higher" | "same" {
  if (value < 0) {
    return "lower";
  }

  if (value > 0) {
    return "higher";
  }

  return "same";
}

function budgetDirectionFromDelta(value: number): "wider" | "tighter" | "same" {
  if (value > 0) {
    return "wider";
  }

  if (value < 0) {
    return "tighter";
  }

  return "same";
}

function riskDirectionFromDelta(delta: DecisionScenarioDelta): "lower" | "higher" | "same" {
  if (riskRank(delta.scenarioRiskLevel) < riskRank(delta.baselineRiskLevel)) {
    return "lower";
  }

  if (riskRank(delta.scenarioRiskLevel) > riskRank(delta.baselineRiskLevel)) {
    return "higher";
  }

  return "same";
}

function buildExplanationContext(args: {
  input: DecisionScenarioInput;
  delta: DecisionScenarioDelta;
  warnings: DecisionScenarioWarning[];
  tradeoffSummary: DecisionTradeoffSummary;
}): DecisionExplanationContext {
  return {
    version: "decision-explanation-context-v1",
    scenarioType: args.input.type,
    riskDirection: riskDirectionFromDelta(args.delta),
    livingBudgetDirection: budgetDirectionFromDelta(args.delta.livingBudgetDeltaKurus),
    debtDirection: directionFromDelta(args.delta.firstMonthRemainingDebtDeltaKurus),
    hasWarnings: args.warnings.length > 0,
    tradeoffCount: args.tradeoffSummary.tradeOffs.length,
    userDecisionBoundary: "AI veya sistem karar vermez; deterministik çıktılar yalnızca açıklama ve değerlendirme desteğidir.",
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
  const frame = buildDecisionFrame({ input, baselinePlan, scenarioPlan, delta, warnings });
  const tradeoffSummary = buildTradeoffSummary(delta, warnings);
  const horizonLens = buildHorizonLens(delta);
  const explanationContext = buildExplanationContext({ input, delta, warnings, tradeoffSummary });

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
    frame,
    tradeoffSummary,
    horizonLens,
    explanationContext,
    coachComment: buildCoachComment(delta, warnings),
  };
}
