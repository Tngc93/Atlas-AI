import type { AIProviderName, CoachInsight } from "./types";

type CacheKey = `${AIProviderName}:${string}`;

const insightCache = new Map<CacheKey, CoachInsight>();

export function getCachedCoachInsight(provider: AIProviderName, inputHash: string): CoachInsight | null {
  return insightCache.get(`${provider}:${inputHash}`) ?? null;
}

export function setCachedCoachInsight(provider: AIProviderName, inputHash: string, insight: CoachInsight) {
  insightCache.set(`${provider}:${inputHash}`, insight);
}

export function clearCoachInsightCache() {
  insightCache.clear();
}
