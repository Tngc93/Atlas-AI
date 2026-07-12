import type { NextConfig } from "next";
import { resolveBrowserProviderFlags } from "./src/features/coach/providers/browser-flags";
import { buildContentSecurityPolicy } from "./src/features/coach/providers/csp-policy";

const isDevelopment = process.env.NODE_ENV === "development";
const browserProviderFlags = resolveBrowserProviderFlags(process.env);
const contentSecurityPolicy = buildContentSecurityPolicy({ isDevelopment, flags: browserProviderFlags });

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
