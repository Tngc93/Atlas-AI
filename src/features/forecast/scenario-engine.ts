import type { FinanceSnapshot } from "@/features/finance/data-service";
import { formatTry } from "@/features/finance/money";
import type { DebtAccount, MandatoryExpense, MonthlyFinancePlanOptions, Profile, UiRiskLevel } from "@/features/finance/types";
import { buildForecastReport } from "./service";
import type {
  ForecastReport,
  ForecastScenarioComparison,
  ForecastScenarioComparisonItem,
  ForecastScenarioDelta,
  ForecastScenarioExplanation,
  ForecastScenarioInput,
  ForecastScenarioResult,
  ForecastScenarioWarning,
} from "./types";

const scenarioTitles: Record<ForecastScenarioInput["type"], string> = {
  salary_increase: "Maaş artışı",
  salary_decrease: "Maaş azalması",
  expense_decrease: "Gider azalması",
  expense_increase: "Gider artışı",
  extra_debt_payment: "Ek borç ödemesi",
  new_debt: "Yeni borç",
};

function cloneSnapshot(snapshot: FinanceSnapshot): FinanceSnapshot {
  return {
    hasProfile: snapshot.hasProfile,
    profile: { ...snapshot.profile },
    debts: snapshot.debts.map((debt) => ({ ...debt })),
    expenses: snapshot.expenses.map((expense) => ({ ...expense })),
  };
}

function averageLivingBudget(report: ForecastReport): number {
  if (report.monthlyTrend.length === 0) {
    return 0;
  }

  return Math.round(
    report.monthlyTrend.reduce((total, month) => total + month.livingBudgetKurus, 0) / report.monthlyTrend.length,
  );
}

function averageExtraDebtPayment(report: ForecastReport): number {
  if (report.monthlyTrend.length === 0) {
    return 0;
  }

  return Math.round(
    report.monthlyTrend.reduce((total, month) => total + month.extraDebtPaymentKurus, 0) / report.monthlyTrend.length,
  );
}

function payoffIndex(report: ForecastReport): number | null {
  const index = report.monthlyTrend.findIndex((month) => month.remainingDebtKurus === 0);

  return index >= 0 ? index : null;
}

function payoffMonthDelta(baselineReport: ForecastReport, scenarioReport: ForecastReport): number | null {
  const baselineIndex = payoffIndex(baselineReport);
  const scenarioIndex = payoffIndex(scenarioReport);

  if (baselineIndex === null || scenarioIndex === null) {
    return null;
  }

  return baselineIndex - scenarioIndex;
}

function compareReports(baselineReport: ForecastReport, scenarioReport: ForecastReport): ForecastScenarioDelta {
  return {
    finalRemainingDebtDeltaKurus: scenarioReport.finalRemainingDebtKurus - baselineReport.finalRemainingDebtKurus,
    totalInterestDeltaKurus: scenarioReport.totalEstimatedInterestKurus - baselineReport.totalEstimatedInterestKurus,
    averageLivingBudgetDeltaKurus: averageLivingBudget(scenarioReport) - averageLivingBudget(baselineReport),
    payoffMonthDelta: payoffMonthDelta(baselineReport, scenarioReport),
    baselineRiskLevel: baselineReport.highestRiskLevel,
    scenarioRiskLevel: scenarioReport.highestRiskLevel,
    riskWarningCountDelta: scenarioReport.riskWarnings.length - baselineReport.riskWarnings.length,
  };
}

function increaseExpenses(expenses: MandatoryExpense[], percent: number): MandatoryExpense[] {
  const multiplier = 1 + percent / 100;

  return expenses.map((expense) => ({ ...expense, amountKurus: Math.round(expense.amountKurus * multiplier) }));
}

function decreaseExpenses(expenses: MandatoryExpense[], percent: number): MandatoryExpense[] {
  const multiplier = Math.max(0, 1 - percent / 100);

  return expenses.map((expense) => ({ ...expense, amountKurus: Math.round(expense.amountKurus * multiplier) }));
}

