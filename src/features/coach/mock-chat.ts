import type { CoachChatResponse, CoachFinancialSnapshot, CoachLanguage } from "./types";
import { formatCoachTry } from "./chat-response";

export type CoachQuestionCategory = "debt" | "saving" | "income_drop" | "expenses" | "health" | "purchase" | "general";

function visibleRisk(level: CoachFinancialSnapshot["riskLevel"], language: CoachLanguage) {
  if (language === "en") return level === "high" ? "High" : level === "medium" ? "Medium" : "Low";
  return level === "high" ? "Yüksek" : level === "medium" ? "Orta" : "Düşük";
}

export function categorizeCoachQuestion(question: string): CoachQuestionCategory {
  const normalized = question.toLocaleLowerCase("tr-TR");
  if (/income|salary|maaş|gelir|drops?|azal/.test(normalized)) return "income_drop";
  if (/expense|spend|gider|harcama|reduce monthly/.test(normalized)) return "expenses";
  if (/purchase|afford|satın|alabilir|major/.test(normalized)) return "purchase";
  if (/save|saving|birik|tasarruf|20[,.]?000/.test(normalized)) return "saving";
  if (/debt|pay first|borç|borcu|önce öde/.test(normalized)) return "debt";
  if (/health|financial|risk|sağlık|durum/.test(normalized)) return "health";
  return "general";
}

function englishResponse(category: CoachQuestionCategory, snapshot: CoachFinancialSnapshot): Omit<CoachChatResponse, "providerLabel" | "simulated"> {
  const available = formatCoachTry(snapshot.availableMonthlyBalanceKurus, "en");
  const debt = formatCoachTry(snapshot.totalDebtKurus, "en");
  const priority = snapshot.priorityDebt;
  const risk = visibleRisk(snapshot.riskLevel, "en");
  const common = {
    risk: `Current finance-engine risk is ${risk}. Minimum payments are ${snapshot.minimumPaymentsCovered ? "covered" : "not fully covered"}.`,
    keyNumbers: [
      { label: "Monthly income", value: formatCoachTry(snapshot.monthlyIncomeKurus, "en") },
      { label: "Available balance", value: available },
      { label: "Total debt", value: debt },
    ],
    followUps: ["What should I review this month?", "How sensitive is this plan to higher expenses?"],
  };

  if (category === "debt") {
    return {
      ...common,
      summary: priority
        ? `The avalanche order places the highest-rate active debt first. Its current balance is ${formatCoachTry(priority.balanceKurus, "en")} at ${priority.interestRateMonthly.toFixed(2)}% monthly interest.`
        : "There is no active debt in the current snapshot.",
      recommendation: "Use the engine's payment priority as a comparison point while keeping every minimum payment and the protected buffer intact.",
      nextAction: "Open the Plan or Decision Simulator before changing an extra payment.",
      followUps: ["What happens if I make an extra payment?", "How long could payoff take?"],
    };
  }
  if (category === "saving") {
    const target = 20_000_00;
    const capacity = snapshot.availableMonthlyBalanceKurus >= target && snapshot.minimumPaymentsCovered;
    return {
      ...common,
      summary: `The current plan leaves ${available} after mandatory expenses and minimum debt payments. A ₺20,000 monthly target ${capacity ? "fits inside that calculated boundary" : "sits above that calculated boundary"}.`,
      recommendation: "Treat the target as a scenario, not a promise, and preserve the protected buffer before assigning the full amount.",
      nextAction: "Compare a ₺20,000 allocation in the Decision Simulator.",
      followUps: ["What should remain protected first?", "Can expenses be reduced safely?"],
    };
  }
  if (category === "income_drop") {
    return {
      ...common,
      summary: `The deterministic 20% income-drop scenario changes average monthly living capacity by ${formatCoachTry(snapshot.incomeDrop20.averageLivingBudgetDeltaKurus, "en")} and moves scenario risk to ${visibleRisk(snapshot.incomeDrop20.riskLevel, "en")}.`,
      recommendation: "Review which commitments stay fixed before treating the lower-income scenario as sustainable.",
      nextAction: "Use Forecast to compare the baseline and reduced-income path over 24 months.",
      followUps: ["Which payments create the most pressure?", "How much buffer remains?"],
    };
  }
  if (category === "expenses") {
    return {
      ...common,
      summary: `Mandatory expenses total ${formatCoachTry(snapshot.monthlyExpensesKurus, "en")}. A deterministic 10% reduction scenario changes average living capacity by ${formatCoachTry(snapshot.expenseReduction10.averageLivingBudgetDeltaKurus, "en")}.`,
      recommendation: "Start with categories that can change without weakening essential commitments; the demo does not infer discretionary spending that was not recorded.",
      nextAction: "Review the Expenses page, then compare a temporary reduction in Forecast.",
      followUps: ["Which costs are included in the snapshot?", "How would lower expenses affect debt payoff?"],
    };
  }
  if (category === "purchase") {
    const reviewable = Math.max(0, snapshot.availableMonthlyBalanceKurus - snapshot.protectedBufferKurus);
    return {
      ...common,
      summary: `The snapshot leaves ${available}, including a protected buffer of ${formatCoachTry(snapshot.protectedBufferKurus, "en")}. The amount above that boundary is ${formatCoachTry(reviewable, "en")} before any unrecorded costs.`,
      recommendation: "A purchase amount and timing are needed for a meaningful comparison; the current snapshot alone cannot establish affordability.",
      nextAction: "Model the purchase as a reversible scenario and compare its effect on the protected balance.",
      followUps: ["What purchase amount can I compare?", "What happens if income falls afterward?"],
    };
  }
  if (category === "health") {
    return {
      ...common,
      summary: `The finance engine classifies the current plan as ${risk} risk, with ${debt} in active debt and ${available} available for the month. There are ${snapshot.reminders.highPriorityCount} high-priority reminder signals.`,
      recommendation: "Read the result as a decision-support snapshot: cash-flow protection, minimum-payment coverage and debt pressure matter together.",
      nextAction: "Review the highest-priority reminder and the first item in the monthly plan.",
      followUps: ["Which debt should I pay first?", "Can I save ₺20,000 per month?"],
    };
  }
  return {
    ...common,
    summary: `The current deterministic snapshot shows ${available} available monthly balance, ${debt} total debt and ${risk} risk.`,
    recommendation: "Ask about debt priority, saving capacity, income changes, expenses or a major purchase for a more focused explanation.",
    nextAction: "Choose one financial decision to compare without changing the underlying demo data.",
  };
}

