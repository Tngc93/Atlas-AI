import "server-only";

import type { AIProviderName, CoachContext } from "../types";
import { buildProviderSystemPrompt, buildProviderUserPrompt } from "../prompt-builder";
import { buildLiveProviderInsight, parseProviderJson } from "./insight-builder";
import { executeProviderRequest } from "./request-policy";
import { createServerCredential, type ProviderRequest } from "./contracts";
import { getProviderDescriptor } from "./registry";
import { safeProviderLog } from "./safe-errors";
import { mockProvider } from "./mock-provider";
import type { AIProvider } from "./types";

type ServerProviderConfig = {
  id: Exclude<AIProviderName, "mock" | "gemini">;
  apiKeyEnv?: string;
  modelEnv: string;
  baseUrlEnv?: string;
  protocol: "openai-compatible" | "anthropic";
  timeoutMs?: number;
  retryCount?: number;
};

function readEnv(name: string | undefined) {
  return name ? process.env[name] : undefined;
}

function estimateUsage(request: ProviderRequest) {
  const estimatedInputTokens = Math.ceil(
    (buildProviderSystemPrompt(request.context.chatRequest?.language).length + buildProviderUserPrompt(request.context).length) / 4,
  );
  return {
    estimatedInputTokens,
    estimatedOutputTokens: 260,
    estimatedCostKurus: 1,
  };
}

function extractOpenAIContent(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices)) return undefined;
  const message = choices[0] && typeof choices[0] === "object" ? (choices[0] as { message?: unknown }).message : undefined;
  if (!message || typeof message !== "object") return undefined;
  const content = (message as { content?: unknown }).content;
  return typeof content === "string" ? content : undefined;
}

function extractAnthropicContent(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const content = (payload as { content?: unknown }).content;
  if (!Array.isArray(content)) return undefined;
  const textBlock = content.find((block) => block && typeof block === "object" && (block as { type?: unknown }).type === "text");
  const text = textBlock && typeof textBlock === "object" ? (textBlock as { text?: unknown }).text : undefined;
  return typeof text === "string" ? text : undefined;
}

export function createServerProvider(config: ServerProviderConfig): AIProvider {
  const descriptor = getProviderDescriptor(config.id);
  const credential = createServerCredential(config.id, () => readEnv(config.apiKeyEnv));

  async function callProvider(request: ProviderRequest, baseUrl: string, secret: string | null, signal: AbortSignal) {
    const userPrompt = buildProviderUserPrompt(request.context);
    const headers: Record<string, string> = { "content-type": "application/json" };
    let body: Record<string, unknown>;
    let endpoint: string;

    if (config.protocol === "anthropic") {
      endpoint = `${baseUrl}/v1/messages`;
      headers["anthropic-version"] = "2023-06-01";
      if (secret) headers["x-api-key"] = secret;
      body = {
        model: request.model,
        max_tokens: 700,
        system: buildProviderSystemPrompt(request.context.chatRequest?.language),
        messages: [{ role: "user", content: userPrompt }],
      };
    } else {
      endpoint = `${baseUrl}/chat/completions`;
      if (secret) headers.authorization = `Bearer ${secret}`;
      body = {
        model: request.model,
        temperature: 0.2,
        max_tokens: 700,
        messages: [
          { role: "system", content: buildProviderSystemPrompt(request.context.chatRequest?.language) },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      };
    }

    const response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body), signal });
    if (!response.ok) throw new Error(`provider_http_${response.status}`);
    const payload: unknown = await response.json();
    const text = config.protocol === "anthropic" ? extractAnthropicContent(payload) : extractOpenAIContent(payload);
    return parseProviderJson(text);
  }

  const provider: AIProvider = {
    name: config.id,
    mode: "live",
    descriptor,
    isConfigured: () => descriptor.authentication !== "api-key" || Boolean(credential.readSecret()),
    estimateUsage,
    getStatus: () => (provider.isConfigured() ? "configured" : "not-configured"),
    async generateInsight(request, execution) {
      const configuredBaseUrl = readEnv(config.baseUrlEnv) || descriptor.defaultBaseUrl;
      if (!configuredBaseUrl) throw new Error("missing_base_url");
      const response = await executeProviderRequest(
        (signal) => callProvider(request, configuredBaseUrl, execution.credential.readSecret(), signal),
        { timeoutMs: config.timeoutMs ?? 12_000, retryCount: config.retryCount ?? 2 },
      );
      return buildLiveProviderInsight({
        input: request.context,
        response,
        model: request.model,
        provider: config.id,
        providerName: descriptor.displayName,
        usage: estimateUsage(request),
      });
    },
    async generateCoachInsight(input: CoachContext) {
      try {
        return await provider.generateInsight(
          { context: input, model: readEnv(config.modelEnv) || descriptor.defaultModel || "default" },
          { credential, baseUrl: readEnv(config.baseUrlEnv), signal: new AbortController().signal },
        );
      } catch (error) {
        safeProviderLog(config.id, error);
        return {
          ...(await mockProvider.generateCoachInsight(input)),
          provider: "mock",
          providerMode: "fallback",
          model: readEnv(config.modelEnv) || descriptor.defaultModel || "default",
        };
      }
    },
  };

  return provider;
}
