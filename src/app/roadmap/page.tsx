import { PublicPage } from "@/components/public/PublicPage";
import { resourcePages } from "@/lib/public-site/content";
import { publicMetadata } from "@/lib/public-site/metadata";
export const metadata = publicMetadata(resourcePages.roadmap);
export default function RoadmapPage() { return <PublicPage content={resourcePages.roadmap} />; }
