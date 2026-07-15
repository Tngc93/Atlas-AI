import type { RiskLevel } from "@/features/finance/types";
import { RiskBadge } from "@/components/ui/Primitives";

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
    <section className="ui-card group min-h-48 overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-5 text-steel">{label}</p>
        {risk ? <RiskBadge riskLevel={risk} /> : null}
      </div>
      <p className="mt-5 text-4xl font-bold tracking-tight text-ink">{value}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <span className="block h-full w-2/3 rounded-full bg-gradient-to-r from-mint to-steel" />
      </div>
      <p className="mt-3 text-[15px] font-medium leading-6 text-steel">{helper}</p>
    </section>
  );
}
