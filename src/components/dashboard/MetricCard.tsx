import type { RiskLevel } from "@/features/finance/types";
import { trCopy } from "@/lib/copy/tr";

const riskStyles: Record<RiskLevel, string> = {
  low: "border-mint/25 bg-mint/10 text-mint",
  medium: "border-steel/25 bg-steel/10 text-steel",
  high: "border-amber/30 bg-amber/10 text-amber",
  critical: "border-coral/30 bg-coral/10 text-coral",
};

export function MetricCard({
  label,
  value,
  helper,
  risk,
}: {
  label: string;
  value: string;
  helper: string;
  risk?: RiskLevel;
}) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-ink/55">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-2 text-sm leading-5 text-ink/60">{helper}</p>
      {risk ? (
        <span className={`mt-4 inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${riskStyles[risk]}`}>
          {trCopy.risk[risk]}
        </span>
      ) : null}
    </section>
  );
}