function addTemporaryDebt(debts: DebtAccount[], input: ForecastScenarioInput): DebtAccount[] {
  const amountKurus = input.amountKurus ?? 0;

  return [
    ...debts,
    {
      id: "forecast-temporary-scenario-debt",
      type: "other",
      name: "Geçici senaryo borcu",
      lender: "Geçici senaryo",
      balanceKurus: amountKurus,
      interestRateMonthly: input.interestRateMonthly ?? 0,
      minimumPaymentKurus: input.minimumPaymentKurus ?? 0,
      dueDay: 15,
      status: "active",
    },
  ];
}

function applyScenario(snapshot: FinanceSnapshot, input: ForecastScenarioInput): FinanceSnapshot {
  const scenarioSnapshot = cloneSnapshot(snapshot);

  if (input.type === "salary_increase" && input.amountKurus) {
    scenarioSnapshot.profile = {
      ...scenarioSnapshot.profile,
      monthlySalaryKurus: scenarioSnapshot.profile.monthlySalaryKurus + input.amountKurus,
    };
  }

  if (input.type === "salary_decrease" && input.amountKurus) {
    scenarioSnapshot.profile = {
      ...scenarioSnapshot.profile,
      monthlySalaryKurus: Math.max(0, scenarioSnapshot.profile.monthlySalaryKurus - input.amountKurus),
    };
  }

  if (input.type === "expense_decrease" && typeof input.percent === "number") {
    scenarioSnapshot.expenses = decreaseExpenses(scenarioSnapshot.expenses, input.percent);
  }

  if (input.type === "expense_increase" && typeof input.percent === "number") {
    scenarioSnapshot.expenses = increaseExpenses(scenarioSnapshot.expenses, input.percent);
  }

  if (input.type === "new_debt") {
    scenarioSnapshot.debts = addTemporaryDebt(scenarioSnapshot.debts, input);
  }

  return scenarioSnapshot;
}

function riskRank(riskLevel: UiRiskLevel): number {
  return { low: 1, medium: 2, high: 3 }[riskLevel];
}

function absoluteTry(value: number): string {
  return formatTry(Math.abs(value));
}

function addComparisonItem(items: ForecastScenarioComparisonItem[], item: ForecastScenarioComparisonItem) {
  items.push(item);
}

function buildRiskImpact(delta: ForecastScenarioDelta): string {
  const baselineRank = riskRank(delta.baselineRiskLevel);
  const scenarioRank = riskRank(delta.scenarioRiskLevel);

  if (scenarioRank > baselineRank) {
    return "Risk seviyesi bu senaryoda yükselebilir; bu sonuç daha dikkatli okunmalıdır.";
  }

  if (scenarioRank < baselineRank) {
    return "Risk seviyesi bu senaryoda düşebilir; nakit akışı daha dayanıklı görünebilir.";
  }

  if (delta.riskWarningCountDelta > 0) {
    return "Risk seviyesi aynı kalsa da riskli ay sayısı artabilir.";
  }

  if (delta.riskWarningCountDelta < 0) {
    return "Risk seviyesi aynı kalsa da riskli ay sayısı azalabilir.";
  }

  return "Risk seviyesi bu senaryoda belirgin şekilde değişmiyor.";
}

function buildPaymentCapacityImpact(paymentCapacityDeltaKurus: number): string {
  if (paymentCapacityDeltaKurus > 0) {
    return `Tahmin boyunca ortalama ek ödeme alanı ${absoluteTry(paymentCapacityDeltaKurus)} genişleyebilir.`;
  }

  if (paymentCapacityDeltaKurus < 0) {
    return `Tahmin boyunca ortalama ek ödeme alanı ${absoluteTry(paymentCapacityDeltaKurus)} daralabilir.`;
  }

  return "Tahmin boyunca ortalama ek ödeme alanı belirgin şekilde değişmiyor.";
}

function buildComparisonSummary(args: {
  improvements: ForecastScenarioComparisonItem[];
  worsenings: ForecastScenarioComparisonItem[];
  tradeOffs: ForecastScenarioComparisonItem[];
}): string {
  if (args.improvements.length > 0 && args.worsenings.length > 0) {
    return "Bu senaryo bazı alanları rahatlatırken bazı alanlarda dikkat gerektiren bir karşılık oluşturabilir.";
  }

  if (args.improvements.length > 0) {
    return "Bu senaryo mevcut tahmine göre bazı alanlarda rahatlama işaret ediyor; yine de sonuç geçici varsayımdır.";
  }

  if (args.worsenings.length > 0) {
    return "Bu senaryo mevcut tahmine göre bazı alanlarda baskıyı artırabilir; sonuç karar değil, karşılaştırma bilgisidir.";
  }

  if (args.tradeOffs.length > 0) {
    return "Bu senaryo belirgin bir trade-off gösteriyor; mevcut veri değişmeden yalnızca olası etkiyi görünür kılar.";
  }

  return "Bu senaryo mevcut tahmine göre belirgin bir fark üretmiyor.";
}

