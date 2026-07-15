import type { MetadataRoute } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/product/", "/architecture/", "/docs/", "/security", "/contributing", "/roadmap", "/license", "/github"],
      disallow: ["/api/", "/offline"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
