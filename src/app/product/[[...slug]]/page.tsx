import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { productPages } from "@/lib/public-site/content";
import { publicMetadata } from "@/lib/public-site/metadata";

type Props = { params: Promise<{ slug?: string[] }> };
function getPage(slug?: string[]) { return productPages[slug?.join("/") ?? ""]; }
export function generateStaticParams() { return Object.keys(productPages).map((slug) => ({ slug: slug ? slug.split("/") : [] })); }
export async function generateMetadata({ params }: Props) { const page = getPage((await params).slug); return page ? publicMetadata(page) : {}; }
export default async function ProductPage({ params }: Props) { const page = getPage((await params).slug); if (!page) notFound(); return <PublicPage content={page} />; }
