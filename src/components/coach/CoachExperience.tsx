"use client";

import { useState } from "react";
import { Bot, Calculator, UserCheck } from "lucide-react";
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
      <section className="mb-6 grid gap-3 md:grid-cols-3" aria-label="Koç karar sınırları">
        {[
          { icon: Calculator, title: "Deterministik özet", body: "Finans motoru sayıları, riskleri ve senaryoları hesaplar." },
          { icon: Bot, title: "İsteğe bağlı AI açıklaması", body: "AI yalnız yapılandırılmış sonucu açıklar; hesaplamanın kaynağı değildir." },
          { icon: UserCheck, title: "Karar sizde", body: "Açıklamayı değerlendiren ve son kararı veren her zaman sizsiniz." },
        ].map((item) => (
          <article key={item.title} className="ui-muted-card p-5">
            <item.icon size={22} className="text-mint" aria-hidden="true" />
            <h2 className="mt-4 text-base font-semibold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-steel">{item.body}</p>
          </article>
        ))}
      </section>
      <CoachProviderSettings
        context={context}
        initialInsight={initialInsight}
        browserProviderFlags={browserProviderFlags}
        onInsightChange={setInsight}
      />
      <section aria-label="AI açıklaması"><CoachPanel insight={insight} /></section>
      <section aria-label="Deterministik kanıt özeti"><CoachEvidencePanel evidence={evidence} /></section>
    </>
  );
}
