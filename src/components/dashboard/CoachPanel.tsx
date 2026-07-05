import type { CoachInsight } from "@/features/coach/types";
import { trCopy } from "@/lib/copy/tr";

const providerLabels: Record<CoachInsight["provider"], string> = {
  mock: "Mock sağlayıcı",
  openai: "OpenAI placeholder",
  gemini: "Gemini placeholder",
};

export function CoachPanel({ insight }: { insight: CoachInsight }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{trCopy.coach.title}</h2>
          <p className="mt-1 text-sm text-ink/60">{trCopy.coach.subtitle}</p>
        </div>
        <span className="rounded-md border border-amber/25 bg-amber/10 px-2.5 py-1 text-xs font-semibold text-amber">
          {providerLabels[insight.provider]}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-ink/75">{insight.summary}</p>
      <p className="mt-3 text-sm leading-6 text-ink/65">{insight.riskExplanation}</p>

      <div className="mt-5 grid gap-3">
        <CoachFinding title="Finansal Durum" body={insight.sections.financialStatus.finding} why={insight.sections.financialStatus.why} />
        <CoachList
          title="Riskler"
          items={insight.sections.risks.map((risk) => ({ heading: risk.title, body: risk.finding, why: risk.why }))}
        />
        <CoachList
          title="İçgörüler"
          items={insight.sections.insights.map((insightItem) => ({
            heading: insightItem.title,
            body: insightItem.finding,
            why: insightItem.why,
          }))}
        />
        <CoachList
          title="Bu Ay Yapılacaklar"
          items={insight.sections.monthlyActions.map((action) => ({
            heading: action.title,
            body: action.action,
            why: action.why,
          }))}
        />
        <CoachList
          title="Öncelikler"
          items={insight.sections.priorities.map((priority) => ({
            heading: priority.title,
            body: priority.priority,
            why: priority.why,
          }))}
        />
        <CoachFinding title="Beklenen Sonuç" body={insight.sections.expectedOutcome.outcome} why={insight.sections.expectedOutcome.why} />
        <CoachList
          title="Alternatif Senaryolar"
          items={insight.sections.decisionSimulatorPreview.map((scenario) => ({
            heading: scenario.scenario,
            body: scenario.interpretation,
            why: scenario.why,
          }))}
        />
        <CoachFinding title="Koç Yorumu" body={insight.sections.coachComment.comment} why={insight.sections.coachComment.why} />
      </div>

      <p className="mt-4 rounded-md bg-ink/[0.03] p-3 text-xs leading-5 text-ink/60">
        {insight.caveats}
      </p>
      <p className="mt-3 text-xs leading-5 text-ink/50">
        Sağlayıcı modu: {insight.providerMode === "mock" ? "Mock" : "Placeholder"} · Model: {insight.model} · Tahmini maliyet:{" "}
        {insight.usage.estimatedCostKurus / 100} TL
      </p>
    </section>
  );
}

function CoachFinding({ title, body, why }: { title: string; body: string; why: string }) {
  return (
    <article className="rounded-md border border-ink/10 bg-ink/[0.02] p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/70">{body}</p>
      <p className="mt-2 text-xs leading-5 text-steel">Neden? {why}</p>
    </article>
  );
}

function CoachList({ title, items }: { title: string; items: { heading: string; body: string; why: string }[] }) {
  return (
    <section className="rounded-md border border-ink/10 bg-white p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <article key={`${item.heading}-${item.body}`} className="rounded-md bg-ink/[0.03] p-3">
            <h4 className="text-sm font-semibold text-ink/85">{item.heading}</h4>
            <p className="mt-1 text-sm leading-6 text-ink/70">{item.body}</p>
            <p className="mt-2 text-xs leading-5 text-steel">Neden? {item.why}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
