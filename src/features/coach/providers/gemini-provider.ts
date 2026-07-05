import "server-only";

import { composeCoachSections } from "../composer";
import { runCoachAgents } from "../agents";
import { coachInsightSchema, type CoachInputSummary } from "../types";
import { EDUCATIONAL_CAVEAT, mockProvider } from "./mock-provider";
import type { AIProvider } from "./types";

export const geminiProvider: AIProvider = {
  name: "gemini",
  mode: "placeholder",
  isConfigured: () => Boolean(process.env.GEMINI_API_KEY),
  estimateUsage: mockProvider.estimateUsage,
  async generateCoachInsight(input: CoachInputSummary) {
    const usage = mockProvider.estimateUsage(input);
    const sections = composeCoachSections(runCoachAgents(input));

    return coachInsightSchema.parse({
      summary: "Gemini sağlayıcısı placeholder modda. Bu fazda gerçek API çağrısı yapılmaz ve finansal veri üçüncü partiye gönderilmez.",
      riskExplanation: "Deterministik hesaplama özeti hazırlandı, ancak gerçek Gemini entegrasyonu bilinçli olarak kapalı tutuldu.",
      recommendedActions: [
        "Mock finans koçu yorumunu kullanarak planı gözden geçir.",
        "Gerçek sağlayıcı aktivasyonundan önce API key, veri minimizasyonu ve maliyet limitlerini doğrula.",
      ],
      questionsToReview: ["Gemini aktif edildiğinde hangi özet alanların gönderilmesine izin verilecek?"],
      sections,
      caveats: EDUCATIONAL_CAVEAT,
      model: process.env.GEMINI_MODEL || "gemini-placeholder",
      isPlaceholder: true,
      provider: "gemini",
      providerMode: "placeholder",
      usage,
    });
  },
};
