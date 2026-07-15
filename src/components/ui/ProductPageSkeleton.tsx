import { AppShell } from "@/components/dashboard/AppShell";
import { SkeletonBlock } from "@/components/ui/Primitives";

export function ProductPageSkeleton() {
  return (
    <AppShell>
      <div role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Sayfa yükleniyor</span>
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="mt-4 h-10 w-full max-w-2xl" />
        <SkeletonBlock className="mt-4 h-6 w-full max-w-3xl" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <SkeletonBlock key={index} className="h-48 rounded-2xl" />)}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <SkeletonBlock className="h-80 rounded-2xl" />
          <SkeletonBlock className="h-80 rounded-2xl" />
        </div>
      </div>
    </AppShell>
  );
}
