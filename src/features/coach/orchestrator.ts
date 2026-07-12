import "server-only";

import { createHash } from "node:crypto";
import { getCachedCoachInsight, setCachedCoachInsight } from "./cache";
import { buildCoachContext, buildCoachContextFromSummary, buildCoachInputSummary } from "./context-builder";
import { analyzeCoachRecommendations } from "./recommendation-analyzer";
import { analyzeCoachTrends } from "./trend-analyzer";
import { coachInsightSchema, type AIProviderName, type CoachContext, type CoachInputSummary, type CoachInsight } from "./types";
import { recordAIRequest, recordCacheHit, recordCacheMiss, recordFallback } from "./usage-metrics";
import { geminiProvider } from "./providers/gemini-provider";
import { mockProvider } from "./providers/mock-provider";
import { openAIProvider } from "./providers/openai-provider";
import {
  anthropicProvider,
  customOpenAICompatibleProvider,
  lmStudioProvider,
  ollamaProvider,
  openRouterProvider,
} from "./providers/server-providers";
import type { AIProvider } from "./providers/types";

export { buildCoachContext, buildCoachInputSummary };

function parseProviderName(value: string | undefined): AIProviderName {
  if (
    value === "openai" ||
    value === "gemini" ||
    value === "mock" ||
    value === "anthropic" ||
    value === "openrouter" ||
    value === "ollama" ||
    value === "lm-studio" ||
    value === "custom-openai-compatible"
  ) {
    return value;
  }

  return "mock";
}

export function selectAIProvider(): AIProvider {
  const providerName = parseProviderName(process.env.AI_PROVIDER);

  if (providerName === "openai") {
    return openAIProvider;
  }

  if (providerName === "gemini") {
    return geminiProvider;
  }

  if (providerName === "anthropic") return anthropicProvider;
  if (providerName === "openrouter") return openRouterProvider;
  if (providerName === "ollama") return ollamaProvider;
  if (providerName === "lm-studio") return lmStudioProvider;
  if (providerName === "custom-openai-compatible") return customOpenAICompatibleProvider;

  return mockProvider;
}

function isCoachContext(input: CoachContext | CoachInputSummary): input is CoachContext {
  return "summary" in input && "memory" in input && input.version === "coach-context-v1";
}

function normalizeCoachContext(input: CoachContext | CoachInputSummary): CoachContext {
  if (!isCoachContext(input)) {
    return buildCoachContextFromSummary(input);
  }

  const trends = input.trends ?? analyzeCoachTrends(null);
  const recommendations = input.recommendations ?? analyzeCoachRecommendations({ summary: input.summary, memory: input.memory, trends });

  return {
    ...input,
    trends,
    recommendations,
  };
}

export function hashCoachInputSummary(input: CoachInputSummary): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function hashCoachContext(input: CoachContext): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: input.version,
        summary: input.summary,
        memory: input.memory,
        trends: input.trends,
        recommendations: input.recommendations,
      }),
    )
    .digest("hex");
}

function selectedModel(provider: AIProvider): string {
  const envNames: Partial<Record<AIProviderName, string>> = {
    openai: "OPENAI_MODEL",
    gemini: "GEMINI_MODEL",
    anthropic: "ANTHROPIC_MODEL",
    openrouter: "OPENROUTER_MODEL",
    ollama: "OLLAMA_MODEL",
    "lm-studio": "LM_STUDIO_MODEL",
    "custom-openai-compatible": "CUSTOM_AI_MODEL",
  };
  const envName = envNames[provider.name];
  return (envName ? process.env[envName] : undefined) || provider.descriptor.defaultModel || "default";
}

function isWithinCostControls(input: CoachContext, provider: AIProvider, model: string): boolean {
  const maxSummaryChars = Number(process.env.AI_MAX_INPUT_SUMMARY_CHARS ?? "4000");
  const dailyLimit = Number(process.env.AI_DAILY_REQUEST_LIMIT ?? "20");
  const monthlyBudgetLimitTry = Number(process.env.AI_MONTHLY_BUDGET_LIMIT_TRY ?? "100");
  const usage = provider.estimateUsage({ context: input, model });

  return JSON.stringify(input).length <= maxSummaryChars && dailyLimit > 0 && monthlyBudgetLimitTry >= 0 && usage.estimatedCostKurus <= monthlyBudgetLimitTry * 100;
}

export async function generateCoachInsight(input: CoachContext | CoachInputSummary): Promise<CoachInsight> {
  const context = normalizeCoachContext(input);
  const selectedProvider = selectAIProvider();
  const model = selectedModel(selectedProvider);
  const provider =
    selectedProvider.name === "mock" || (selectedProvider.isConfigured() && isWithinCostControls(context, selectedProvider, model))
      ? selectedProvider
      : mockProvider;
  const inputHash = hashCoachContext(context);
  const cacheScope = `${provider.name}:${selectedModel(provider)}:server`;
  const cached = getCachedCoachInsight(cacheScope, inputHash);

  if (cached) {
    recordCacheHit(provider.name);
    return cached;
  }

  recordCacheMiss(provider.name);
  const startedAt = performance.now();

  try {
    const insight = await provider.generateCoachInsight(context);
    const parsed = coachInsightSchema.parse(insight);
    recordAIRequest(provider.name, performance.now() - startedAt);

    if (parsed.providerMode === "fallback" || parsed.provider === "mock") {
      recordFallback(selectedProvider.name);
    }

    setCachedCoachInsight(cacheScope, inputHash, parsed);
    return parsed;
  } catch {
    recordFallback(selectedProvider.name);
    const fallback = await mockProvider.generateCoachInsight(context);
    const parsedFallback = coachInsightSchema.parse({
      ...fallback,
      providerMode: selectedProvider.name === "mock" ? "mock" : "fallback",
    });
    recordAIRequest(mockProvider.name, performance.now() - startedAt);
    setCachedCoachInsight(cacheScope, inputHash, parsedFallback);
    return parsedFallback;
  }
}
