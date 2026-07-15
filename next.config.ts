import type { NextConfig } from "next";
import { resolveBrowserProviderFlags } from "./src/features/coach/providers/browser-flags";
import { buildContentSecurityPolicy } from "./src/features/coach/providers/csp-policy";

const isDevelopment = process.env.NODE_ENV === "development";
const browserProviderFlags = resolveBrowserProviderFlags(process.env);
const contentSecurityPolicy = buildContentSecurityPolicy({ isDevelopment, flags: browserProviderFlags });

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.PUBLIC_DEMO_MODE !== "true") {
      return [];
    }

    return {
      beforeFiles: [
        ...["income", "debts", "expenses", "plan", "forecast", "decisions", "memory", "reminders", "coach"].map(
          (route) => ({ source: `/${route}`, destination: `/demo/${route}` }),
        ),
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
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
