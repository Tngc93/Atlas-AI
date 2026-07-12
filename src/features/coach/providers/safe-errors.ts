export type ProviderErrorCode =
  | "authentication"
  | "insufficient_credits"
  | "rate_limit"
  | "timeout"
  | "network"
  | "unavailable"
  | "invalid_response"
  | "configuration";

const SAFE_MESSAGES: Record<ProviderErrorCode, string> = {
  authentication: "AI sağlayıcısı anahtarı doğrulayamadı.",
  insufficient_credits: "AI sağlayıcısı bakiyesi veya kredisi yetersiz görünüyor.",
  rate_limit: "AI sağlayıcısının kullanım sınırına ulaşıldı.",
  timeout: "AI sağlayıcısı zamanında yanıt vermedi.",
  network: "CORS veya ağ bağlantısı sağlayıcıya erişimi engelliyor.",
  unavailable: "AI sağlayıcısına şu anda ulaşılamıyor.",
  invalid_response: "AI sağlayıcısı beklenen yapıda yanıt vermedi.",
  configuration: "AI sağlayıcısı ayarları tamamlanmamış görünüyor.",
};

export class NormalizedProviderError extends Error {
  constructor(public readonly code: ProviderErrorCode) {
    super(SAFE_MESSAGES[code]);
    this.name = "NormalizedProviderError";
  }
}

const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9_-]{12,}/g,
  /AIza[0-9A-Za-z_-]{20,}/g,
  /sk-ant-[A-Za-z0-9_-]{12,}/g,
  /sk-or-v1-[A-Za-z0-9_-]{12,}/g,
  /Bearer\s+[A-Za-z0-9._~+\/-]+=*/gi,
  /([?&](?:key|api_key|token)=)[^&\s]+/gi,
];

export function redactProviderSecrets(value: string): string {
  return SECRET_PATTERNS.reduce((redacted, pattern) => redacted.replace(pattern, "[REDACTED]"), value);
}

export function normalizeProviderError(error: unknown): NormalizedProviderError {
  if (error instanceof NormalizedProviderError) {
    return error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new NormalizedProviderError("timeout");
  }

  if (error instanceof SyntaxError) {
    return new NormalizedProviderError("invalid_response");
  }

  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("missing") || message.includes("disabled") || message.includes("not_supported")) {
    return new NormalizedProviderError("configuration");
  }
  if (message.includes("401") || message.includes("403") || message.includes("api key")) {
    return new NormalizedProviderError("authentication");
  }
  if (message.includes("402") || message.includes("insufficient credit")) {
    return new NormalizedProviderError("insufficient_credits");
  }
  if (message.includes("429") || message.includes("rate limit") || message.includes("quota")) {
    return new NormalizedProviderError("rate_limit");
  }
  if (message.includes("408") || message.includes("timeout") || message.includes("aborted")) {
    return new NormalizedProviderError("timeout");
  }
  if (message.includes("cors") || message.includes("failed to fetch") || message.includes("networkerror")) {
    return new NormalizedProviderError("network");
  }
  if (message.includes("json") || message.includes("schema") || message.includes("parse")) {
    return new NormalizedProviderError("invalid_response");
  }

  if (/provider_http_5\d\d/.test(message)) return new NormalizedProviderError("unavailable");
  return new NormalizedProviderError("unavailable");
}

export function safeProviderLog(providerId: string, error: unknown) {
  const normalized = normalizeProviderError(error);
  console.warn("[AIProvider] Güvenli fallback devreye girdi.", { provider: providerId, reason: normalized.code });
}
