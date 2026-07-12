type Environment = Record<string, string | undefined>;

export type BrowserProviderFlags = {
  masterEnabled: boolean;
  localEnabled: boolean;
  geminiEnabled: boolean;
  openRouterEnabled: boolean;
  demoDataConfirmed: boolean;
  strictCspConfirmed: boolean;
};

export function resolveBrowserProviderFlags(environment: Environment): BrowserProviderFlags {
  const masterRequested = environment.NEXT_PUBLIC_AI_BROWSER_BYOK_ENABLED === "true";
  const isProduction = environment.NODE_ENV === "production";
  const demoDataConfirmed = environment.AI_PUBLIC_DEMO_DATA_CONFIRMED === "true";
  const strictCspConfirmed = environment.AI_BROWSER_STRICT_CSP_CONFIRMED === "true";
  const releaseGateOpen = !isProduction || demoDataConfirmed;
  const masterEnabled = masterRequested && releaseGateOpen;
  // Production CSP still permits inline framework scripts. Cloud BYOK stays fail-closed
  // until a nonce/hash-based policy is implemented and reviewed in a separate milestone.
  const cloudRuntimeAllowed = !isProduction;

  return {
    masterEnabled,
    localEnabled: masterEnabled && environment.NEXT_PUBLIC_AI_BROWSER_LOCAL_ENABLED === "true",
    geminiEnabled:
      masterEnabled &&
      environment.NEXT_PUBLIC_AI_BROWSER_GEMINI_ENABLED === "true" &&
      cloudRuntimeAllowed,
    openRouterEnabled:
      masterEnabled &&
      environment.NEXT_PUBLIC_AI_BROWSER_OPENROUTER_ENABLED === "true" &&
      cloudRuntimeAllowed,
    demoDataConfirmed,
    strictCspConfirmed,
  };
}
