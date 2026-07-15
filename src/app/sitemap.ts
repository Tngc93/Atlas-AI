import type { MetadataRoute } from "next";
import { architecturePages, docsPages, productPages, resourcePages } from "@/lib/public-site/content";
import { resolveSiteUrl } from "@/lib/public-site/site-url";

const baseUrl = resolveSiteUrl().origin;

export default function sitemap(): MetadataRoute.Sitemap {
  const contentRoutes = [productPages, architecturePages, docsPages, resourcePages]
    .flatMap((collection) => Object.values(collection))
    .map((page) => page.path);
  const routes = ["/", "/demo", ...contentRoutes];

  return [...new Set(routes)].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/product" || route === "/architecture" || route === "/docs" ? 0.9 : 0.7,
  }));
}
