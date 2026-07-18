import type { AIProviderName, CoachContext, CoachInsight } from "../types";
import { buildProviderSystemPrompt, buildProviderUserPrompt } from "../prompt-builder";
import type { BrowserSessionCredential } from "./contracts";
import { validateProviderBaseUrl } from "./endpoint-policy";
import { buildLiveProviderInsight, parseProviderJson } from "./insight-builder";
import { getProviderDescriptor } from "./registry";
import { executeProviderRequest } from "./request-policy";
import type { BrowserProviderFlags } from "./browser-flags";

type BrowserProviderId = "gemini" | "openrouter" | "ollama" | "lm-studio";

export type BrowserProviderConfig = {
  providerId: BrowserProviderId;
  model: string;
  baseUrl: string;
  credential: BrowserSessionCredential;
  context: CoachContext;
  flags: BrowserProviderFlags;
};

export type BrowserConnectionConfig = Omit<BrowserProviderConfig, "context">;

const browserCache = new Map<string, CoachInsight>();

async function hashBrowserContext(context: CoachContext): Promise<string> {
  const serialized = JSON.stringify({
    version: context.version,
    summary: context.summary,
    memory: context.memory,
    trends: context.trends,
    recommendations: context.recommendations,
    chatRequest: context.chatRequest,
  });
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(serialized));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function estimateUsage(context: CoachContext) {
  const estimatedInputTokens = Math.ceil(
    (buildProviderSystemPrompt(context.chatRequest?.language).length + buildProviderUserPrompt(context).length) / 4,
  );
  return { estimatedInputTokens, estimatedOutputTokens: 260, estimatedCostKurus: 0 };
}

function extractOpenAIContent(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices)) return undefined;
  const first = choices[0] as { message?: { content?: unknown } } | undefined;
  return typeof first?.message?.content === "string" ? first.message.content : undefined;
}

function extractGeminiContent(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates)) return undefined;
  const first = candidates[0] as { content?: { parts?: Array<{ text?: unknown }> } } | undefined;
  const text = first?.content?.parts?.[0]?.text;
  return typeof text === "string" ? text : undefined;
}

async function callBrowserProvider(config: BrowserProviderConfig, baseUrl: string, signal: AbortSignal) {
  const secret = config.credential.readSecret();
  const prompt = buildProviderUserPrompt(config.context);

  if (config.providerId === "gemini") {
    if (!config.flags.geminiEnabled || !secret) throw new Error("missing_api_key");
    const response = await fetch(`${baseUrl}/v1beta/models/${encodeURIComponent(config.model)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": secret },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildProviderSystemPrompt(config.context.chatRequest?.language) }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 700 },
      }),
      signal,
    });
    if (!response.ok) throw new Error(`provider_http_${response.status}`);
    return parseProviderJson(extractGeminiContent(await response.json()));
  }

  if (config.providerId === "openrouter" && !config.flags.openRouterEnabled) throw new Error("browser_provider_disabled");
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (secret) headers.authorization = `Bearer ${secret}`;
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: "system", content: buildProviderSystemPrompt(config.context.chatRequest?.language) },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
    signal,
  });
  if (!response.ok) throw new Error(`provider_http_${response.status}`);
  return parseProviderJson(extractOpenAIContent(await response.json()));
}

function isProviderEnabled(providerId: BrowserProviderId, flags: BrowserProviderFlags) {
  if (providerId === "gemini") return flags.geminiEnabled;
  if (providerId === "openrouter") return flags.openRouterEnabled;
  return flags.localEnabled;
}

export async function testBrowserProviderConnection(config: BrowserConnectionConfig): Promise<void> {
  const providerEnabled = isProviderEnabled(config.providerId, config.flags);
  const baseUrl = validateProviderBaseUrl(config.baseUrl, { providerId: config.providerId, providerEnabled });
  const secret = config.credential.readSecret();

  await executeProviderRequest(async (signal) => {
    let endpoint: string;
    const headers: Record<string, string> = {};

    if (config.providerId === "gemini") {
      if (!secret) throw new Error("missing_api_key");
      endpoint = `${baseUrl}/v1beta/models`;
      headers["x-goog-api-key"] = secret;
    } else if (config.providerId === "openrouter") {
      if (!secret) throw new Error("missing_api_key");
      endpoint = `${baseUrl}/key`;
      headers.authorization = `Bearer ${secret}`;
    } else {
      endpoint = `${baseUrl}/models`;
      if (secret) headers.authorization = `Bearer ${secret}`;
    }

    const response = await fetch(endpoint, { method: "GET", headers, signal });
    if (!response.ok) throw new Error(`provider_http_${response.status}`);
  }, { timeoutMs: 8_000, retryCount: 0 });
}

export async function generateBrowserCoachInsight(config: BrowserProviderConfig): Promise<CoachInsight> {
  const descriptor = getProviderDescriptor(config.providerId);
  const providerEnabled = isProviderEnabled(config.providerId, config.flags);
  const baseUrl = validateProviderBaseUrl(config.baseUrl, { providerId: config.providerId, providerEnabled });
  const contextHash = await hashBrowserContext(config.context);
  const cacheKey = `${config.credential.sessionId}:${config.providerId}:${config.model}:${baseUrl}:${contextHash}`;
  const cached = browserCache.get(cacheKey);
  if (cached) return cached;

  const response = await executeProviderRequest((signal) => callBrowserProvider(config, baseUrl, signal), {
    timeoutMs: 12_000,
    retryCount: 0,
  });
  const insight = buildLiveProviderInsight({
    input: config.context,
    response,
    model: config.model,
    provider: config.providerId as AIProviderName,
    providerName: descriptor.displayName,
    usage: estimateUsage(config.context),
  });
  browserCache.set(cacheKey, insight);
  return insight;
}

export function clearBrowserCoachCache(sessionId?: string) {
  if (!sessionId) {
    browserCache.clear();
    return;
  }

  for (const key of browserCache.keys()) {
    if (key.startsWith(`${sessionId}:`)) browserCache.delete(key);
  }
}
