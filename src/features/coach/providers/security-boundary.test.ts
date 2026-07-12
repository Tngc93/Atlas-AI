import { describe, expect, it } from "vitest";
import { createBrowserSessionCredential } from "./browser-session";
import { validateProviderBaseUrl } from "./endpoint-policy";
import { normalizeProviderError, redactProviderSecrets } from "./safe-errors";

describe("AI provider security boundary", () => {
  it("keeps browser credentials non-serializable and clearable", () => {
    const secret = ["sk", "or", "v1", "example-secret-value"].join("-");
    const credential = createBrowserSessionCredential("openrouter", secret);
    expect(credential.readSecret()).toBe(secret);
    expect(() => JSON.stringify(credential)).toThrow("browser_session_credential_is_not_serializable");
    credential.clear();
    expect(credential.readSecret()).toBeNull();
  });

  it("redacts provider keys, bearer values and key query values", () => {
    const anthropicLikeKey = ["sk", "ant", "example_secret_123456789"].join("-");
    const value = `${anthropicLikeKey} Bearer abc.def.ghi https://example.test?api_key=secret`;
    const redacted = redactProviderSecrets(value);
    expect(redacted).not.toContain("example_secret");
    expect(redacted).not.toContain("abc.def.ghi");
    expect(redacted).not.toContain("api_key=secret");
  });

  it("allows HTTPS and loopback HTTP but rejects credentialed or arbitrary public URLs", () => {
    expect(validateProviderBaseUrl("http://127.0.0.1:11434/v1", { providerId: "ollama", providerEnabled: true })).toContain("127.0.0.1");
    expect(validateProviderBaseUrl("https://openrouter.ai/api/v1", { providerId: "openrouter", providerEnabled: true })).toContain("openrouter.ai");
    expect(() => validateProviderBaseUrl("http://127.0.0.1:9999/v1", { providerId: "ollama", providerEnabled: true })).toThrow();
    expect(() => validateProviderBaseUrl("https://user:secret@example.com/v1", { providerId: "custom-openai-compatible", providerEnabled: true })).toThrow();
    expect(() => validateProviderBaseUrl("https://openrouter.ai/api/v1", { providerId: "openrouter", providerEnabled: false })).toThrow();
  });

  it("normalizes provider failures without exposing the source error", () => {
    expect(normalizeProviderError(new Error("provider_http_401 secret body")).code).toBe("authentication");
    expect(normalizeProviderError(new Error("provider_http_402")).code).toBe("insufficient_credits");
    expect(normalizeProviderError(new Error("provider_http_408")).code).toBe("timeout");
    expect(normalizeProviderError(new Error("provider_http_429")).code).toBe("rate_limit");
    expect(normalizeProviderError(new Error("provider_http_503 raw provider body")).code).toBe("unavailable");
    expect(normalizeProviderError(new Error("Failed to fetch")).code).toBe("network");
  });
});
