import { buildMonthlyFinancePlan } from "@/features/finance/calculations";
import type { FinanceSnapshot } from "@/features/finance/data-service";
import type { MonthlyFinancePlan, RiskLevel, UiRiskLevel } from "@/features/finance/types";
import type {
  FinancialMemoryCategoryTotalInput,
  FinancialMemoryInsight,
  FinancialMemoryReport,
  FinancialMemorySnapshotInput,
  FinancialMemorySnapshotRecord,
  FinancialMemoryTrigger,
  MemoryWindow,
  MemoryWindowComparison,
} from "./types";

const MEMORY_WINDOWS: MemoryWindow[] = [3, 6, 12];

function toPeriodMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

function visibleRiskLevel(riskLevel: RiskLevel | UiRiskLevel): UiRiskLevel {
  return riskLevel === "critical" ? "high" : riskLevel;
}

function percent(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Number((part / total).toFixed(4));
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function getDebtTotals(snapshot: FinanceSnapshot) {
  const activeDebts = snapshot.debts.filter((debt) => debt.status === "active" && debt.balanceKurus > 0);

  return {
    totalDebtKurus: sum(snapshot.debts.map((debt) => debt.balanceKurus)),
    activeDebtKurus: sum(activeDebts.map((debt) => debt.balanceKurus)),
    creditCardDebtKurus: sum(activeDebts.filter((debt) => debt.type === "credit_card").map((debt) => debt.balanceKurus)),
    activeDebtCount: activeDebts.length,
    paidOffDebtCount: snapshot.debts.filter((debt) => debt.status === "paid_off" || debt.balanceKurus === 0).length,
    fallbackRateDebtCount: activeDebts.filter((debt) => debt.interestRateSource?.includes("fallback")).length,
    missingRateDebtCount: activeDebts.filter((debt) => debt.interestRateMonthly === 0 || debt.interestRateSource === "missing").length,
    manualRateDebtCount: activeDebts.filter((debt) => debt.interestRateSource === "manual" || debt.manualInterestRateMonthly != null).length,
    providerRateDebtCount: activeDebts.filter((debt) => {
      const source = debt.interestRateSource ?? "";
      return source !== "" && source !== "missing" && !source.includes("fallback") && source !== "manual";
    }).length,
  };
}

function buildCategoryTotals(snapshot: FinanceSnapshot): FinancialMemoryCategoryTotalInput[] {
  const totals = new Map<string, { amountKurus: number; itemCount: number }>();

  for (const expense of snapshot.expenses) {
    const current = totals.get(expense.category) ?? { amountKurus: 0, itemCount: 0 };
    totals.set(expense.category, {
      amountKurus: current.amountKurus + expense.amountKurus,
      itemCount: current.itemCount + 1,
    });
  }

  return [...totals.entries()]
    .map(([category, total]) => ({ category, ...total }))
    .sort((a, b) => b.amountKurus - a.amountKurus);
}

export function captureFinancialMemorySnapshot(
  snapshot: FinanceSnapshot,
  monthlyPlan: MonthlyFinancePlan,
  trigger: FinancialMemoryTrigger,
  capturedAt = new Date(),
): FinancialMemorySnapshotInput {
  const debtTotals = getDebtTotals(snapshot);

  return {
    periodMonth: toPeriodMonth(capturedAt),
    capturedAt,
    trigger,
    salaryKurus: snapshot.profile.monthlySalaryKurus,
    mandatoryExpenseTotalKurus: monthlyPlan.cashFlow.mandatoryExpenseTotalKurus,
    minimumDebtPaymentsKurus: monthlyPlan.cashFlow.minimumDebtPaymentsKurus,
    survivalBudgetKurus: monthlyPlan.cashFlow.survivalBudgetKurus,
    dailyLimitKurus: monthlyPlan.livingBudget.dailyLimitKurus,
    weeklyLimitKurus: monthlyPlan.livingBudget.weeklyLimitKurus,
    extraDebtPaymentCapacityKurus: monthlyPlan.cashFlow.extraDebtPaymentKurus,
    ...debtTotals,
    riskLevel: visibleRiskLevel(monthlyPlan.riskLevel),
    criticalReasonCount: monthlyPlan.criticalReasons.length,
    warningCount: monthlyPlan.warnings.length,
    planExtraDebtPaymentKurus: monthlyPlan.cashFlow.extraDebtPaymentKurus,
    planMinimumPaymentsCovered: monthlyPlan.cashFlow.minimumPaymentsCovered,
    categoryTotals: buildCategoryTotals(snapshot),
  };
}

function sortAscending(snapshots: FinancialMemorySnapshotRecord[]) {
  return [...snapshots].sort((a, b) => a.periodMonth.localeCompare(b.periodMonth));
}

export function compareMemoryWindows(
  snapshots: FinancialMemorySnapshotRecord[],
  months: MemoryWindow,
): MemoryWindowComparison {
  const sorted = sortAscending(snapshots);
  const windowSnapshots = sorted.slice(-months);
  const first = windowSnapshots[0];
  const latest = windowSnapshots.at(-1);
  const hasEnoughHistory = windowSnapshots.length >= Math.min(months, 2);

  if (!first || !latest || !hasEnoughHistory) {
    return {
      months,
      hasEnoughHistory: false,
      availableMonths: windowSnapshots.length,
      totalDebtDeltaKurus: 0,
      activeDebtDeltaKurus: 0,
      survivalBudgetDeltaKurus: 0,
      mandatoryExpenseRatioDelta: 0,
      creditCardDebtShareDelta: 0,
      highRiskMonthCount: 0,
      cashSqueezeCount: 0,
      debtVelocityKurus: 0,
    };
  }

  const mandatoryExpenseRatioDelta =
    percent(latest.mandatoryExpenseTotalKurus, latest.salaryKurus) -
    percent(first.mandatoryExpenseTotalKurus, first.salaryKurus);
  const creditCardDebtShareDelta =
    percent(latest.creditCardDebtKurus, latest.activeDebtKurus) - percent(first.creditCardDebtKurus, first.activeDebtKurus);
  const totalDebtDeltaKurus = latest.totalDebtKurus - first.totalDebtKurus;

  return {
    months,
    hasEnoughHistory,
    availableMonths: windowSnapshots.length,
    totalDebtDeltaKurus,
    activeDebtDeltaKurus: latest.activeDebtKurus - first.activeDebtKurus,
    survivalBudgetDeltaKurus: latest.survivalBudgetKurus - first.survivalBudgetKurus,
    mandatoryExpenseRatioDelta,
    creditCardDebtShareDelta,
    highRiskMonthCount: windowSnapshots.filter((snapshot) => snapshot.riskLevel === "high").length,
    cashSqueezeCount: windowSnapshots.filter((snapshot) => snapshot.survivalBudgetKurus < 0 || snapshot.riskLevel === "high").length,
    debtVelocityKurus: windowSnapshots.length > 1 ? Math.round(Math.abs(totalDebtDeltaKurus) / (windowSnapshots.length - 1)) : 0,
  };
}

function buildCategoryChanges(snapshots: FinancialMemorySnapshotRecord[]) {
  const sorted = sortAscending(snapshots);
  const previous = sorted.at(-2);
  const latest = sorted.at(-1);

  if (!previous || !latest) {
    return [];
  }

  const previousByCategory = new Map(previous.categoryTotals.map((category) => [category.category, category.amountKurus]));
  const latestByCategory = new Map(latest.categoryTotals.map((category) => [category.category, category.amountKurus]));
  const categories = new Set([...previousByCategory.keys(), ...latestByCategory.keys()]);

  return [...categories]
    .map((category) => {
      const currentAmountKurus = latestByCategory.get(category) ?? 0;
      const previousAmountKurus = previousByCategory.get(category) ?? 0;

      return {
        category,
        currentAmountKurus,
        previousAmountKurus,
        deltaKurus: currentAmountKurus - previousAmountKurus,
      };
    })
    .sort((a, b) => Math.abs(b.deltaKurus) - Math.abs(a.deltaKurus));
}

function insight(id: string, title: string, body: string, tone: UiRiskLevel): FinancialMemoryInsight {
  return { id, title, body, tone };
}

export function buildDeterministicMemoryInsights(report: Omit<FinancialMemoryReport, "insights">): FinancialMemoryInsight[] {
  if (!report.latestSnapshot) {
    return [
      insight(
        "empty-memory",
        "Henüz finansal hafıza yok",
        "İlk snapshot oluşturulduktan sonra sistem borç, gider, yaşam bütçesi ve risk değişimlerini izlemeye başlayacak.",
        "medium",
      ),
    ];
  }

  if (!report.hasEnoughHistory) {
    return [
      insight(
        "limited-history",
        "Yeterli geçmiş yok",
        "Trend içgörüleri için en az iki aylık finansal hafıza gerekir. Şimdilik güncel durum snapshot’ı saklanıyor.",
        "medium",
      ),
      insight(
        "local-only",
        "Analiz kayıtlı hafızaya dayanır",
        "Bu hafıza kayıtlı finansal snapshot’lardan üretilir. Financial Memory analizi kendi başına üçüncü parti AI çağrısı yapmaz.",
        "low",
      ),
    ];
  }

  const [threeMonth] = report.comparisons;
  const latest = report.latestSnapshot;
  const insights: FinancialMemoryInsight[] = [];

  insights.push(
    insight(
      "debt-trend",
      threeMonth.totalDebtDeltaKurus <= 0 ? "Toplam borç azalıyor" : "Toplam borç artıyor",
      threeMonth.totalDebtDeltaKurus <= 0
        ? "Son dönem snapshot’larında toplam borç yükü aşağı yönlü ilerliyor."
        : "Son dönem snapshot’larında toplam borç yükü yükselmiş görünüyor; yeni borç veya yetersiz ödeme etkisi olabilir.",
      threeMonth.totalDebtDeltaKurus <= 0 ? "low" : "high",
    ),
  );

  insights.push(
    insight(
      "living-budget-trend",
      threeMonth.survivalBudgetDeltaKurus >= 0 ? "Yaşam bütçesi korunuyor" : "Yaşam bütçesi daralıyor",
      threeMonth.survivalBudgetDeltaKurus >= 0
        ? "Son karşılaştırmada yaşam bütçesi önceki snapshot’a göre daha güçlü veya aynı seviyede."
        : "Yaşam bütçesi önceki snapshot’a göre daralmış; zorunlu gider ve asgari ödeme baskısı izlenmeli.",
      threeMonth.survivalBudgetDeltaKurus >= 0 ? "low" : "medium",
    ),
  );

  if (threeMonth.creditCardDebtShareDelta > 0) {
    insights.push(
      insight(
        "card-share-up",
        "Kredi kartı borç payı artıyor",
        "Kredi kartı borcu toplam aktif borç içinde daha büyük pay almaya başlamış. Bu durum faiz baskısını artırabilir.",
        "medium",
      ),
    );
  }

  if (latest.fallbackRateDebtCount > 0 || latest.missingRateDebtCount > 0) {
    insights.push(
      insight(
        "rate-quality",
        "Faiz verisi dikkat istiyor",
        "Bazı aktif borçlarda fallback veya eksik faiz bilgisi var. Bu oranlar gerçek banka oranı gibi değerlendirilmemeli.",
        "medium",
      ),
    );
  }

  insights.push(
    insight(
      "risk-history",
      `${threeMonth.highRiskMonthCount} yüksek riskli ay`,
      `Son ${threeMonth.availableMonths} snapshot içinde ${threeMonth.highRiskMonthCount} ay yüksek risk olarak işaretlendi.`,
      threeMonth.highRiskMonthCount > 0 ? "high" : "low",
    ),
  );

  return insights;
}

export function buildFinancialMemoryReport(
  snapshots: FinancialMemorySnapshotRecord[],
  generatedAt = new Date(),
): FinancialMemoryReport {
  const sorted = sortAscending(snapshots);
  const latestSnapshot = sorted.at(-1) ?? null;
  const comparisons = MEMORY_WINDOWS.map((months) => compareMemoryWindows(sorted, months));
  const baseReport: Omit<FinancialMemoryReport, "insights"> = {
    generatedAtIso: generatedAt.toISOString(),
    hasAnySnapshot: sorted.length > 0,
    hasEnoughHistory: sorted.length >= 2,
    snapshotCount: sorted.length,
    latestSnapshot,
    trend: sorted.map((snapshot) => ({
      periodMonth: snapshot.periodMonth,
      totalDebtKurus: snapshot.totalDebtKurus,
      activeDebtKurus: snapshot.activeDebtKurus,
      creditCardDebtKurus: snapshot.creditCardDebtKurus,
      mandatoryExpenseTotalKurus: snapshot.mandatoryExpenseTotalKurus,
      salaryKurus: snapshot.salaryKurus,
      survivalBudgetKurus: snapshot.survivalBudgetKurus,
      minimumDebtPaymentsKurus: snapshot.minimumDebtPaymentsKurus,
      extraDebtPaymentCapacityKurus: snapshot.extraDebtPaymentCapacityKurus,
      riskLevel: snapshot.riskLevel,
    })),
    comparisons,
    categoryChanges: buildCategoryChanges(sorted),
    planAdherence: {
      label: "Plan uyumu",
      score: sorted.length >= 2 && latestSnapshot ? Math.max(0, Math.min(100, latestSnapshot.planMinimumPaymentsCovered ? 70 : 35)) : null,
      helper:
        "Bu fazda gerçek banka hareketi yoktur; skor minimum ödeme kapsaması ve borç trendinden türetilen sınırlı güvenilirlikte bir göstergedir.",
    },
  };

  return {
    ...baseReport,
    insights: buildDeterministicMemoryInsights(baseReport),
  };
}

export function buildCurrentMemorySnapshotInput(
  snapshot: FinanceSnapshot,
  trigger: FinancialMemoryTrigger,
  capturedAt = new Date(),
): FinancialMemorySnapshotInput {
  const monthlyPlan = buildMonthlyFinancePlan(snapshot.profile, snapshot.debts, snapshot.expenses, {
    asOfDate: capturedAt,
    horizonMonths: 24,
  });

  return captureFinancialMemorySnapshot(snapshot, monthlyPlan, trigger, capturedAt);
}