function buildScenarioComparison(args: {
  input: ForecastScenarioInput;
  baselineReport: ForecastReport;
  scenarioReport: ForecastReport;
  delta: ForecastScenarioDelta;
}): ForecastScenarioComparison {
  const improvements: ForecastScenarioComparisonItem[] = [];
  const worsenings: ForecastScenarioComparisonItem[] = [];
  const tradeOffs: ForecastScenarioComparisonItem[] = [];
  const paymentCapacityDeltaKurus = averageExtraDebtPayment(args.scenarioReport) - averageExtraDebtPayment(args.baselineReport);

  if (args.delta.finalRemainingDebtDeltaKurus < 0) {
    addComparisonItem(improvements, {
      id: "remaining-debt-lower",
      title: "Kalan borç baskısı azalabilir",
      description: `24 ay sonu kalan borç mevcut tahmine göre ${absoluteTry(args.delta.finalRemainingDebtDeltaKurus)} daha düşük görünüyor.`,
      tone: "positive",
    });
  }

  if (args.delta.finalRemainingDebtDeltaKurus > 0) {
    addComparisonItem(worsenings, {
      id: "remaining-debt-higher",
      title: "Kalan borç baskısı artabilir",
      description: `24 ay sonu kalan borç mevcut tahmine göre ${absoluteTry(args.delta.finalRemainingDebtDeltaKurus)} daha yüksek görünüyor.`,
      tone: "negative",
    });
  }

  if (args.delta.totalInterestDeltaKurus < 0) {
    addComparisonItem(improvements, {
      id: "interest-lower",
      title: "Faiz etkisi azalabilir",
      description: `Tahmini toplam faiz etkisi ${absoluteTry(args.delta.totalInterestDeltaKurus)} daha düşük görünüyor.`,
      tone: "positive",
    });
  }

  if (args.delta.totalInterestDeltaKurus > 0) {
    addComparisonItem(worsenings, {
      id: "interest-higher",
      title: "Faiz etkisi artabilir",
      description: `Tahmini toplam faiz etkisi ${absoluteTry(args.delta.totalInterestDeltaKurus)} daha yüksek görünüyor.`,
      tone: "negative",
    });
  }

  if (args.delta.averageLivingBudgetDeltaKurus > 0) {
    addComparisonItem(improvements, {
      id: "living-budget-wider",
      title: "Yaşam bütçesi rahatlayabilir",
      description: `Ortalama yaşam bütçesi ${absoluteTry(args.delta.averageLivingBudgetDeltaKurus)} genişleyebilir.`,
      tone: "positive",
    });
  }

  if (args.delta.averageLivingBudgetDeltaKurus < 0) {
    addComparisonItem(worsenings, {
      id: "living-budget-tighter",
      title: "Yaşam bütçesi daralabilir",
      description: `Ortalama yaşam bütçesi ${absoluteTry(args.delta.averageLivingBudgetDeltaKurus)} daralabilir.`,
      tone: "negative",
    });
  }

  if (args.delta.payoffMonthDelta !== null && args.delta.payoffMonthDelta > 0) {
    addComparisonItem(improvements, {
      id: "payoff-earlier",
      title: "Kapanış tahmini öne gelebilir",
      description: `Tahmini borç kapanışı ${args.delta.payoffMonthDelta} ay öne gelebilir.`,
      tone: "positive",
    });
  }

  if (args.delta.payoffMonthDelta !== null && args.delta.payoffMonthDelta < 0) {
    addComparisonItem(worsenings, {
      id: "payoff-later",
      title: "Kapanış tahmini gecikebilir",
      description: `Tahmini borç kapanışı ${Math.abs(args.delta.payoffMonthDelta)} ay gecikebilir.`,
      tone: "negative",
    });
  }

  if (riskRank(args.delta.scenarioRiskLevel) < riskRank(args.delta.baselineRiskLevel) || args.delta.riskWarningCountDelta < 0) {
    addComparisonItem(improvements, {
      id: "risk-pressure-lower",
      title: "Risk baskısı azalabilir",
      description: "Risk seviyesi veya riskli ay sayısı mevcut tahmine göre daha düşük görünebilir.",
      tone: "positive",
    });
  }

  if (riskRank(args.delta.scenarioRiskLevel) > riskRank(args.delta.baselineRiskLevel) || args.delta.riskWarningCountDelta > 0) {
    addComparisonItem(worsenings, {
      id: "risk-pressure-higher",
      title: "Risk baskısı artabilir",
      description: "Risk seviyesi veya riskli ay sayısı mevcut tahmine göre daha yüksek görünebilir.",
      tone: "negative",
    });
  }

  if (paymentCapacityDeltaKurus > 0) {
    addComparisonItem(improvements, {
      id: "payment-capacity-wider",
      title: "Ek ödeme alanı genişleyebilir",
      description: buildPaymentCapacityImpact(paymentCapacityDeltaKurus),
      tone: "positive",
    });
  }

  if (paymentCapacityDeltaKurus < 0) {
    addComparisonItem(worsenings, {
      id: "payment-capacity-tighter",
      title: "Ek ödeme alanı daralabilir",
      description: buildPaymentCapacityImpact(paymentCapacityDeltaKurus),
      tone: "negative",
    });
  }

  if (args.delta.finalRemainingDebtDeltaKurus < 0 && args.delta.averageLivingBudgetDeltaKurus < 0) {
    addComparisonItem(tradeOffs, {
      id: "debt-down-budget-tight",
      title: "Borç baskısı azalırken yaşam bütçesi daralabilir",
      description: "Bu senaryo borcu azaltmayı desteklerken ay içi hareket alanını daha sıkı hale getirebilir.",
      tone: "watch",
    });
  }

  if (args.delta.averageLivingBudgetDeltaKurus > 0 && args.delta.finalRemainingDebtDeltaKurus > 0) {
    addComparisonItem(tradeOffs, {
      id: "budget-wide-debt-up",
      title: "Yaşam bütçesi rahatlayırken borç baskısı artabilir",
      description: "Bu senaryo ay içi rahatlama sağlasa da 24 ay sonu borç baskısını artırabilir.",
      tone: "watch",
    });
  }

  if (args.delta.totalInterestDeltaKurus < 0 && riskRank(args.delta.scenarioRiskLevel) > riskRank(args.delta.baselineRiskLevel)) {
    addComparisonItem(tradeOffs, {
      id: "interest-down-risk-up",
      title: "Faiz etkisi azalırken risk artabilir",
      description: "Uzun vadeli faiz etkisi azalabilir; buna karşılık tahmin penceresinde risk baskısı yükselebilir.",
      tone: "watch",
    });
  }

  if (args.input.type === "new_debt") {
    addComparisonItem(tradeOffs, {
      id: "temporary-new-debt",
      title: "Yeni borç tahmini yük ekleyebilir",
      description: "Bu geçici borç senaryosu mevcut kayıtları değiştirmez; yalnızca ek yükün tahmine etkisini gösterir.",
      tone: "watch",
    });
  }

  if (args.delta.payoffMonthDelta === null) {
    addComparisonItem(tradeOffs, {
      id: "payoff-outside-horizon",
      title: "Kapanış farkı netleşmiyor",
      description: "Kapanış farkı 24 aylık pencere içinde netleşmediği için kesin tarih gibi okunmamalıdır.",
      tone: "neutral",
    });
  }

  return {
    summary: buildComparisonSummary({ improvements, worsenings, tradeOffs }),
    improvements,
    worsenings,
    tradeOffs,
    riskImpact: buildRiskImpact(args.delta),
    paymentCapacityImpact: buildPaymentCapacityImpact(paymentCapacityDeltaKurus),
  };
}

