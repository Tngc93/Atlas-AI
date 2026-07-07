import type {
  CoachInputSummary,
  CoachMemoryContext,
  CoachRecommendationContext,
  CoachRecommendationItem,
  CoachRecommendationPriority,
  CoachTrendContext,
} from "./types";

type RecommendationDraft = Omit<CoachRecommendationItem, "priority" | "confidence"> & {
  score: number;
  confidenceBase?: number;
};

export function emptyRecommendationContext(): CoachRecommendationContext {
  return {
    hasRecommendations: false,
    items: [],
  };
}

function priorityFromScore(score: number): CoachRecommendationPriority {
  if (score >= 80) {
    return "HIGH";
  }

  if (score >= 45) {
    return "MEDIUM";
  }

  return "LOW";
}

function confidenceFor(draft: RecommendationDraft, summary: CoachInputSummary, trends: CoachTrendContext): number {
  const historyAdjustment = trends.hasEnoughHistory ? 0.12 : -0.08;
  const fallbackAdjustment = summary.rateContext.isFallback ? -0.08 : 0;
  const base = draft.confidenceBase ?? 0.74;

  return Math.max(0.35, Math.min(0.95, Number((base + historyAdjustment + fallbackAdjustment).toFixed(2))));
}

function item(draft: RecommendationDraft, summary: CoachInputSummary, trends: CoachTrendContext): CoachRecommendationItem {
  return {
    id: draft.id,
    title: draft.title,
    priority: priorityFromScore(draft.score),
    category: draft.category,
    reason: draft.reason,
    expectedImpact: draft.expectedImpact,
    confidence: confidenceFor(draft, summary, trends),
    sourceSignals: draft.sourceSignals.slice(0, 5),
  };
}

function pushRecommendation(drafts: RecommendationDraft[], draft: RecommendationDraft) {
  drafts.push(draft);
}

function riskScore(summary: CoachInputSummary, trends: CoachTrendContext): number {
  let score = 0;

  if (summary.riskLevel === "high" || summary.riskLevel === "critical") {
    score += 55;
  } else if (summary.riskLevel === "medium") {
    score += 35;
  }

  if (trends.riskTrend === "worsening") {
    score += 30;
  }

  if (summary.criticalReasonCount > 0) {
    score += 20;
  }

  return Math.min(100, score);
}

