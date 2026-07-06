import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { clearCoachInsightCache } from "../cache";
import { generateCoachInsight } from "../orchestrator";
import { resetAIUsageMetrics, getAIUsageMetrics } from "../usage-metrics";
import { geminiProvider, setGeminiClientFactoryForTests } from "./gemini-provider";
import type { CoachInputSummary } from "../types";

const sampleInput: CoachInputSummary = {
  month: "Temmuz 2026",
  riskLevel: "medium",
  salaryBand: "medium",
  mandatoryExpenseShare: 0.45,
  minimumPaymentShare: 0.2,
  survivalBudgetDirection: "thin",
  dailyLimitBand: "moderate",
  activeDebtCount: 2,
  highInterestDebtCount: 1,
  topDebtRateBand: "high",
  warningCount: 2,
  criticalReasonCount: 0,
  actionTitles: ["Asgari ödemeleri güvenceye al"],
  rateContext: {
    source: "fallback",
    providerStatus: "fallback",
    isFallback: true,
  },
};

function validGeminiText() {
  return JSON.stringify({
    summary: "Bu ay nakit akışı dikkatli yönetilmeli, ancak plan uygulanabilir görünüyor.",
    strengths: ["Asgari ödeme sinyalleri takip ediliyor."],
    risks: ["Yaşam bütçesi daralabilir."],
    recommendations: ["Önce asgari ödemeleri güvenceye al."],
    priority: "MEDIUM",
    confidence: 0.82,
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  setGeminiClientFactoryForTests(null);
  clearCoachInsightCache();
  resetAIUsageMetrics();
});

describe("Gemini provider", () => {
  it("uses Gemini SDK when configured and validates JSON output", async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: validGeminiText() });
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("GEMINI_MODEL", "gemini-2.5-flash");
    setGeminiClientFactoryForTests(() => ({ models: { generateContent } }));

    const insight = await geminiProvider.generateCoachInsight(sampleInput);

    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-2.5-flash",
        contents: expect.stringContaining("finansal özet"),
        config: expect.objectContaining({
          systemInstruction: expect.stringContaining("Deterministik Finans Motoru"),
          responseMimeType: "application/json",
          responseSchema: expect.any(Object),
        }),
      }),
    );
    expect(insight.provider).toBe("gemini");
    expect(insight.providerMode).toBe("live");
    expect(insight.summary).toContain("nakit akışı");
  });

  it("falls back to mock when API key is missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const insight = await geminiProvider.generateCoachInsight(sampleInput);

    expect(insight.provider).toBe("mock");
    expect(insight.providerMode).toBe("fallback");
    expect(warn).toHaveBeenCalledWith("[GeminiProvider] Mock fallback devreye girdi.", { reason: "missing_api_key" });
  });

  it("retries once before returning a valid Gemini response", async () => {
    const generateContent = vi.fn().mockRejectedValueOnce(new Error("temporary")).mockResolvedValueOnce({ text: validGeminiText() });
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("GEMINI_RETRY_COUNT", "1");
    setGeminiClientFactoryForTests(() => ({ models: { generateContent } }));

    const insight = await geminiProvider.generateCoachInsight(sampleInput);

    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(insight.provider).toBe("gemini");
  });

  it("falls back to mock after timeout", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("GEMINI_TIMEOUT_MS", "5");
    vi.stubEnv("GEMINI_RETRY_COUNT", "0");
    setGeminiClientFactoryForTests(() => ({
      models: {
        generateContent: vi.fn(() => new Promise(() => undefined)),
      },
    }));

    const insight = await geminiProvider.generateCoachInsight(sampleInput);

    expect(insight.provider).toBe("mock");
    expect(insight.providerMode).toBe("fallback");
  });

  it("falls back to mock when Gemini returns invalid JSON", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("GEMINI_RETRY_COUNT", "0");
    setGeminiClientFactoryForTests(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({ text: "Bu JSON değil." }),
      },
    }));

    const insight = await geminiProvider.generateCoachInsight(sampleInput);

    expect(insight.provider).toBe("mock");
    expect(insight.providerMode).toBe("fallback");
  });
});

describe("AI coach cache", () => {
  it("does not call Gemini twice for the same minimized finance summary", async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: validGeminiText() });
    vi.stubEnv("AI_PROVIDER", "gemini");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    setGeminiClientFactoryForTests(() => ({ models: { generateContent } }));

    await generateCoachInsight(sampleInput);
    await generateCoachInsight(sampleInput);

    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(getAIUsageMetrics()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          provider: "gemini",
          requestCount: 1,
          fallbackCount: 0,
          cacheHitRate: 0.5,
        }),
      ]),
    );
  });
});
