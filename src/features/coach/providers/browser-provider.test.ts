import { afterEach, describe, expect, it, vi } from "vitest";
import { createBrowserSessionCredential } from "./browser-session";
import { testBrowserProviderConnection } from "./browser-provider";

afterEach(() => vi.unstubAllGlobals());

describe("browser provider connection test", () => {
  const flags = {
    masterEnabled: true,
    localEnabled: true,
    geminiEnabled: false,
    openRouterEnabled: false,
    demoDataConfirmed: false,
    strictCspConfirmed: false,
  };

  it("uses a metadata endpoint without CoachContext or a request body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const credential = createBrowserSessionCredential("lm-studio", "temporary-test-token");

    await testBrowserProviderConnection({
      providerId: "lm-studio",
      model: "local-model",
      baseUrl: "http://127.0.0.1:1234/v1",
      credential,
      flags,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:1234/v1/models",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty("body");
  });

  it("does not automatically retry a failed browser connection", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);
    const credential = createBrowserSessionCredential("ollama", "");

    await expect(
      testBrowserProviderConnection({
        providerId: "ollama",
        model: "llama3.2",
        baseUrl: "http://127.0.0.1:11434/v1",
        credential,
        flags,
      }),
    ).rejects.toMatchObject({ code: "network" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
