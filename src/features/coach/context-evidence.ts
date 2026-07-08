import type { CoachContext, CoachInputSummary, CoachTrendContext } from "./types";

export type CoachEvidenceItem = {
  label: string;
  value: string;
};

export type CoachEvidenceSummary = {
  calculationItems: CoachEvidenceItem[];
  memoryStatus: string;
  trendLabels: string[];
  recommendationTitles: string[];
  rateContext: string;
  privacyNote: string;
};

const privacyNote = "Ham banka hareketleri, kart numarası, IBAN veya kişisel notlar bu yorumda kullanılmaz.";

const riskLabels: Record<string, string> = {
  low: "Düşük risk",
  medium: "Orta risk",
  high: "Yüksek risk",
  critical: "Yüksek risk",
};

const survivalBudgetLabels: Record<CoachInputSummary["survivalBudgetDirection"], string> = {
  negative: "Yaşam bütçesi korunmuyor",
  thin: "Yaşam bütçesi ince",
  stable: "Yaşam bütçesi korunuyor",
};

const dailyLimitLabels: Record<CoachInputSummary["dailyLimitBand"], string> = {
  none: "Günlük limit hesaplanamadı",
  tight: "Günlük alan dar",
  moderate: "Günlük alan kontrollü",
  comfortable: "Günlük alan rahat",
};

const trendFallbackLabels: Record<CoachTrendContext["reason"], string> = {
  none: "Trend sinyali mevcut",
  no_snapshot: "Trend için henüz finansal hafıza yok",
  single_snapshot: "Trend için en az 2 aylık hafıza gerekir",
};

function buildWarningLabel(summary: CoachInputSummary) {
  const totalSignals = summary.warningCount + summary.criticalReasonCount;

  if (totalSignals === 0) {
    return "Acil uyarı sinyali yok";
  }

  if (summary.criticalReasonCount > 0) {
    return "Kritik neden içeren uyarılar var";
  }

  return "Dikkat gerektiren uyarılar var";
}

function buildMemoryStatus(context: CoachContext) {
  if (!context.memory.hasAnySnapshot) {
    return "Henüz finansal hafıza kaydı yok; yorum bu ayın hesaplama özetine dayanıyor.";
  }

  if (!context.memory.hasEnoughHistory) {
    return "Finansal hafıza başladı; güvenilir trend için daha fazla aylık kayıt gerekir.";
  }

  return "Finansal hafıza, geçmiş aylarla karşılaştırma sinyali sağlıyor.";
}

function buildTrendLabels(trends: CoachTrendContext) {
  if (!trends.hasEnoughHistory) {
    return [trendFallbackLabels[trends.reason]];
  }

  return trends.labels.slice(0, 3);
}

function buildRateContext(summary: CoachInputSummary) {
  if (summary.rateContext.isFallback) {
    return "Bazı faiz bilgileri güvenli varsayılan bağlamla değerlendirildi.";
  }

  if (summary.topDebtRateBand === "none") {
    return "Faiz baskısı için yeterli oran bilgisi yok.";
  }

  return "Faiz baskısı, girilen veya güncel referans oranlardan üretilen sade sinyalle değerlendirildi.";
}

export function buildCoachEvidenceSummary(context: CoachContext): CoachEvidenceSummary {
  return {
    calculationItems: [
      {
        label: "Risk seviyesi",
        value: riskLabels[context.summary.riskLevel] ?? "Risk seviyesi hesaplandı",
      },
      {
        label: "Yaşam bütçesi",
        value: survivalBudgetLabels[context.summary.survivalBudgetDirection],
      },
      {
        label: "Günlük harcama alanı",
        value: dailyLimitLabels[context.summary.dailyLimitBand],
      },
      {
        label: "Uyarı durumu",
        value: buildWarningLabel(context.summary),
      },
    ],
    memoryStatus: buildMemoryStatus(context),
    trendLabels: buildTrendLabels(context.trends),
    recommendationTitles: context.recommendations.items.slice(0, 3).map((recommendation) => recommendation.title),
    rateContext: buildRateContext(context.summary),
    privacyNote,
  };
}
