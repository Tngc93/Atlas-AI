import { composeCoachSections } from "../composer";
import { runCoachAgents } from "../agents";
import {
  coachInsightSchema,
  providerCoachResponseSchema,
  type AIProviderMode,
  type AIProviderName,
  type AIUsageEstimate,
  type CoachContext,
  type ProviderCoachResponse,
} from "../types";
import { EDUCATIONAL_CAVEAT } from "./caveats";

export function parseProviderJson(text: string | undefined): ProviderCoachResponse {
  if (!text) {
    throw new Error("empty_response");
  }

  const normalized = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return providerCoachResponseSchema.parse(JSON.parse(normalized));
}

function priorityToRisk(priority: ProviderCoachResponse["priority"]) {
  return priority === "HIGH" ? "Yüksek" : priority === "MEDIUM" ? "Orta" : "Düşük";
}

export function buildLiveProviderInsight(params: {
  input: CoachContext;
  response: ProviderCoachResponse;
  model: string;
  provider: AIProviderName;
  providerName: string;
  mode?: AIProviderMode;
  usage: AIUsageEstimate;
}) {
  const { input, response, model, provider, providerName, usage } = params;
  const sections = composeCoachSections(runCoachAgents(input.summary));
  const risks = response.risks.length > 0 ? response.risks : sections.risks.map((risk) => risk.finding);
  const strengths = response.strengths.length > 0 ? response.strengths : sections.insights.map((insight) => insight.finding);

  return coachInsightSchema.parse({
    summary: response.summary,
    riskExplanation: `${providerName} öncelik değerlendirmesi: ${priorityToRisk(response.priority)}. Bu yorum yalnızca finans motorunun özetlediği risk sinyallerini açıklar.`,
    recommendedActions: response.recommendations.slice(0, 5),
    questionsToReview: ["Bu ay yaşam bütçesi eşiği korunuyor mu?", "Asgari ödemeler ve son ödeme tarihleri güvence altında mı?"],
    sections: {
      ...sections,
      risks: risks.slice(0, 5).map((risk, index) => ({
        title: index === 0 ? "Riskler" : `Risk ${index + 1}`,
        finding: risk,
        why: `Çünkü ${providerName} yalnızca deterministik finans motorunun gönderdiği özet risk sinyallerini yorumladı.`,
      })),
      insights: strengths.slice(0, 5).map((strength, index) => ({
        title: index === 0 ? "İçgörüler" : `İçgörü ${index + 1}`,
        finding: strength,
        why: "Çünkü bu gözlem, hesaplama motorunun kişisel veri azaltılmış özetinden türetildi.",
      })),
      coachComment: {
        title: "Koç yorumu",
        comment: response.summary,
        why: "Bu yapılandırılmış yorum deterministik finans bağlamını açıklar; finansal hesaplama yine uygulama motoruna aittir.",
      },
    },
    caveats: EDUCATIONAL_CAVEAT,
    model,
    isPlaceholder: false,
    provider,
    providerMode: params.mode ?? "live",
    usage,
  });
}
