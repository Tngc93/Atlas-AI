import type { MonthlyFinancePlan, UiRiskLevel } from "./types";

export type DashboardDecisionBrief = {
  protectedThing: string;
  primaryRisk: string;
  nextSafeStep: string;
  why: string;
  riskLabel: "Düşük" | "Orta" | "Yüksek";
  decisionNote: string;
};

const decisionNote = "Bu özet hesaplama motorundan gelir; son karar sizindir.";

const riskLabels: Record<UiRiskLevel, DashboardDecisionBrief["riskLabel"]> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

function buildProtectedThing(plan: MonthlyFinancePlan) {
  if (plan.cashFlow.salaryKurus <= 0) {
    return "Önce gelir bilgisini netleştirmek";
  }

  if (!plan.cashFlow.minimumPaymentsCovered) {
    return "Zorunlu giderler ve asgari ödemeler";
  }

  if (plan.debtPriorities.length === 0) {
    return "Zorunlu yaşam giderleri";
  }

  return "Yaşam giderleri, asgari ödemeler ve güvenli bütçe";
}

function buildPrimaryRisk(plan: MonthlyFinancePlan) {
  if (plan.criticalReasons.length > 0) {
    return plan.criticalReasons[0];
  }

  if (plan.warnings.length > 0) {
    return plan.warnings[0];
  }

  return "Bu ay için belirgin nakit akışı uyarısı yok.";
}

function buildNextSafeStep(plan: MonthlyFinancePlan) {
  if (plan.cashFlow.salaryKurus <= 0) {
    return "Gelir, gider ve borç kayıtlarını tamamlayarak karar özetini netleştirmek.";
  }

  if (!plan.cashFlow.minimumPaymentsCovered) {
    return "Ek ödeme düşünmeden önce asgari ödemelerin karşılanma durumunu gözden geçirmek.";
  }

  if (plan.livingBudget.remainingForMonthKurus <= 0 || plan.cashFlow.extraDebtPaymentKurus <= 0) {
    return "Ek borç ödemesi yerine yaşam bütçesini korumaya odaklanmak.";
  }

  return plan.actionPlan[0]?.description ?? "Mevcut günlük ve haftalık harcama limitini koruyarak planı takip etmek.";
}

function buildWhy(plan: MonthlyFinancePlan) {
  if (!plan.cashFlow.minimumPaymentsCovered) {
    return "Çünkü asgari ödemeler güvenceye alınmadan yapılan ek ödeme veya harcama kararları nakit baskısını artırabilir.";
  }

  if (plan.livingBudget.remainingForMonthKurus <= 0 || plan.cashFlow.extraDebtPaymentKurus <= 0) {
    return "Çünkü yaşam bütçesi korunmadığında borç azaltma hızından önce nakit güvenliği önem kazanır.";
  }

  if (plan.riskLevel === "low") {
    return "Çünkü temel yükümlülükler karşılanıyor; bu ayın değeri planı bozmadan sürdürmekte.";
  }

  return "Çünkü hesaplama motoru bu ayda nakit akışı, ödeme zamanı veya bütçe sınırı açısından dikkat gerektiren sinyal görüyor.";
}

export function buildDashboardDecisionBrief(plan: MonthlyFinancePlan): DashboardDecisionBrief {
  return {
    protectedThing: buildProtectedThing(plan),
    primaryRisk: buildPrimaryRisk(plan),
    nextSafeStep: buildNextSafeStep(plan),
    why: buildWhy(plan),
    riskLabel: riskLabels[plan.riskLevel],
    decisionNote,
  };
}
