import type { Metadata } from "next";
import { AppShell } from "@/components/dashboard/AppShell";
import { DemoChrome } from "@/components/demo/DemoChrome";
import { DemoStateProvider } from "@/features/demo/store";

export const metadata: Metadata = {
  title: "Public Demo | Atlas AI",
  description: "Explore Atlas AI with fictional data, temporary in-memory state and deterministic Mock AI explanations.",
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Atlas AI Public Demo",
    description: "A database-free, fictional and non-persistent Atlas AI product experience.",
    url: "/demo",
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoStateProvider>
      <AppShell publicDemo>
        <DemoChrome>{children}</DemoChrome>
      </AppShell>
    </DemoStateProvider>
  );
}
