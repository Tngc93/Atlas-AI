"use client";

import { PublicStatusPage } from "@/components/public/PublicStatusPage";

export function PublicRouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PublicStatusPage kind="error" onRetry={reset} />;
}
