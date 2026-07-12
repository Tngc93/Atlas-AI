import "server-only";

import { GoogleGenAI, Type, type GenerateContentResponse, type Schema } from "@google/genai";
import { composeCoachSections } from "../composer";
import { runCoachAgents } from "../agents";
import { buildGeminiSystemPrompt, buildGeminiUserPrompt } from "../prompt-builder";
import { coachInsightSchema, geminiCoachResponseSchema, type CoachContext, type GeminiCoachResponse } from "../types";
import { EDUCATIONAL_CAVEAT, mockProvider } from "./mock-provider";
import { createServerCredential, type ProviderRequest } from "./contracts";
import { getProviderDescriptor } from "./registry";
import type { AIProvider } from "./types";

type GeminiClient = {
  models: {
    generateContent: (params: {
      model: string;
      contents: string;
      config: {
        systemInstruction: string;
        responseMimeType: string;
        responseSchema: Schema;
        temperature: number;
        maxOutputTokens: number;
        abortSignal: AbortSignal;
      };
    }) => Promise<Pick<GenerateContentResponse, "text">>;
  };
};

let clientFactory: ((apiKey: string) => GeminiClient) | null = null;

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_RETRY_COUNT = 2;

const geminiResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    risks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    priority: {
      type: Type.STRING,
      enum: ["LOW", "MEDIUM", "HIGH"],
    },
    confidence: {
      type: Type.NUMBER,
      minimum: 0,
      maximum: 1,
    },
  },
  required: ["summary", "strengths", "risks", "recommendations", "priority", "confidence"],
  propertyOrdering: ["summary", "strengths", "risks", "recommendations", "priority", "confidence"],
};

function createGeminiClient(apiKey: string): GeminiClient {
  if (clientFactory) {
    return clientFactory(apiKey);
  }

  return new GoogleGenAI({ apiKey }) as GeminiClient;
}

function estimateUsage(request: ProviderRequest) {
  const estimatedInputTokens = Math.ceil((buildGeminiSystemPrompt().length + buildGeminiUserPrompt(request.context).length) / 4);
  const estimatedOutputTokens = 260;

  return {
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedCostKurus: Math.max(1, Math.ceil((estimatedInputTokens + estimatedOutputTokens) / 1000)),
  };
}

