import type { Metadata } from "next";
import { PublicStatusPage } from "@/components/public/PublicStatusPage";

export const metadata: Metadata = {
  title: "Offline — Atlas AI",
  description: "Atlas AI public network-unavailable recovery page.",
  alternates: { canonical: "/offline" },
  robots: { index: false, follow: true },
};

export default function OfflinePage() {
  return <PublicStatusPage kind="offline" />;
}
