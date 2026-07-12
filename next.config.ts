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
        { source: "/", destination: "/demo" },
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
