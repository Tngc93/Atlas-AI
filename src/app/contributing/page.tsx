import { PublicPage } from "@/components/public/PublicPage";
import { resourcePages } from "@/lib/public-site/content";
import { publicMetadata } from "@/lib/public-site/metadata";
export const metadata = publicMetadata(resourcePages.contributing);
export default function ContributingPage() { return <PublicPage content={resourcePages.contributing} />; }