function buildWarnings(args: {
  input: ForecastScenarioInput;
  snapshot: FinanceSnapshot;
  scenarioProfile: Profile;
  scenarioReport: ForecastReport;
}): ForecastScenarioWarning[] {
  const warnings: ForecastScenarioWarning[] = [];

  if (args.scenarioProfile.monthlySalaryKurus === 0) {
    warnings.push({
      id: "salary-zero",
      severity: "high",
      message: "Bu senaryo maaşı sıfıra indiriyor; sonuç yalnızca stres testi olarak değerlendirilmelidir.",
    });
  }

  if (args.scenarioReport.highestRiskLevel === "high") {
    warnings.push({
      id: "high-risk-scenario",
      severity: "high",
      message: "Bu senaryoda tahmin penceresinde yüksek riskli aylar görünüyor.",
    });
  }

  if (args.input.type === "new_debt" && (args.input.interestRateMonthly ?? 0) === 0) {
    warnings.push({
      id: "new-debt-missing-rate",
      severity: "medium",
      message: "Yeni borç senaryosunda faiz girilmediği için %0 varsayıldı; bu gerçek kredi maliyeti gibi görülmemelidir.",
    });
  }

  if (args.input.type === "extra_debt_payment" && args.snapshot.debts.filter((debt) => debt.status === "active" && debt.balanceKurus > 0).length === 0) {
    warnings.push({
      id: "no-active-debt",
      severity: "high",
      message: "Ek ödeme senaryosu için aktif borç bulunmuyor.",
    });
  }

  return warnings;
}

