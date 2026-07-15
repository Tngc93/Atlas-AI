import type { MetadataRoute } from "next";
import { resolveSiteUrl } from "@/lib/public-site/site-url";

const baseUrl = resolveSiteUrl().origin;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/product/", "/architecture/", "/docs/", "/security", "/contributing", "/roadmap", "/license", "/github"],
      disallow: [
        "/api/",
        "/offline",
        "/dashboard",
        "/income",
        "/debts",
        "/expenses",
        "/plan",
        "/forecast",
        "/decisions",
        "/memory",
        "/reminders",
        "/coach",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
