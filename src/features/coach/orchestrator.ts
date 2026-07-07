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
import type { AIProvider } from "./providers/types";

export { buildCoachContext, buildCoachInputSummary };

function parseProviderName(value: string | undefined): AIProviderName {
  if (value === "openai" || value === "gemini" || value === "mock") {
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

function isWithinCostControls(input: CoachContext, provider: AIProvider): boolean {
  const maxSummaryChars = Number(process.env.AI_MAX_INPUT_SUMMARY_CHARS ?? "4000");
  const dailyLimit = Number(process.env.AI_DAILY_REQUEST_LIMIT ?? "20");
  const monthlyBudgetLimitTry = Number(process.env.AI_MONTHLY_BUDGET_LIMIT_TRY ?? "100");
  const usage = provider.estimateUsage(input);

  return JSON.stringify(input).length <= maxSummaryChars && dailyLimit > 0 && monthlyBudgetLimitTry >= 0 && usage.estimatedCostKurus <= monthlyBudgetLimitTry * 100;
}

export async function generateCoachInsight(input: CoachContext | CoachInputSummary): Promise<CoachInsight> {
  const context = normalizeCoachContext(input);
  const selectedProvider = selectAIProvider();
  const provider =
    selectedProvider.name === "mock" || (selectedProvider.isConfigured() && isWithinCostControls(context, selectedProvider))
      ? selectedProvider
      : mockProvider;
  const inputHash = hashCoachContext(context);
  const cached = getCachedCoachInsight(provider.name, inputHash);

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

    setCachedCoachInsight(provider.name, inputHash, parsed);
    return parsed;
  } catch {
    recordFallback(selectedProvider.name);
    const fallback = await mockProvider.generateCoachInsight(context);
    const parsedFallback = coachInsightSchema.parse({
      ...fallback,
      providerMode: selectedProvider.name === "mock" ? "mock" : "fallback",
    });
    recordAIRequest(mockProvider.name, performance.now() - startedAt);
    setCachedCoachInsight(provider.name, inputHash, parsedFallback);
    return parsedFallback;
  }
}
