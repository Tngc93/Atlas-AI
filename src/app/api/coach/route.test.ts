import { describe, expect, it, vi } from "vitest";

const financeMock = vi.hoisted(() => ({
  getMonthlyFinancePlanSnapshot: vi.fn(),
}));

const ratesMock = vi.hoisted(() => ({
  getLatestInterestRateSnapshot: vi.fn(),
}));

const orchestratorMock = vi.hoisted(() => ({
  buildCoachInputSummary: vi.fn(),
  generateCoachInsight: vi.fn(),
}));

vi.mock("@/features/finance/data-service", () => financeMock);
vi.mock("@/features/rates/service", () => ratesMock);
vi.mock("@/features/coach/orchestrator", () => orchestratorMock);

describe("/api/coach", () => {
  it("builds coach input server-side instead of trusting client payload", async () => {
    const monthlyPlan = { monthLabel: "Temmuz 2026" };
    const rateSnapshot = { source: "fallback" };
    const summary = { month: "Temmuz 2026", activeDebtCount: 0 };
    const insight = {
      summary: "Mock koç yorumu",
      riskExplanation: "Deterministik özet kullanıldı.",
      recommendedActions: ["Kayıtları kontrol et."],
      questionsToReview: ["Eksik faiz var mı?"],
      sections: {
        financialStatus: {
          title: "Finansal Durum",
          finding: "Özet durum.",
          why: "Çünkü finans motoru özet verdi.",
        },
        risks: [
          {
            title: "Riskler",
            finding: "Risk yok.",
            why: "Çünkü uyarı yok.",
          },
        ],
        insights: [
          {
            title: "İçgörü",
            finding: "Kayıtlar izlenmeli.",
            why: "Çünkü veri kalitesi önemlidir.",
          },
        ],
        monthlyActions: [
          {
            title: "Bu Ay",
            action: "Kayıtları kontrol et.",
            why: "Çünkü eksik veri olabilir.",
          },
        ],
        priorities: [
          {
            title: "Öncelik",
            priority: "Asgari ödemeleri koru.",
            why: "Çünkü finans motoru bunu önce korur.",
          },
        ],
        expectedOutcome: {
          title: "Beklenen Sonuç",
          outcome: "Plan okunur.",
          why: "Çünkü özet hazır.",
        },
        coachComment: {
          title: "Koç Yorumu",
          comment: "Düzenli takip et.",
          why: "Çünkü ritim önemlidir.",
        },
        decisionSimulatorPreview: [
          {
            scenario: "Ek ödeme yapılmazsa",
            interpretation: "Nakit korunur.",
            why: "Çünkü ödeme ertelenir.",
          },
        ],
      },
      caveats: "Yalnızca eğitim amaçlıdır.",
      model: "mock-finance-coach",
      isPlaceholder: true,
      provider: "mock",
      providerMode: "mock",
      usage: {
        estimatedInputTokens: 10,
        estimatedOutputTokens: 20,
        estimatedCostKurus: 0,
      },
    };

    financeMock.getMonthlyFinancePlanSnapshot.mockResolvedValue({ monthlyPlan });
    ratesMock.getLatestInterestRateSnapshot.mockResolvedValue(rateSnapshot);
    orchestratorMock.buildCoachInputSummary.mockReturnValue(summary);
    orchestratorMock.generateCoachInsight.mockResolvedValue(insight);

    const { POST } = await import("./route");
    const response = await POST();
    const body = await response.json();

    expect(financeMock.getMonthlyFinancePlanSnapshot).toHaveBeenCalledWith(12);
    expect(orchestratorMock.buildCoachInputSummary).toHaveBeenCalledWith(monthlyPlan, rateSnapshot);
    expect(orchestratorMock.generateCoachInsight).toHaveBeenCalledWith(summary);
    expect(body.provider).toBe("mock");
  });
});
