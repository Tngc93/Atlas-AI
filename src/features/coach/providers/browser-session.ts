import type { AIProviderName } from "../types";
import type { BrowserSessionCredential } from "./contracts";

export function createBrowserSessionCredential(providerId: AIProviderName, initialSecret: string): BrowserSessionCredential {
  let secret: string | null = initialSecret || null;
  const sessionId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    kind: "browser-session",
    providerId,
    sessionId,
    readSecret: () => secret,
    clear: () => {
      secret = null;
    },
    toJSON: () => {
      throw new Error("browser_session_credential_is_not_serializable");
    },
  };
}
