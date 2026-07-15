import { PublicPage } from "@/components/public/PublicPage";
import { resourcePages } from "@/lib/public-site/content";
import { publicMetadata } from "@/lib/public-site/metadata";

export const metadata = publicMetadata(resourcePages.github);

export default function GitHubPage() {
  return <PublicPage content={resourcePages.github} />;
}