function turkishResponse(category: CoachQuestionCategory, snapshot: CoachFinancialSnapshot): Omit<CoachChatResponse, "providerLabel" | "simulated"> {
  const available = formatCoachTry(snapshot.availableMonthlyBalanceKurus, "tr");
  const debt = formatCoachTry(snapshot.totalDebtKurus, "tr");
  const risk = visibleRisk(snapshot.riskLevel, "tr");
  const common = {
    risk: `Finans motorunun mevcut risk sınıfı ${risk}. Asgari ödemeler ${snapshot.minimumPaymentsCovered ? "karşılanıyor" : "tam karşılanmıyor"}.`,
    keyNumbers: [
      { label: "Aylık gelir", value: formatCoachTry(snapshot.monthlyIncomeKurus, "tr") },
      { label: "Kullanılabilir bakiye", value: available },
      { label: "Toplam borç", value: debt },
    ],
    followUps: ["Bu ay önce neyi gözden geçirmeliyim?", "Plan gider artışına ne kadar duyarlı?"],
  };

  const translations: Record<CoachQuestionCategory, Pick<CoachChatResponse, "summary" | "recommendation" | "nextAction">> = {
    debt: {
      summary: snapshot.priorityDebt
        ? `Avalanche sırası, aylık faizi %${snapshot.priorityDebt.interestRateMonthly.toFixed(2)} olan ${formatCoachTry(snapshot.priorityDebt.balanceKurus, "tr")} bakiyeli aktif borcu önce gösteriyor.`
        : "Mevcut özette aktif borç görünmüyor.",
      recommendation: "Tüm asgari ödemeleri ve korunan tamponu sürdürürken motorun ödeme önceliğini karşılaştırma noktası olarak kullanın.",
      nextAction: "Ek ödemeyi değiştirmeden önce Plan veya Karar Simülatörü'nü açın.",
    },
    saving: {
      summary: `Mevcut plan zorunlu giderler ve asgari ödemeler sonrasında ${available} bırakıyor. Aylık ₺20.000 hedefi ${snapshot.availableMonthlyBalanceKurus >= 20_000_00 && snapshot.minimumPaymentsCovered ? "bu hesaplanan sınırın içinde" : "bu hesaplanan sınırın üzerinde"}.`,
      recommendation: "Hedefi kesin sonuç değil senaryo olarak değerlendirin ve tutarı ayırmadan önce korunan tamponu sürdürün.",
      nextAction: "Karar Simülatörü'nde ₺20.000 ayırma etkisini karşılaştırın.",
    },
    income_drop: {
      summary: `Deterministik %20 gelir düşüşü senaryosu ortalama yaşam kapasitesini ${formatCoachTry(snapshot.incomeDrop20.averageLivingBudgetDeltaKurus, "tr")} değiştiriyor ve riski ${visibleRisk(snapshot.incomeDrop20.riskLevel, "tr")} seviyesine taşıyor.`,
      recommendation: "Düşük gelir senaryosunu sürdürülebilir kabul etmeden önce sabit kalan yükümlülükleri inceleyin.",
      nextAction: "Forecast içinde mevcut plan ile düşük gelir yolunu 24 ay için karşılaştırın.",
    },
    expenses: {
      summary: `Zorunlu giderler ${formatCoachTry(snapshot.monthlyExpensesKurus, "tr")} tutarında. Deterministik %10 gider azaltma senaryosu ortalama yaşam kapasitesini ${formatCoachTry(snapshot.expenseReduction10.averageLivingBudgetDeltaKurus, "tr")} değiştiriyor.`,
      recommendation: "Kayıtlarda bulunmayan isteğe bağlı harcamalar varsayılmadığı için önce temel yükümlülükleri zayıflatmadan değişebilecek kategorileri inceleyin.",
      nextAction: "Giderler sayfasını gözden geçirip Forecast içinde geçici azaltma senaryosunu karşılaştırın.",
    },
    purchase: {
      summary: `Özet ${available} kullanılabilir bakiye ve ${formatCoachTry(snapshot.protectedBufferKurus, "tr")} korunan tampon gösteriyor. Kayıt dışı maliyetlerden önce tampon üzerindeki tutar ${formatCoachTry(Math.max(0, snapshot.availableMonthlyBalanceKurus - snapshot.protectedBufferKurus), "tr")}.`,
      recommendation: "Anlamlı bir karşılaştırma için satın alma tutarı ve zamanı gerekir; mevcut özet tek başına karşılanabilirlik sonucu vermez.",
      nextAction: "Satın almayı geri alınabilir bir senaryo olarak modelleyip korunan bakiyeye etkisini karşılaştırın.",
    },
    health: {
      summary: `Finans motoru planı ${risk} risk olarak sınıflandırıyor; aktif borç ${debt}, kullanılabilir aylık bakiye ${available}.`,
      recommendation: "Sonucu karar desteği olarak okuyun; nakit akışı, asgari ödeme kapsamı ve borç baskısı birlikte değerlendirilir.",
      nextAction: "En yüksek öncelikli hatırlatmayı ve aylık planın ilk adımını gözden geçirin.",
    },
    general: {
      summary: `Deterministik özet ${available} kullanılabilir aylık bakiye, ${debt} toplam borç ve ${risk} risk gösteriyor.`,
      recommendation: "Daha odaklı açıklama için borç önceliği, tasarruf kapasitesi, gelir değişimi, giderler veya büyük bir satın alma hakkında sorun.",
      nextAction: "Temel demo verisini değiştirmeden karşılaştırmak istediğiniz tek bir kararı seçin.",
    },
  };

  return { ...common, ...translations[category] };
}

export function buildMockCoachChatResponse(
  question: string,
  snapshot: CoachFinancialSnapshot,
  language: CoachLanguage,
): CoachChatResponse {
  const category = categorizeCoachQuestion(question);
  const response = language === "en" ? englishResponse(category, snapshot) : turkishResponse(category, snapshot);
  return { ...response, providerLabel: language === "en" ? "Mock AI · Demo Mode" : "Mock AI · Demo Modu", simulated: true };
}
