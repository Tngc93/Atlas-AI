import type { AIProviderName } from "../types";
import type { ProviderDescriptor } from "./contracts";

const descriptors = [
  {
    id: "mock",
    displayName: "Demo koç",
    executionModes: ["mock", "server"],
    authentication: "none",
    browserSupport: "supported",
    availability: "open",
    uiLabel: "Demo",
    browserNote: "API anahtarı ve dış sağlayıcı çağrısı gerekmez.",
    defaultModel: "mock-finance-coach",
  },
  {
    id: "openai",
    displayName: "OpenAI",
    executionModes: ["server"],
    authentication: "api-key",
    browserSupport: "self-host-only",
    availability: "self-host-only",
    uiLabel: "Self-host",
    browserNote: "OpenAI anahtarları browser kullanımına açılmaz.",
    defaultModel: "gpt-4.1-mini",
    defaultBaseUrl: "https://api.openai.com/v1",
  },
  {
    id: "gemini",
    displayName: "Google Gemini",
    executionModes: ["browser-direct", "server"],
    authentication: "api-key",
    browserSupport: "conditional",
    availability: "experimental",
    uiLabel: "Deneysel Browser",
    browserNote: "Restricted test anahtarı ve origin doğrulaması gerekir.",
    defaultModel: "gemini-2.5-flash",
    defaultBaseUrl: "https://generativelanguage.googleapis.com",
  },
  {
    id: "anthropic",
    displayName: "Anthropic Claude",
    executionModes: ["server"],
    authentication: "api-key",
    browserSupport: "self-host-only",
    availability: "self-host-only",
    uiLabel: "Self-host",
    browserNote: "Anthropic yalnız server-side/self-host modunda desteklenir.",
    defaultModel: "claude-sonnet-4-20250514",
    defaultBaseUrl: "https://api.anthropic.com",
  },
  {
    id: "openrouter",
    displayName: "OpenRouter",
    executionModes: ["browser-direct", "server"],
    authentication: "api-key",
    browserSupport: "conditional",
    availability: "experimental",
    uiLabel: "Deneysel Browser",
    browserNote: "Düşük limitli test anahtarı ve açık kullanıcı onayı gerekir.",
    defaultModel: "openai/gpt-4.1-mini",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
  },
  {
    id: "ollama",
    displayName: "Ollama",
    executionModes: ["browser-direct", "server"],
    authentication: "none",
    browserSupport: "conditional",
    availability: "local-only",
    uiLabel: "Local",
    browserNote: "Public demo origin'i OLLAMA_ORIGINS ayarına eklenmelidir.",
    defaultModel: "llama3.2",
    defaultBaseUrl: "http://127.0.0.1:11434/v1",
  },
  {
    id: "lm-studio",
    displayName: "LM Studio",
    executionModes: ["browser-direct", "server"],
    authentication: "optional-api-key",
    browserSupport: "conditional",
    availability: "local-only",
    uiLabel: "Local",
    browserNote: "CORS ve tercihen API token authentication etkin olmalıdır.",
    defaultModel: "local-model",
    defaultBaseUrl: "http://127.0.0.1:1234/v1",
  },
  {
    id: "custom-openai-compatible",
    displayName: "OpenAI uyumlu özel API",
    executionModes: ["server"],
    authentication: "optional-api-key",
    browserSupport: "self-host-only",
    availability: "self-host-only",
    uiLabel: "Self-host",
    browserNote: "Özel remote endpoint public browser modunda desteklenmez.",
  },
] satisfies Array<Omit<ProviderDescriptor, "capabilities"> & { id: AIProviderName }>;

export const providerRegistry: ProviderDescriptor[] = descriptors.map((descriptor) => ({
  ...descriptor,
  capabilities: {
    structuredOutput: true,
    customModel: descriptor.id !== "mock",
    customBaseUrl: descriptor.id === "ollama" || descriptor.id === "lm-studio" || descriptor.id === "custom-openai-compatible",
  },
}));

export function getProviderDescriptor(id: AIProviderName): ProviderDescriptor {
  const descriptor = providerRegistry.find((candidate) => candidate.id === id);

  if (!descriptor) {
    throw new Error("provider_not_registered");
  }

  return descriptor;
}

export function listBrowserProviders(options: { geminiEnabled: boolean; openRouterEnabled: boolean; localEnabled: boolean }): ProviderDescriptor[] {
  return providerRegistry.filter((provider) => {
    if (!provider.executionModes.includes("browser-direct")) {
      return false;
    }

    if (provider.id === "gemini") return options.geminiEnabled;
    if (provider.id === "openrouter") return options.openRouterEnabled;
    if (provider.id === "ollama" || provider.id === "lm-studio") return options.localEnabled;

    return false;
  });
}
