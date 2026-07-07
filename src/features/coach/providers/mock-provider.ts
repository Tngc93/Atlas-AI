import "server-only";

import { composeCoachSections } from "../composer";
import { runCoachAgents } from "../agents";
import { coachInsightSchema, type AIUsageEstimate, type CoachContext } from "../types";
import type { AIProvider } from "./types";

export const EDUCATIONAL_CAVEAT =
  "Yalnızca eğitim amaçlıdır. Bu yorumlar deterministik hesaplamaların Türkçe açıklamasıdır; yatırım, hukuk, vergi veya lisanslı finansal tavsiye değildir.";

function estimateUsage(input: CoachContext): AIUsageEstimate {
  const estimatedInputTokens = Math.ceil(JSON.stringify(input).length / 4);

  return {
    estimatedInputTokens,
    estimatedOutputTokens: 180,
    estimatedCostKurus: 0,
  };
}

export const mockProvider: AIProvider = {
  name: "mock",
  mode: "mock",
  isConfigured: () => true,
  estimateUsage,
  async generateCoachInsight(input) {
    const summary = input.summary;
    const usage = estimateUsage(input);
    const sections = composeCoachSections(runCoachAgents(summary));
    const riskLabel = summary.riskLevel === "high" || summary.riskLevel === "critical" ? "yüksek" : summary.riskLevel === "medium" ? "orta" : "düşük";
    const firstAction = sections.monthlyActions[0]?.action ?? "Bu ay gelir, gider ve borç kayıtlarını gözden geçir.";

    return coachInsightSchema.parse({
      summary: `${summary.month} için risk seviyesi ${riskLabel}. Mock AI sağlayıcısı aktif; bu fazda finansal veri üçüncü partiye gönderilmez.`,
      riskExplanation:
        summary.criticalReasonCount > 0
          ? "Kritik nedenler bulunduğu için önce nakit akışını ve asgari ödeme güvenliğini kontrol et."
          : "Deterministik hesaplama motoru yükümlülükleri, yaşam bütçesini ve borç önceliğini değerlendirdi.",
      recommendedActions: [
        firstAction,
        sections.priorities[0]?.priority ?? "Önce finans motorunun belirlediği ödeme önceliğini takip et.",
        sections.decisionSimulatorPreview[1]?.interpretation ?? "Alternatifleri yalnızca deterministik plan sinyalleriyle değerlendir.",
      ],
      questionsToReview: [
        "Bu ay son ödeme tarihleri aynı haftaya sıkışıyor mu?",
        "Manuel faiz girilmemiş borçlarda gerçek banka oranını kontrol ettin mi?",
      ],
      sections,
      caveats: EDUCATIONAL_CAVEAT,
      model: "mock-finance-coach",
      isPlaceholder: true,
      provider: "mock",
      providerMode: "mock",
      usage,
    });
  },
};