function payoffDeltaText(value: number | null): string {
  if (value === null) {
    return "Kapanış farkı 24 aylık pencere içinde netleşmiyor.";
  }

  if (value > 0) {
    return `Kapanış tahmini ${value} ay öne gelebilir.`;
  }

  if (value < 0) {
    return `Kapanış tahmini ${Math.abs(value)} ay gecikebilir.`;
  }

  return "Kapanış ayı değişmiyor.";
}

function buildExplanation(delta: ForecastScenarioDelta, warnings: ForecastScenarioWarning[]): ForecastScenarioExplanation {
  const debtText =
    delta.finalRemainingDebtDeltaKurus < 0
      ? "24 ay sonu kalan borç mevcut tahmine göre azalıyor."
      : delta.finalRemainingDebtDeltaKurus > 0
        ? "24 ay sonu kalan borç mevcut tahmine göre artıyor."
        : "24 ay sonu kalan borç değişmiyor.";
  const riskText =
    riskRank(delta.scenarioRiskLevel) > riskRank(delta.baselineRiskLevel)
      ? "Risk seviyesi yükseliyor; bu senaryo daha dikkatli okunmalı."
      : riskRank(delta.scenarioRiskLevel) < riskRank(delta.baselineRiskLevel)
        ? "Risk seviyesi düşüyor; nakit akışı daha dayanıklı görünüyor."
        : "Risk seviyesi değişmiyor.";
  const warningText = warnings.length > 0 ? ` İlk uyarı: ${warnings[0].message}` : "";

  return {
    summary: `${debtText} ${riskText}`,
    why: `${payoffDeltaText(delta.payoffMonthDelta)} Ortalama yaşam bütçesi farkı ${formatTry(
      delta.averageLivingBudgetDeltaKurus,
    )}; toplam faiz farkı ${formatTry(delta.totalInterestDeltaKurus)}. Bu sonuç geçici senaryodur ve mevcut veriyi değiştirmez.${warningText}`,
  };
}

export function simulateForecastScenario(
  snapshot: FinanceSnapshot,
  input: ForecastScenarioInput,
  asOfDate = new Date(),
): ForecastScenarioResult {
  const baselineReport = buildForecastReport(snapshot, asOfDate);
  const scenarioSnapshot = applyScenario(snapshot, input);
  const scenarioOptions: Pick<MonthlyFinancePlanOptions, "extraDebtPaymentOverrideKurus"> =
    input.type === "extra_debt_payment" ? { extraDebtPaymentOverrideKurus: input.amountKurus ?? 0 } : {};
  const scenarioReport = buildForecastReport(scenarioSnapshot, asOfDate, scenarioOptions);
  const delta = compareReports(baselineReport, scenarioReport);
  const warnings = buildWarnings({
    input,
    snapshot,
    scenarioProfile: scenarioSnapshot.profile,
    scenarioReport,
  });

  return {
    input,
    title: scenarioTitles[input.type],
    baselineReport,
    scenarioReport,
    delta,
    warnings,
    explanation: buildExplanation(delta, warnings),
    comparison: buildScenarioComparison({ input, baselineReport, scenarioReport, delta }),
  };
}
