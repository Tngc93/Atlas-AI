import { NormalizedProviderError, normalizeProviderError } from "./safe-errors";

export type RetryPolicy = {
  timeoutMs: number;
  retryCount: number;
  initialBackoffMs?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeProviderRequest<T>(task: (signal: AbortSignal) => Promise<T>, policy: RetryPolicy): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= policy.retryCount; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), policy.timeoutMs);

    try {
      return await task(controller.signal);
    } catch (error) {
      lastError = error;
      const normalized = normalizeProviderError(error);
      const canRetry = normalized.code !== "authentication" && normalized.code !== "configuration" && attempt < policy.retryCount;

      if (!canRetry) {
        throw normalized;
      }

      await sleep((policy.initialBackoffMs ?? 250) * 2 ** attempt);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new NormalizedProviderError("unavailable");
}
