import { describe, expect, it, vi } from "vitest";

const financeMock = vi.hoisted(() => ({
  getMonthlyFinancePlanSnapshot: vi.fn(),
}));

const ratesMock = vi.hoisted(() => ({
  getLatestInterestRateSnapshot: vi.fn(),
}));

const orchestratorMock = vi.hoisted(() => ({
  buildCoachContext: vi.fn(),
  generateCoachInsight: vi.fn(),
}));

const memoryRepositoryMock = vi.hoisted(() => ({
  getMemoryReportData: vi.fn(),
}));

const memoryServiceMock = vi.hoisted(() => ({
  buildFinancialMemoryReport: vi.fn(),
}));

vi.mock("@/features/finance/data-service", () => financeMock);
vi.mock("@/features/rates/service", () => ratesMock);
vi.mock("@/features/coach/orchestrator", () => orchestratorMock);
vi.mock("@/features/memory/repository", () => memoryRepositoryMock);
vi.mock("@/features/memory/service", () => memoryServiceMock);

describe("/api/coach", () => {
  it("builds coach input server-side instead of trusting client payload", async () => {
    const monthlyPlan = { monthLabel: "Temmuz 2026" };
    const rateSnapshot = { source: "fallback" };
    const memoryRecords = [{ periodMonth: "2026-07" }];
    const memoryReport = { hasAnySnapshot: true, snapshotCount: 1 };
    const context = {
      version: "coach-context-v1",
      summary: { month: "Temmuz 2026", activeDebtCount: 0 },
      memory: { hasAnySnapshot: true, snapshotCount: 1 },
      trends: { hasEnoughHistory: false, reason: "single_snapshot" },
      recommendations: { hasRecommendations: true, items: [] },
    };
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
    memoryRepositoryMock.getMemoryReportData.mockResolvedValue(memoryRecords);
    memoryServiceMock.buildFinancialMemoryReport.mockReturnValue(memoryReport);
    orchestratorMock.buildCoachContext.mockReturnValue(context);
    orchestratorMock.generateCoachInsight.mockResolvedValue(insight);

    const { POST } = await import("./route");
    const response = await POST();
    const body = await response.json();

    expect(financeMock.getMonthlyFinancePlanSnapshot).toHaveBeenCalledWith(12);
    expect(memoryServiceMock.buildFinancialMemoryReport).toHaveBeenCalledWith(memoryRecords);
    expect(orchestratorMock.buildCoachContext).toHaveBeenCalledWith({ monthlyPlan, rateSnapshot, memoryReport });
    expect(orchestratorMock.generateCoachInsight).toHaveBeenCalledWith(context);
    expect(body.provider).toBe("mock");
  });
});
