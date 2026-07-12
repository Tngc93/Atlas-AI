import { AppShell } from "@/components/dashboard/AppShell";
import { DemoChrome } from "@/components/demo/DemoChrome";
import { DemoStateProvider } from "@/features/demo/store";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoStateProvider>
      <AppShell>
        <DemoChrome>{children}</DemoChrome>
      </AppShell>
    </DemoStateProvider>
  );
}
