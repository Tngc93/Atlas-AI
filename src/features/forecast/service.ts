import { buildMonthlyFinancePlan } from "@/features/finance/calculations";
import type { FinanceSnapshot } from "@/features/finance/data-service";
import { formatTry } from "@/features/finance/money";
import type { MonthlyFinancePlanOptions, PaymentPlanMonth, RiskLevel, UiRiskLevel } from "@/features/finance/types";
import type {
  ForecastAssumption,
  ForecastCheckpoint,
  ForecastCoachSummary,
  ForecastDebtPayoffMilestone,
  ForecastDecisionPrompt,
  ForecastEvidenceItem,
  ForecastHorizon,
  ForecastMonthlyTrend,
  ForecastNarrativeContext,
  ForecastReport,
  ForecastRiskWarning,
} from "./types";

const FORECAST_HORIZONS: ForecastHorizon[] = [3, 6, 12, 24];
const FORECAST_HORIZON_MONTHS = 24;

function visibleRiskLevel(riskLevel: RiskLevel): UiRiskLevel {
  return riskLevel === "critical" ? "high" : riskLevel;
}

function riskRank(riskLevel: UiRiskLevel): number {
  return { low: 1, medium: 2, high: 3 }[riskLevel];
}

function maxRiskLevel(levels: UiRiskLevel[]): UiRiskLevel {
  return levels.reduce<UiRiskLevel>((highest, current) => (riskRank(current) > riskRank(highest) ? current : highest), "low");
}

function getRemainingDebt(month: PaymentPlanMonth | undefined): number {
  if (!month) {
    return 0;
  }

  return month.totalRemainingDebtKurus ?? month.debtProjections.reduce((total, debt) => total + debt.endingBalanceKurus, 0);
}

