"use client";

import { useState } from "react";
import { CoachPanel } from "@/components/dashboard/CoachPanel";
import { CoachEvidencePanel } from "./CoachEvidencePanel";
import { CoachProviderSettings } from "./CoachProviderSettings";
import type { CoachEvidenceSummary } from "@/features/coach/context-evidence";
import type { CoachContext, CoachInsight } from "@/features/coach/types";
import type { BrowserProviderFlags } from "@/features/coach/providers/browser-flags";

export function CoachExperience({
  context,
  evidence,
  initialInsight,
  browserProviderFlags,
}: {
  context: CoachContext;
  evidence: CoachEvidenceSummary;
  initialInsight: CoachInsight;
  browserProviderFlags: BrowserProviderFlags;
}) {
  const [insight, setInsight] = useState(initialInsight);

  return (
    <>
      <CoachProviderSettings
        context={context}
        initialInsight={initialInsight}
        browserProviderFlags={browserProviderFlags}
        onInsightChange={setInsight}
      />
      <CoachPanel insight={insight} />
      <CoachEvidencePanel evidence={evidence} />
    </>
  );
}