function parseTimeoutMs() {
  const value = Number(process.env.GEMINI_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS;
}

function parseRetryCount() {
  const value = Number(process.env.GEMINI_RETRY_COUNT ?? DEFAULT_RETRY_COUNT);
  return Number.isFinite(value) && value >= 0 ? Math.min(Math.floor(value), 5) : DEFAULT_RETRY_COUNT;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeGeminiFailureReason(error: unknown) {
  if (!(error instanceof Error)) {
    return "unknown_error";
  }

  if (error.message === "timeout" || error.message === "missing_api_key" || error.message === "empty_response") {
    return error.message;
  }

  if (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED")) {
    return "quota_exceeded";
  }

  if (error instanceof SyntaxError || error.message.includes("JSON")) {
    return "invalid_json";
  }

  return "provider_error";
}

function safeLogGeminiFailure(error: unknown) {
  console.warn("[GeminiProvider] Mock fallback devreye girdi.", { reason: safeGeminiFailureReason(error) });
}

async function withTimeout<T>(task: (signal: AbortSignal) => Promise<T>, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new Error("timeout"));
    }, timeoutMs);
  });

  try {
    return await Promise.race([task(controller.signal), timeoutPromise]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

function parseGeminiJson(text: string | undefined): GeminiCoachResponse {
  if (!text) {
    throw new Error("empty_response");
  }

  const parsed = JSON.parse(text);
  return geminiCoachResponseSchema.parse(parsed);
}

function priorityToRisk(priority: GeminiCoachResponse["priority"]) {
  if (priority === "HIGH") {
    return "Yüksek";
  }

  if (priority === "MEDIUM") {
    return "Orta";
  }

  return "Düşük";
}

function buildGeminiInsight(input: CoachContext, response: GeminiCoachResponse, model: string) {
  const usage = estimateUsage({ context: input, model });
  const sections = composeCoachSections(runCoachAgents(input.summary));

  const risks = response.risks.length > 0 ? response.risks : sections.risks.map((risk) => risk.finding);
  const strengths = response.strengths.length > 0 ? response.strengths : sections.insights.map((insight) => insight.finding);

  return coachInsightSchema.parse({
    summary: response.summary,
    riskExplanation: `Gemini öncelik değerlendirmesi: ${priorityToRisk(response.priority)}. Bu yorum yalnızca finans motorunun özetlediği risk sinyallerini açıklar.`,
    recommendedActions: response.recommendations.slice(0, 5),
    questionsToReview: [
      "Bu ay yaşam bütçesi eşiği korunuyor mu?",
      "Asgari ödemeler ve son ödeme tarihleri güvence altında mı?",
    ],
    sections: {
      ...sections,
      risks: risks.slice(0, 5).map((risk, index) => ({
        title: index === 0 ? "Riskler" : `Risk ${index + 1}`,
        finding: risk,
        why: "Çünkü Gemini yalnızca deterministik finans motorunun gönderdiği özet risk sinyallerini yorumladı.",
      })),
      insights: strengths.slice(0, 5).map((strength, index) => ({
        title: index === 0 ? "İçgörüler" : `İçgörü ${index + 1}`,
        finding: strength,
        why: "Çünkü bu gözlem, hesaplama motorunun kişisel veri azaltılmış özetinden türetildi.",
      })),
      coachComment: {
        title: "Koç yorumu",
        comment: response.summary,
        why: `Çünkü model güven skoru ${Math.round(response.confidence * 100)}% olan yapılandırılmış bir yorum döndürdü; finansal hesaplama yine uygulama motoruna aittir.`,
      },
    },
    caveats: EDUCATIONAL_CAVEAT,
    model,
    isPlaceholder: false,
    provider: "gemini",
    providerMode: "live",
    usage,
  });
}

async function requestGemini(input: CoachContext, apiKey = process.env.GEMINI_API_KEY, requestedModel?: string) {

  if (!apiKey) {
    throw new Error("missing_api_key");
  }

  const model = requestedModel || process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const client = createGeminiClient(apiKey);
  const timeoutMs = parseTimeoutMs();
  const retryCount = parseRetryCount();
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const response = await withTimeout(
        (signal) =>
          client.models.generateContent({
            model,
            contents: buildGeminiUserPrompt(input),
            config: {
              systemInstruction: buildGeminiSystemPrompt(),
              responseMimeType: "application/json",
              responseSchema: geminiResponseSchema,
              temperature: 0.2,
              maxOutputTokens: 700,
              abortSignal: signal,
            },
          }),
        timeoutMs,
      );

      return buildGeminiInsight(input, parseGeminiJson(response.text), model);
    } catch (error) {
      lastError = error;

      if (attempt < retryCount) {
        await sleep(250 * 2 ** attempt);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("gemini_failed");
}

export function setGeminiClientFactoryForTests(factory: ((apiKey: string) => GeminiClient) | null) {
  clientFactory = factory;
}

export const geminiProvider: AIProvider = {
  name: "gemini",
  mode: "live",
  descriptor: getProviderDescriptor("gemini"),
  isConfigured: () => Boolean(process.env.GEMINI_API_KEY),
  estimateUsage,
  getStatus: (context) => (context.credential.readSecret() ? "configured" : "not-configured"),
  async generateInsight(request, context) {
    return requestGemini(request.context, context.credential.readSecret() ?? undefined, request.model);
  },
  async generateCoachInsight(input: CoachContext) {
    try {
      return await this.generateInsight(
        { context: input, model: process.env.GEMINI_MODEL || DEFAULT_MODEL },
        {
          credential: createServerCredential("gemini", () => process.env.GEMINI_API_KEY),
          signal: new AbortController().signal,
        },
      );
    } catch (error) {
      safeLogGeminiFailure(error);
      return {
        ...(await mockProvider.generateCoachInsight(input)),
        provider: "mock",
        providerMode: "fallback",
        model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      };
    }
  },
};