function getInterest(month: PaymentPlanMonth): number {
  return month.totalInterestChargedKurus ?? month.debtProjections.reduce((total, debt) => total + debt.interestChargedKurus, 0);
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function buildMonthlyTrend(months: PaymentPlanMonth[]): ForecastMonthlyTrend[] {
  return months.map((month) => ({
    month: month.month,
    remainingDebtKurus: getRemainingDebt(month),
    interestKurus: getInterest(month),
    livingBudgetKurus: month.survivalBudgetKurus,
    riskLevel: month.riskLevel,
    extraDebtPaymentKurus: month.extraDebtPaymentKurus,
  }));
}

function buildPayoffMilestones(months: PaymentPlanMonth[]): ForecastDebtPayoffMilestone[] {
  const seenDebtIds = new Set<string>();
  const milestones: ForecastDebtPayoffMilestone[] = [];

  for (const month of months) {
    for (const debt of month.debtProjections) {
      if (debt.projectedPayoffMonth && !seenDebtIds.has(debt.debtAccountId)) {
        seenDebtIds.add(debt.debtAccountId);
        milestones.push({
          debtAccountId: debt.debtAccountId,
          debtName: debt.debtName,
          month: debt.projectedPayoffMonth,
        });
      }
    }
  }

  return milestones;
}

function buildRiskWarnings(months: PaymentPlanMonth[], survivalThresholdKurus: number): ForecastRiskWarning[] {
  return months
    .filter((month) => visibleRiskLevel(month.riskLevel) === "high" || month.survivalBudgetKurus < survivalThresholdKurus)
    .map((month, index) => {
      const severity = visibleRiskLevel(month.riskLevel) === "high" || month.survivalBudgetKurus < survivalThresholdKurus ? "high" : "medium";

      return {
        id: `forecast-risk-${index}-${month.month}`,
        month: month.month,
        severity,
        message: month.survivalBudgetKurus < 0 ? "Yaşam bütçesi negatife düşüyor." : "Yaşam bütçesi hedef eşiğin altında kalabilir.",
        reason:
          month.survivalBudgetKurus < 0
            ? "Zorunlu giderler ve minimum ödemeler sonrası ayı karşılayacak alan kalmıyor."
            : "Plan yaşam bütçesi eşiğini korumakta zorlanıyor.",
        reviewSuggestion:
          month.extraDebtPaymentKurus > 0
            ? "Ek ödeme kararını bu ay için yeniden simüle etmek faydalı olabilir."
            : "Önce zorunlu giderler ve minimum ödemelerin güvenli şekilde karşılanıp karşılanmadığını kontrol et.",
      };
    });
}

function buildCheckpoints(args: {
  months: PaymentPlanMonth[];
  horizons: ForecastHorizon[];
  milestones: ForecastDebtPayoffMilestone[];
  survivalThresholdKurus: number;
}): ForecastCheckpoint[] {
  return args.horizons.map((horizon) => {
    const periodMonths = args.months.slice(0, horizon);
    const checkpointMonth = periodMonths.at(-1) ?? args.months.at(-1);
    const paidOffDebtNames = args.milestones
      .filter((milestone) => periodMonths.some((month) => month.month === milestone.month))
      .map((milestone) => milestone.debtName);

    return {
      horizonMonths: horizon,
      label: `${horizon} aylık tahmin`,
      remainingDebtKurus: getRemainingDebt(checkpointMonth),
      periodInterestKurus: periodMonths.reduce((total, month) => total + getInterest(month), 0),
      averageLivingBudgetKurus: average(periodMonths.map((month) => month.survivalBudgetKurus)),
      highestRiskLevel: maxRiskLevel(periodMonths.map((month) => visibleRiskLevel(month.riskLevel))),
      cashSqueezeMonths: periodMonths
        .filter((month) => month.survivalBudgetKurus < args.survivalThresholdKurus || visibleRiskLevel(month.riskLevel) === "high")
        .map((month) => month.month),
      paidOffDebtNames,
    };
  });
}

function buildAssumptions(snapshot: FinanceSnapshot): ForecastAssumption[] {
  const activeDebtCount = snapshot.debts.filter((debt) => debt.status === "active" && debt.balanceKurus > 0).length;
  const fallbackRateCount = snapshot.debts.filter((debt) => debt.status === "active" && debt.interestRateSource?.includes("fallback")).length;
  const missingRateCount = snapshot.debts.filter((debt) => debt.status === "active" && debt.interestRateMonthly === 0).length;

  return [
    {
      id: "income-stability",
      label: "Gelir varsayımı",
      value: "Aylık maaş 24 ay boyunca aynı kabul edilir.",
    },
    {
      id: "expense-stability",
      label: "Gider varsayımı",
      value: "Zorunlu giderler sabit kabul edilir.",
    },
    {
      id: "strategy",
      label: "Borç stratejisi",
      value: "Minimum ödemeler korunur; ek ödeme avalanche yöntemiyle en yüksek faizli aktif borca gider.",
    },
    {
      id: "active-debts",
      label: "Aktif borçlar",
      value: `${activeDebtCount} aktif borç projeksiyona dahil edilir; pasif ve kapanmış borçlar dahil edilmez.`,
    },
    {
      id: "interest-source",
      label: "Faiz varsayımı",
      value:
        fallbackRateCount > 0 || missingRateCount > 0
          ? "Bazı borçlarda fallback veya eksik faiz bilgisi olabilir; gerçek banka oranı gibi değerlendirilmemelidir."
          : "Borç üzerindeki manuel veya çözümlenmiş aylık faiz oranları kullanılır.",
    },
  ];
}

function buildEvidenceItems(snapshot: FinanceSnapshot): ForecastEvidenceItem[] {
  const activeDebtCount = snapshot.debts.filter((debt) => debt.status === "active" && debt.balanceKurus > 0).length;
  const fallbackRateCount = snapshot.debts.filter((debt) => debt.status === "active" && debt.interestRateSource?.includes("fallback")).length;
  const missingRateCount = snapshot.debts.filter((debt) => debt.status === "active" && debt.interestRateMonthly === 0).length;

  return [
    {
      id: "current-plan",
      label: "Mevcut aylık plan",
      value: "Gelir, zorunlu giderler ve minimum ödemeler",
      detail: "Tahmin, kayıtlı güncel planın 24 ay boyunca aynı kurallarla devam ettiği varsayımıyla üretilir.",
    },
    {
      id: "active-debt-scope",
      label: "Aktif borç kapsamı",
      value: `${activeDebtCount} aktif borç`,
      detail: "Pasif ve kapanmış borçlar tahmine dahil edilmez.",
    },
    {
      id: "payment-strategy",
      label: "Ödeme stratejisi",
      value: "Minimum ödemeler önce, ek ödeme en yüksek faizli borca",
      detail: "Yaşam bütçesi korunamıyorsa ek borç ödemesi yapılmaz.",
    },
    {
      id: "interest-context",
      label: "Faiz bağlamı",
      value: fallbackRateCount > 0 || missingRateCount > 0 ? "Eksik veya fallback faiz sinyali var" : "Manuel veya çözümlenmiş faiz oranları",
      detail:
        fallbackRateCount > 0 || missingRateCount > 0
          ? "Fallback oranlar gerçek banka oranı gibi değerlendirilmemelidir; manuel oran girilirse önceliklidir."
          : "Tahmin, borç kayıtlarındaki mevcut faiz bilgisiyle hesaplanır.",
    },
  ];
}

function buildDecisionPrompts(args: {
  riskWarnings: ForecastRiskWarning[];
  payoffOutsideHorizon: boolean;
  highestRiskLevel: UiRiskLevel;
}): ForecastDecisionPrompt[] {
  const prompts: ForecastDecisionPrompt[] = [];

  if (args.riskWarnings.length > 0 || args.highestRiskLevel === "high") {
    prompts.push({
      id: "no-extra-payment",
      title: "Bu ay ekstra ödeme yapmazsam ne olur?",
      description: "Yaşam bütçesi baskısı varsa önce minimum ödemeleri ve temel giderleri koruyan senaryoyu kontrol et.",
      href: "/decisions",
    });
  }

  prompts.push({
    id: "extra-debt-payment",
    title: "Ekstra ödeme yaparsam kapanış süresi değişir mi?",
    description: "Ek ödeme kapasitesi varsa bunun kalan borç ve risk seviyesi üzerindeki etkisini simüle et.",
    href: "/decisions",
  });

  prompts.push({
    id: "reduce-expenses",
    title: "Giderleri azaltırsam yaşam bütçesi rahatlar mı?",
    description: "Zorunlu gider baskısı yüksekse küçük bir gider azaltma senaryosunun tahmini nasıl değiştirdiğini gör.",
    href: "/decisions",
  });

  if (args.payoffOutsideHorizon) {
    prompts.push({
      id: "salary-or-bonus",
      title: "Ek gelir tahmini değiştirebilir mi?",
      description: "Kapanış 24 ay dışında kalıyorsa maaş artışı veya tek seferlik gelir senaryosunu karşılaştır.",
      href: "/decisions",
    });
  }

  return prompts.slice(0, 3);
}

function buildNarrativeContext(args: {
  finalRemainingDebtKurus: number;
  payoffOutsideHorizon: boolean;
  highestRiskLevel: UiRiskLevel;
  riskWarnings: ForecastRiskWarning[];
}): ForecastNarrativeContext {
  const status = args.highestRiskLevel === "high" ? "strained" : args.highestRiskLevel === "medium" ? "watch" : "stable";

  return {
    status,
    primaryRisk:
      args.riskWarnings[0]?.message ??
      (args.payoffOutsideHorizon ? "Borç kapanışı 24 aylık tahmin penceresinin dışında kalıyor." : "Belirgin yüksek risk sinyali yok."),
    primaryOpportunity:
      args.finalRemainingDebtKurus > 0
        ? "Varsayımlar korunursa karar simülatörüyle ek ödeme veya gider azaltma etkisi güvenli şekilde incelenebilir."
        : "Borç kapanışı tahmin penceresi içinde görünüyor; karar simülatörüyle planın sürdürülebilirliği yine de kontrol edilebilir.",
    uncertaintyNote: "Bu anlatı kesin sonuç değil; gelir, gider, faiz ve ödeme davranışı değişirse tahmin de değişir.",
  };
}

function buildCoachSummary(args: {
  finalRemainingDebtKurus: number;
  estimatedPayoffMonth: string | null;
  payoffOutsideHorizon: boolean;
  highestRiskLevel: UiRiskLevel;
  riskWarnings: ForecastRiskWarning[];
  totalEstimatedInterestKurus: number;
}): ForecastCoachSummary {
  const payoffText = args.estimatedPayoffMonth
    ? `Bu plana sadık kalırsan borçların ${args.estimatedPayoffMonth} ayında kapanabilir.`
    : "Bu plana sadık kalırsan borç kapanışı 24 aylık tahmin penceresinin dışında kalıyor.";
  const riskText =
    args.highestRiskLevel === "high"
      ? "Bazı aylarda nakit sıkışıklığı riski yüksek görünüyor."
      : args.highestRiskLevel === "medium"
        ? "Plan uygulanabilir görünüyor ancak bazı aylarda yaşam bütçesi sıkı kalabilir."
        : "Plan düşük riskli bir nakit akışıyla ilerliyor.";
  const whyText =
    args.riskWarnings.length > 0
      ? `Çünkü ${args.riskWarnings[0].month} gibi aylarda yaşam bütçesi hedef eşiğin altına yaklaşabilir.`
      : `Çünkü minimum ödemeler ve yaşam bütçesi korunurken tahmini faiz etkisi ${formatTry(args.totalEstimatedInterestKurus)} seviyesinde kalıyor.`;

  return {
    title: "Bu plana sadık kalırsan",
    body: `${payoffText} ${riskText}`,
    why: args.payoffOutsideHorizon
      ? `${whyText} 24 ay dışında kalan kapanış tahmini kesin tarih değildir; varsayımlar değişirse sonuç da değişir.`
      : whyText,
  };
}

export function buildForecastReport(
  snapshot: FinanceSnapshot,
  asOfDate = new Date(),
  options: Pick<MonthlyFinancePlanOptions, "extraDebtPaymentOverrideKurus" | "extraPaymentTargetDebtId"> = {},
): ForecastReport {
  const monthlyPlan = buildMonthlyFinancePlan(snapshot.profile, snapshot.debts, snapshot.expenses, {
    asOfDate,
    horizonMonths: FORECAST_HORIZON_MONTHS,
    ...options,
  });
  const months = monthlyPlan.payoffForecast;
  const monthlyTrend = buildMonthlyTrend(months);
  const payoffMilestones = buildPayoffMilestones(months);
  const riskWarnings = buildRiskWarnings(months, snapshot.profile.survivalThresholdKurus);
  const totalEstimatedInterestKurus = months.reduce((total, month) => total + getInterest(month), 0);
  const finalRemainingDebtKurus = getRemainingDebt(months.at(-1));
  const estimatedPayoffMonth = months.find((month) => getRemainingDebt(month) === 0)?.month ?? null;
  const payoffOutsideHorizon = !estimatedPayoffMonth && finalRemainingDebtKurus > 0;
  const highestRiskLevel = maxRiskLevel([
    ...months.map((month) => visibleRiskLevel(month.riskLevel)),
    ...riskWarnings.map((warning) => warning.severity),
  ]);

  return {
    generatedAtIso: asOfDate.toISOString(),
    horizons: FORECAST_HORIZONS,
    checkpoints: buildCheckpoints({
      months,
      horizons: FORECAST_HORIZONS,
      milestones: payoffMilestones,
      survivalThresholdKurus: snapshot.profile.survivalThresholdKurus,
    }),
    monthlyTrend,
    payoffMilestones,
    riskWarnings,
    assumptions: buildAssumptions(snapshot),
    evidenceItems: buildEvidenceItems(snapshot),
    decisionPrompts: buildDecisionPrompts({
      riskWarnings,
      payoffOutsideHorizon,
      highestRiskLevel,
    }),
    narrativeContext: buildNarrativeContext({
      finalRemainingDebtKurus,
      payoffOutsideHorizon,
      highestRiskLevel,
      riskWarnings,
    }),
    coachSummary: buildCoachSummary({
      finalRemainingDebtKurus,
      estimatedPayoffMonth,
      payoffOutsideHorizon,
      highestRiskLevel,
      riskWarnings,
      totalEstimatedInterestKurus,
    }),
    totalEstimatedInterestKurus,
    finalRemainingDebtKurus,
    estimatedPayoffMonth,
    payoffOutsideHorizon,
    highestRiskLevel,
  };
}