export function analyzeCoachRecommendations(params: {
  summary: CoachInputSummary;
  memory: CoachMemoryContext;
  trends: CoachTrendContext;
}): CoachRecommendationContext {
  const { summary, memory, trends } = params;
  const drafts: RecommendationDraft[] = [];

  if (summary.highInterestDebtCount > 0 || summary.topDebtRateBand === "high") {
    pushRecommendation(drafts, {
      id: "prioritize-high-interest-debt",
      title: "En yüksek faizli borca öncelik ver",
      category: "DEBT",
      score: 86,
      reason:
        "Çünkü finans motoru aktif borçlar içinde yüksek faiz baskısı sinyali görüyor ve avalanche yaklaşımı faiz maliyetini azaltmaya odaklanıyor.",
      expectedImpact: "Asgari ödemeler korunduktan sonra ek ödeme alanı oluşursa faiz baskısı daha hızlı azalabilir.",
      sourceSignals: ["high_interest_debt", "avalanche_strategy", `top_rate_${summary.topDebtRateBand}`],
    });
  }

  if (summary.survivalBudgetDirection === "negative" || summary.survivalBudgetDirection === "thin" || trends.survivalBudgetTrend === "worsening") {
    pushRecommendation(drafts, {
      id: "protect-survival-budget",
      title: summary.survivalBudgetDirection === "negative" ? "Bu ay ekstra ödeme yapma" : "Yaşam bütçesini korumadan ek ödeme yapma",
      category: "CASHFLOW",
      score: summary.survivalBudgetDirection === "negative" ? 95 : 82,
      reason:
        "Çünkü yaşam bütçesi korunmadan yapılan ek borç ödemesi ay içinde yeniden borçlanma veya ödeme aksatma riski oluşturabilir.",
      expectedImpact: "Nakit akışı güvenliği korunur ve zorunlu giderlerle asgari ödemelerin aksama riski azalır.",
      confidenceBase: 0.82,
      sourceSignals: ["survival_budget", summary.survivalBudgetDirection, `survival_trend_${trends.survivalBudgetTrend}`],
    });
  }

  if (trends.cashSqueezeRecurrence === "repeated" || trends.cashSqueezeRecurrence === "occasional" || memory.cashSqueezeCount > 0) {
    pushRecommendation(drafts, {
      id: "reduce-cash-squeeze",
      title: "Nakit sıkışıklığı tekrarlarını azalt",
      category: "BUDGET",
      score: trends.cashSqueezeRecurrence === "repeated" ? 88 : 62,
      reason:
        "Çünkü finansal hafıza son dönemlerde nakit sıkışıklığı sinyali gösteriyor; bu durum ödeme günlerinde kırılganlığı artırabilir.",
      expectedImpact: "Zorunlu giderler ve ödeme tarihleri birlikte gözden geçirilirse ay içi baskı daha erken fark edilir.",
      sourceSignals: ["cash_squeeze", trends.cashSqueezeRecurrence, `cash_squeeze_count_${memory.cashSqueezeCount}`],
    });
  }

  const risk = riskScore(summary, trends);
  if (risk > 0) {
    pushRecommendation(drafts, {
      id: "lower-risk-level",
      title: "Risk seviyesini düşürmeye odaklan",
      category: "RISK",
      score: risk,
      reason:
        "Çünkü finans motoru risk seviyesini ve kritik nedenleri nakit akışı, borç yükü, uyarılar ve ödeme güvenliğiyle birlikte değerlendiriyor.",
      expectedImpact: "Önce yüksek risk nedenleri azaltılırsa koç yorumu ve aylık plan daha uygulanabilir hale gelir.",
      sourceSignals: ["risk_level", summary.riskLevel, `risk_trend_${trends.riskTrend}`, `critical_${summary.criticalReasonCount}`],
    });
  }

  if (summary.activeDebtCount > 0 && (trends.totalDebtTrend === "decreasing" || trends.activeDebtTrend === "decreasing")) {
    pushRecommendation(drafts, {
      id: "maintain-debt-discipline",
      title: "Borç azaltma disiplinini koru",
      category: "HABIT",
      score: 58,
      reason:
        "Çünkü Financial Memory trendleri borç yükünün aşağı yönlü ilerlediğini gösteriyor; bu ritim bozulmadan sürdürülmeli.",
      expectedImpact: "Mevcut ödeme davranışı korunursa borç kapatma yol haritası daha öngörülebilir kalır.",
      confidenceBase: 0.78,
      sourceSignals: ["debt_trend_decreasing", `velocity_${trends.debtPayoffVelocity}`],
    });
  }

  if (
    summary.survivalBudgetDirection === "stable" &&
    (trends.survivalBudgetTrend === "improving" || trends.survivalBudgetTrend === "flat") &&
    summary.activeDebtCount === 0
  ) {
    pushRecommendation(drafts, {
      id: "increase-saving-capacity",
      title: "Tasarruf kapasitesini artır",
      category: "SAVING",
      score: 52,
      reason:
        "Çünkü aktif borç baskısı görünmüyor ve yaşam bütçesi daha dengeli sinyal veriyor; bu alan düzenli bir güvenlik tamponuna dönüşebilir.",
      expectedImpact: "Ay sonu tamponu güçlenirse beklenmeyen giderlere karşı kırılganlık azalabilir.",
      sourceSignals: ["stable_survival_budget", "no_active_debt", `survival_trend_${trends.survivalBudgetTrend}`],
    });
  }

  if (drafts.length === 0) {
    pushRecommendation(drafts, {
      id: "keep-records-current",
      title: "Kayıtlarını güncel tut",
      category: "HABIT",
      score: 35,
      reason:
        "Çünkü hedef benzeri öneriler yalnızca deterministik finans özeti ve Financial Memory sinyalleri güncel olduğunda güvenilir olur.",
      expectedImpact: "Gelir, gider, faiz ve borç kayıtları güncel kaldıkça koç yorumları daha tutarlı hale gelir.",
      confidenceBase: trends.hasEnoughHistory ? 0.65 : 0.52,
      sourceSignals: ["data_freshness", trends.hasEnoughHistory ? "history_available" : "insufficient_history"],
    });
  }

  const items = drafts
    .sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDelta = priorityOrder[priorityFromScore(b.score)] - priorityOrder[priorityFromScore(a.score)];

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return b.score - a.score;
    })
    .map((draft) => item(draft, summary, trends))
    .slice(0, 5);

  return {
    hasRecommendations: items.length > 0,
    items,
  };
}
