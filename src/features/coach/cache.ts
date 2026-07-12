import type { CoachInsight } from "./types";

type CacheKey = `${string}:${string}`;

const insightCache = new Map<CacheKey, CoachInsight>();

export function getCachedCoachInsight(scope: string, inputHash: string): CoachInsight | null {
  return insightCache.get(`${scope}:${inputHash}`) ?? null;
}

export function setCachedCoachInsight(scope: string, inputHash: string, insight: CoachInsight) {
  insightCache.set(`${scope}:${inputHash}`, insight);
}

export function clearCoachInsightCache() {
  insightCache.clear();
}
