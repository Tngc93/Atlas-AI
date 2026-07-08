import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import type { RiskLevel, UiRiskLevel } from "@/features/finance/types";
import { trCopy } from "@/lib/copy/tr";

type Tone = "neutral" | "success" | "warning" | "danger" | "accent";

const toneClasses: Record<Tone, string> = {
  neutral: "border-line bg-surface-muted text-steel",
  success: "border-mint/30 bg-mint/10 text-mint",
  warning: "border-amber/35 bg-amber/10 text-amber",
  danger: "border-coral/35 bg-coral/10 text-coral",
  accent: "border-mint/30 bg-mint/10 text-mint",
};

export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="animate-enter flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        {kicker ? <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mint">{kicker}</p> : null}
        <h1 className="mt-3 max-w-5xl text-3xl font-semibold tracking-tight text-ink sm:text-5xl">{title}</h1>
        {description ? <p className="mt-4 max-w-3xl text-sm leading-6 text-steel sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export function RiskBadge({ riskLevel }: { riskLevel: RiskLevel | UiRiskLevel }) {
  const visibleRisk = riskLevel === "critical" ? "high" : riskLevel;
  const tone: Tone = visibleRisk === "high" ? "danger" : visibleRisk === "medium" ? "warning" : "success";

  return <StatusPill tone={tone}>{trCopy.risk[visibleRisk]}</StatusPill>;
}

export function ChartCard({
  title,
  description,
  meta,
  children,
}: {
  title: string;
  description?: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <section className="ui-card min-w-0 overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-steel">{description}</p> : null}
        </div>
        {meta ? <span className="text-xs font-medium text-steel">{meta}</span> : null}
      </div>
      <div className="mt-6 min-w-0">{children}</div>
    </section>
  );
}

export function InsightCard({
  title,
  body,
  icon: Icon = Sparkles,
  tone = "neutral",
}: {
  title: string;
  body: string;
  icon?: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  tone?: Tone;
}) {
  return (
    <article className="ui-muted-card p-4 transition duration-200 hover:-translate-y-0.5 hover:border-mint/25">
      <div className="flex items-start gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border ${toneClasses[tone]}`}>
          <Icon size={17} aria-hidden={true} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-steel">{body}</p>
        </div>
      </div>
    </article>
  );
}

export function ActionBanner({
  kicker,
  title,
  description,
  href,
  cta,
}: {
  kicker: string;
  title: string;
  description: string;
  href?: string;
  cta?: string;
}) {
  const content = (
    <div className="flex flex-col gap-4 rounded-xl border border-mint/30 bg-gradient-to-br from-mint/15 via-mint/10 to-surface p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-panel sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">{kicker}</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">{description}</p>
      </div>
      {cta ? <span className="ui-primary-button shrink-0">{cta}</span> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-mint">
        {content}
      </Link>
    );
  }

  return content;
}

export function EmptyState({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-dashed border-line bg-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Başlangıç</p>
      <h2 className="mt-2 text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">{description}</p>
      {actions ? <div className="mt-5 flex flex-wrap gap-2">{actions}</div> : null}
    </section>
  );
}

export function SetupStepCard({
  title,
  description,
  href,
  cta,
  completed,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
  completed: boolean;
}) {
  const Icon = completed ? CheckCircle2 : Circle;

  return (
    <article className={`rounded-lg border p-4 ${completed ? "border-mint/30 bg-mint/10" : "border-line bg-surface-muted"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={completed ? "text-mint" : "text-steel"} size={18} aria-hidden="true" />
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
        </div>
        <StatusPill tone={completed ? "success" : "warning"}>{completed ? "Tamam" : "Eksik"}</StatusPill>
      </div>
      <p className="mt-3 text-sm leading-6 text-steel">{description}</p>
      {!completed ? (
        <Link href={href} className="ui-secondary-button mt-4">
          {cta}
        </Link>
      ) : null}
    </article>
  );
}

export function SkeletonBlock({ className = "h-16" }: { className?: string }) {
  return <div className={`ui-skeleton ${className}`} aria-hidden="true" />;
}
