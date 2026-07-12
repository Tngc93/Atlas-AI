import { describe, expect, it } from "vitest";
import { getProviderDescriptor, listBrowserProviders, providerRegistry } from "./registry";

describe("provider registry", () => {
  it("contains unique provider identifiers and safe capability metadata", () => {
    const ids = providerRegistry.map((provider) => provider.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getProviderDescriptor("openai").browserSupport).toBe("self-host-only");
    expect(getProviderDescriptor("ollama").executionModes).toContain("browser-direct");
    expect(getProviderDescriptor("custom-openai-compatible").executionModes).not.toContain("browser-direct");
  });

  it("gates local and cloud browser providers independently", () => {
    expect(listBrowserProviders({ geminiEnabled: false, openRouterEnabled: false, localEnabled: false })).toEqual([]);
    expect(listBrowserProviders({ geminiEnabled: true, openRouterEnabled: false, localEnabled: false }).map((provider) => provider.id)).toEqual(["gemini"]);
    expect(listBrowserProviders({ geminiEnabled: false, openRouterEnabled: true, localEnabled: true }).map((provider) => provider.id)).toEqual([
      "openrouter",
      "ollama",
      "lm-studio",
    ]);
  });
});
