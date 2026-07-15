import type { Metadata } from "next";
import type { PublicPageContent } from "@/lib/public-site/content";

export function publicMetadata(content: PublicPageContent): Metadata {
  const title = `${content.title} — Atlas AI`;
  return {
    title,
    description: content.description,
    alternates: { canonical: content.path },
    openGraph: { title, description: content.description, url: content.path, type: "website", locale: "en_US" },
    twitter: { card: "summary", title, description: content.description },
  };
}
