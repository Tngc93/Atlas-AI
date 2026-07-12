import { describe, expect, it } from "vitest";
import { resolveBrowserProviderFlags } from "./browser-flags";
import { buildContentSecurityPolicy } from "./csp-policy";

describe("browser provider release gates", () => {
  it("fails closed in production without demo data confirmation", () => {
    const flags = resolveBrowserProviderFlags({
      NODE_ENV: "production",
      NEXT_PUBLIC_AI_BROWSER_BYOK_ENABLED: "true",
      NEXT_PUBLIC_AI_BROWSER_LOCAL_ENABLED: "true",
    });
    expect(flags.masterEnabled).toBe(false);
    expect(flags.localEnabled).toBe(false);
  });

  it("keeps production cloud providers closed until nonce/hash CSP is implemented", () => {
    const flags = resolveBrowserProviderFlags({
      NODE_ENV: "production",
      AI_PUBLIC_DEMO_DATA_CONFIRMED: "true",
      AI_BROWSER_STRICT_CSP_CONFIRMED: "true",
      NEXT_PUBLIC_AI_BROWSER_BYOK_ENABLED: "true",
      NEXT_PUBLIC_AI_BROWSER_GEMINI_ENABLED: "true",
      NEXT_PUBLIC_AI_BROWSER_OPENROUTER_ENABLED: "false",
    });
    expect(flags.geminiEnabled).toBe(false);
    expect(flags.openRouterEnabled).toBe(false);
  });

  it("allows separate cloud provider flags only for explicit local development validation", () => {
    const flags = resolveBrowserProviderFlags({
      NODE_ENV: "development",
      NEXT_PUBLIC_AI_BROWSER_BYOK_ENABLED: "true",
      NEXT_PUBLIC_AI_BROWSER_GEMINI_ENABLED: "true",
      NEXT_PUBLIC_AI_BROWSER_OPENROUTER_ENABLED: "false",
    });
    expect(flags.geminiEnabled).toBe(true);
    expect(flags.openRouterEnabled).toBe(false);
  });

  it("includes only enabled provider origins in connect-src", () => {
    const policy = buildContentSecurityPolicy({
      isDevelopment: false,
      flags: {
        masterEnabled: true,
        localEnabled: true,
        geminiEnabled: false,
        openRouterEnabled: false,
        demoDataConfirmed: true,
        strictCspConfirmed: false,
      },
    });
    expect(policy).toContain("http://127.0.0.1:11434");
    expect(policy).toContain("http://127.0.0.1:1234");
    expect(policy).not.toContain("generativelanguage.googleapis.com");
    expect(policy).not.toContain("openrouter.ai");
    expect(policy).not.toContain("localhost:*");
  });
});
