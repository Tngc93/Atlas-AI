import type { FinanceSnapshot } from "@/features/finance/data-service";
import { formatTry } from "@/features/finance/money";
import type { DebtAccount, MandatoryExpense, MonthlyFinancePlanOptions, Profile, UiRiskLevel } from "@/features/finance/types";
import { buildForecastReport } from "./service";
import type {
  ForecastReport,
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
  };
}
