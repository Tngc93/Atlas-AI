import { AlertTriangle, CheckCircle2, Compass, HelpCircle, ShieldCheck } from "lucide-react";
import type { DashboardDecisionBrief as DashboardDecisionBriefModel } from "@/features/finance/dashboard-brief";
import { StatusPill } from "@/components/ui/Primitives";

export function DashboardDecisionBrief({ brief }: { brief: DashboardDecisionBriefModel }) {
  const riskTone = brief.riskLabel === "Yüksek" ? "danger" : brief.riskLabel === "Orta" ? "warning" : "success";

  return (
    <section className="mt-6 rounded-2xl border border-mint/25 bg-surface p-5 shadow-soft">
      <div className="flex flex-col gap-3 border-b border-line pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Deterministik karar desteği</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Bu ayın karar özeti</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
            Bu özet AI yorumu değildir; mevcut aylık planın hesaplanan sınırlarını sadeleştirir.
          </p>
        </div>
        <StatusPill tone={riskTone}>Risk: {brief.riskLabel}</StatusPill>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <DecisionBriefItem icon={ShieldCheck} label="Önce korunması gereken şey" value={brief.protectedThing} tone="mint" />
        <DecisionBriefItem icon={AlertTriangle} label="En önemli risk" value={brief.primaryRisk} tone="amber" />
        <DecisionBriefItem icon={Compass} label="Sıradaki güvenli adım" value={brief.nextSafeStep} tone="mint" />
        <DecisionBriefItem icon={HelpCircle} label="Neden?" value={brief.why} tone="steel" />
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-surface-muted p-4">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-mint/25 bg-mint/10 text-mint">
          <CheckCircle2 size={15} aria-hidden="true" />
        </span>
        <p className="text-sm leading-6 text-steel">{brief.decisionNote}</p>
      </div>
    </section>
  );
}

function DecisionBriefItem({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  label: string;
  tone: "mint" | "amber" | "steel";
  value: string;
}) {
  const toneClasses = {
    mint: "border-mint/25 bg-mint/10 text-mint",
    amber: "border-amber/25 bg-amber/10 text-amber",
    steel: "border-line bg-surface-muted text-steel",
  };

  return (
    <article className="rounded-xl border border-line bg-surface-muted p-4">
      <div className="flex items-start gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${toneClasses[tone]}`}>
          <Icon size={17} aria-hidden={true} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">{label}</p>
          <p className="mt-2 text-sm leading-6 text-ink">{value}</p>
        </div>
      </div>
    </article>
  );
}
