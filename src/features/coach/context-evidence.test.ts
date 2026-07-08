import { describe, expect, it } from "vitest";
import { buildCoachEvidenceSummary } from "./context-evidence";
import type { CoachContext } from "./types";

function makeContext(overrides: Partial<CoachContext> = {}): CoachContext {
  return {
    version: "coach-context-v1",
    builtAtIso: "2026-07-08T00:00:00.000Z",
    summary: {
      month: "Temmuz 2026",
      riskLevel: "medium",
      salaryBand: "medium",
      mandatoryExpenseShare: 0.42,
      minimumPaymentShare: 0.18,
      survivalBudgetDirection: "thin",
      dailyLimitBand: "tight",
      activeDebtCount: 2,
      highInterestDebtCount: 1,
      topDebtRateBand: "high",
      warningCount: 1,
      criticalReasonCount: 0,
      actionTitles: ["Asgari ödemeleri güvenceye al"],
      rateContext: {
        source: "TCMB",
        providerStatus: "live",
        isFallback: false,
      },
    },
    memory: {
      hasAnySnapshot: true,
      hasEnoughHistory: true,
      snapshotCount: 3,
      latestPeriodMonth: "2026-07",
      highRiskMonthCount: 1,
      cashSqueezeCount: 1,
      totalDebtTrend: "decreasing",
      survivalBudgetTrend: "improving",
      planAdherenceScore: 70,
    },
    trends: {
      hasEnoughHistory: true,
      reason: "none",
      windowMonths: 3,
      availableMonths: 3,
      incomeTrend: "flat",
      mandatoryExpenseTrend: "decreasing",
      totalDebtTrend: "decreasing",
      activeDebtTrend: "decreasing",
      survivalBudgetTrend: "improving",
      minimumPaymentBurdenTrend: "flat",
      minimumPaymentBurden: "medium",
      riskTrend: "improving",
      debtPayoffVelocity: "medium",
      cashSqueezeRecurrence: "occasional",
      highRiskMonthCount: 1,
      labels: ["Borç yükü azalıyor", "Yaşam bütçesi güçleniyor", "Risk tekrar ediyor"],
    },
    recommendations: {
      hasRecommendations: true,
      items: [
        {
          id: "prioritize-high-interest-debt",
          title: "En yüksek faizli borca öncelik ver",
          priority: "HIGH",
          category: "DEBT",
          reason: "Faiz baskısı yüksek.",
          expectedImpact: "Borç baskısını azaltmaya yardımcı olabilir.",
          confidence: 0.8,
          sourceSignals: ["Örnek Banka", "Örnek Kart", "provider_gemini", "hash_cache_key"],
        },
        {
          id: "protect-survival-budget",
          title: "Yaşam bütçesini önce koru",
          priority: "MEDIUM",
          category: "CASHFLOW",
          reason: "Yaşam bütçesi ince.",
          expectedImpact: "Nakit sıkışıklığını azaltabilir.",
          confidence: 0.74,
          sourceSignals: ["salary_8500000"],
        },
      ],
    },
    ...overrides,
  };
}

describe("coach context evidence", () => {
  it("produces simple Turkish labels from minimized coach context", () => {
    const evidence = buildCoachEvidenceSummary(makeContext());

    expect(evidence.calculationItems).toEqual(
      expect.arrayContaining([
        { label: "Risk seviyesi", value: "Orta risk" },
        { label: "Yaşam bütçesi", value: "Yaşam bütçesi ince" },
        { label: "Günlük harcama alanı", value: "Günlük alan dar" },
        { label: "Uyarı durumu", value: "Dikkat gerektiren uyarılar var" },
      ]),
    );
    expect(evidence.memoryStatus).toBe("Finansal hafıza, geçmiş aylarla karşılaştırma sinyali sağlıyor.");
    expect(evidence.trendLabels).toEqual(["Borç yükü azalıyor", "Yaşam bütçesi güçleniyor", "Risk tekrar ediyor"]);
    expect(evidence.recommendationTitles).toEqual(["En yüksek faizli borca öncelik ver", "Yaşam bütçesini önce koru"]);
    expect(evidence.rateContext).toBe("Faiz baskısı, girilen veya güncel referans oranlardan üretilen sade sinyalle değerlendirildi.");
  });

  it("uses safe fallback text when memory is unavailable", () => {
    const evidence = buildCoachEvidenceSummary(
      makeContext({
        memory: {
          hasAnySnapshot: false,
          hasEnoughHistory: false,
          snapshotCount: 0,
          latestPeriodMonth: null,
          highRiskMonthCount: 0,
          cashSqueezeCount: 0,
          totalDebtTrend: "unknown",
          survivalBudgetTrend: "unknown",
          planAdherenceScore: null,
        },
        trends: {
          ...makeContext().trends,
          hasEnoughHistory: false,
          reason: "no_snapshot",
          windowMonths: null,
          availableMonths: 0,
          labels: ["Yeterli geçmiş yok"],
        },
      }),
    );

    expect(evidence.memoryStatus).toBe("Henüz finansal hafıza kaydı yok; yorum bu ayın hesaplama özetine dayanıyor.");
    expect(evidence.trendLabels).toEqual(["Trend için henüz finansal hafıza yok"]);
  });

  it("does not expose raw context, technical provider data, confidence scores or sensitive values", () => {
    const evidence = buildCoachEvidenceSummary(makeContext());
    const serialized = JSON.stringify(evidence);

    expect(serialized).not.toContain("Örnek Banka");
    expect(serialized).not.toContain("Örnek Kart");
    expect(serialized).not.toContain("provider_gemini");
    expect(serialized).not.toContain("hash_cache_key");
    expect(serialized).not.toContain("sourceSignals");
    expect(serialized).not.toContain("confidence");
    expect(serialized).not.toContain("0.8");
    expect(serialized).not.toContain("salary_8500000");
    expect(serialized).not.toContain("TCMB");
    expect(serialized).not.toContain("live");
    expect(evidence.privacyNote).toBe("Ham banka hareketleri, kart numarası, IBAN veya kişisel notlar bu yorumda kullanılmaz.");
  });
});
