import type { AIProviderName } from "../types";

const LOCAL_ORIGINS: Partial<Record<AIProviderName, Set<string>>> = {
  ollama: new Set(["http://localhost:11434", "http://127.0.0.1:11434"]),
  "lm-studio": new Set(["http://localhost:1234", "http://127.0.0.1:1234"]),
};

const CLOUD_ORIGINS: Partial<Record<AIProviderName, string>> = {
  gemini: "https://generativelanguage.googleapis.com",
  openrouter: "https://openrouter.ai",
};

export function validateProviderBaseUrl(
  value: string,
  options: { providerId: AIProviderName; providerEnabled: boolean },
): string {
  if (!options.providerEnabled) throw new Error("browser_provider_disabled");

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("invalid_base_url");
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new Error("unsafe_base_url");
  }

  const localOrigins = LOCAL_ORIGINS[options.providerId];
  const cloudOrigin = CLOUD_ORIGINS[options.providerId];
  if (localOrigins && !localOrigins.has(url.origin)) throw new Error("local_base_url_not_allowed");
  if (cloudOrigin && url.origin !== cloudOrigin) throw new Error("remote_base_url_not_allowed");
  if (!localOrigins && !cloudOrigin) throw new Error("browser_provider_not_supported");

  return url.toString().replace(/\/$/, "");
}
