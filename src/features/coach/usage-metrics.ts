import type { AIProviderName } from "./types";

type ProviderMetric = {
  provider: AIProviderName;
  day: string;
  requestCount: number;
  totalLatencyMs: number;
  cacheHits: number;
  cacheMisses: number;
  fallbackCount: number;
};

const metrics = new Map<AIProviderName, ProviderMetric>();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getMetric(provider: AIProviderName): ProviderMetric {
  const day = todayKey();
  const current = metrics.get(provider);

  if (current && current.day === day) {
    return current;
  }

  const metric: ProviderMetric = {
    provider,
    day,
    requestCount: 0,
    totalLatencyMs: 0,
    cacheHits: 0,
    cacheMisses: 0,
    fallbackCount: 0,
  };
  metrics.set(provider, metric);
  return metric;
}

export function recordAIRequest(provider: AIProviderName, latencyMs: number) {
  const metric = getMetric(provider);
  metric.requestCount += 1;
  metric.totalLatencyMs += Math.max(0, Math.round(latencyMs));
}

export function recordCacheHit(provider: AIProviderName) {
  getMetric(provider).cacheHits += 1;
}

export function recordCacheMiss(provider: AIProviderName) {
  getMetric(provider).cacheMisses += 1;
}

export function recordFallback(provider: AIProviderName) {
  getMetric(provider).fallbackCount += 1;
}

export function getAIUsageMetrics() {
  return Array.from(metrics.values()).map((metric) => {
    const totalCacheLookups = metric.cacheHits + metric.cacheMisses;

    return {
      provider: metric.provider,
      day: metric.day,
      requestCount: metric.requestCount,
      averageLatencyMs: metric.requestCount > 0 ? Math.round(metric.totalLatencyMs / metric.requestCount) : 0,
      cacheHitRate: totalCacheLookups > 0 ? metric.cacheHits / totalCacheLookups : 0,
      fallbackCount: metric.fallbackCount,
    };
  });
}

export function resetAIUsageMetrics() {
  metrics.clear();
}
