import type { AIProviderMode, AIProviderName, AIUsageEstimate, CoachContext, CoachInsight } from "../types";

export type AIExecutionMode = "mock" | "browser-direct" | "server";
export type ProviderAuthentication = "none" | "api-key" | "optional-api-key";
export type BrowserSupport = "supported" | "conditional" | "self-host-only";
export type ProviderAvailability = "open" | "experimental" | "disabled" | "self-host-only" | "local-only";
export type ProviderUiLabel = "Demo" | "Deneysel Browser" | "Self-host" | "Local";

export type ProviderDescriptor = {
  id: AIProviderName;
  displayName: string;
  executionModes: AIExecutionMode[];
  authentication: ProviderAuthentication;
  capabilities: {
    structuredOutput: boolean;
    customModel: boolean;
    customBaseUrl: boolean;
  };
  browserSupport: BrowserSupport;
  availability: ProviderAvailability;
  uiLabel: ProviderUiLabel;
  browserNote: string;
  defaultModel?: string;
  defaultBaseUrl?: string;
};

export type NoCredential = {
  kind: "none";
  readSecret: () => null;
};

export type ServerConfiguredCredential = {
  kind: "server-configured";
  providerId: AIProviderName;
  readSecret: () => string | null;
};

export type BrowserSessionCredential = {
  kind: "browser-session";
  providerId: AIProviderName;
  sessionId: string;
  readSecret: () => string | null;
  clear: () => void;
  toJSON: () => never;
};

export type CredentialHandle = NoCredential | ServerConfiguredCredential | BrowserSessionCredential;

export type ProviderRequest = {
  context: CoachContext;
  model: string;
};

export type ProviderExecutionContext = {
  credential: CredentialHandle;
  baseUrl?: string;
  signal: AbortSignal;
};

export type ProviderStatus = "configured" | "not-configured" | "reachable" | "unavailable" | "unsupported-environment";

export interface AIProviderAdapter {
  descriptor: ProviderDescriptor;
  mode: AIProviderMode;
  isConfigured: () => boolean;
  estimateUsage: (request: ProviderRequest) => AIUsageEstimate;
  getStatus: (context: ProviderExecutionContext) => ProviderStatus;
  generateInsight: (request: ProviderRequest, context: ProviderExecutionContext) => Promise<CoachInsight>;
}

export const noCredential: NoCredential = {
  kind: "none",
  readSecret: () => null,
};

export function createServerCredential(providerId: AIProviderName, resolver: () => string | undefined): ServerConfiguredCredential {
  return {
    kind: "server-configured",
    providerId,
    readSecret: () => resolver() || null,
  };
}
