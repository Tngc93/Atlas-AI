import type { BrowserProviderFlags } from "./browser-flags";

export function buildContentSecurityPolicy(options: { isDevelopment: boolean; flags: BrowserProviderFlags }): string {
  const connectSources = ["'self'"];

  if (options.flags.geminiEnabled) connectSources.push("https://generativelanguage.googleapis.com");
  if (options.flags.openRouterEnabled) connectSources.push("https://openrouter.ai");
  if (options.flags.localEnabled) {
    connectSources.push(
      "http://localhost:11434",
      "http://127.0.0.1:11434",
      "http://localhost:1234",
      "http://127.0.0.1:1234",
    );
  }

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${options.isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
