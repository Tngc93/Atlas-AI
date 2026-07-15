import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "@/lib/public-site/site-url";

describe("resolveSiteUrl", () => {
  it("prefers the explicitly configured public URL", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://atlas.example/path" }).href).toBe("https://atlas.example/");
  });

  it("uses the Vercel production host when a public URL is not configured", () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "atlas.example" }).href).toBe("https://atlas.example/");
  });

  it("falls back to localhost for local builds and rejects non-http schemes", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" }).href).toBe("http://localhost:3000/");
  });
});
