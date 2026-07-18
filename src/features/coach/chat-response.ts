import type { CoachChatResponse, CoachFinancialSnapshot, CoachInsight, CoachLanguage } from "./types";

export function formatCoachTry(kurus: number, language: CoachLanguage) {
  const amount = new Intl.NumberFormat(language === "en" ? "en-US" : "tr-TR", {
    maximumFractionDigits: 0,
  }).format(kurus / 100);
  return `₺${amount}`;
}

function riskLabel(snapshot: CoachFinancialSnapshot, language: CoachLanguage) {
  if (language === "en") {
    return snapshot.riskLevel === "high" ? "High" : snapshot.riskLevel === "medium" ? "Medium" : "Low";
  }
  return snapshot.riskLevel === "high" ? "Yüksek" : snapshot.riskLevel === "medium" ? "Orta" : "Düşük";
}

export function buildCoachChatResponseFromInsight(
  insight: CoachInsight,
  snapshot: CoachFinancialSnapshot,
  language: CoachLanguage,
): CoachChatResponse {
  const fallbackAction =
    language === "en"
      ? "Review the deterministic plan before changing any payment or spending decision."
      : "Herhangi bir ödeme veya harcama kararını değiştirmeden önce deterministik planı gözden geçirin.";
  const risk =
    language === "en"
      ? `The finance engine currently classifies risk as ${riskLabel(snapshot, language)}. Minimum payments are ${snapshot.minimumPaymentsCovered ? "covered" : "not fully covered"}.`
      : `Finans motoru mevcut riski ${riskLabel(snapshot, language)} olarak sınıflandırıyor. Asgari ödemeler ${snapshot.minimumPaymentsCovered ? "karşılanıyor" : "tam karşılanmıyor"}.`;

  return {
    summary: insight.summary,
    recommendation: insight.recommendedActions[0] ?? fallbackAction,
    risk,
    nextAction: insight.recommendedActions[1] ?? fallbackAction,
    keyNumbers: [
      { label: language === "en" ? "Available balance" : "Kullanılabilir bakiye", value: formatCoachTry(snapshot.availableMonthlyBalanceKurus, language) },
      { label: language === "en" ? "Total debt" : "Toplam borç", value: formatCoachTry(snapshot.totalDebtKurus, language) },
      { label: language === "en" ? "24-month debt" : "24 aylık borç", value: formatCoachTry(snapshot.forecast.remainingDebtKurus, language) },
    ],
    followUps: insight.questionsToReview.slice(0, 3),
    providerLabel: insight.provider === "mock" ? "Mock AI" : insight.provider,
    simulated: insight.provider === "mock" || insight.providerMode === "fallback",
  };
}
