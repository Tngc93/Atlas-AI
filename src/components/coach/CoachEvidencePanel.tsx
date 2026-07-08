import { BadgeCheck, History, Lightbulb, LockKeyhole, Percent, TrendingUp } from "lucide-react";
import type { CoachEvidenceSummary } from "@/features/coach/context-evidence";

export function CoachEvidencePanel({ evidence }: { evidence: CoachEvidenceSummary }) {
  return (
    <section className="ui-card mt-6">
      <div className="flex flex-col gap-2 border-b border-line pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mint">Dayanak özeti</p>
        <h2 className="text-xl font-semibold tracking-tight text-ink">Bu yorum şunlara dayanıyor</h2>
        <p className="max-w-3xl text-sm leading-6 text-steel">
          Koç yorumu, hesaplama motorunun ürettiği kısa özetleri açıklar. Buradaki bilgiler karar yerine geçmez; sadece neyin dikkate alındığını görünür kılar.
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <EvidenceSection icon={BadgeCheck} title="Bu ayın hesaplama özeti">
          <dl className="grid gap-3 sm:grid-cols-2">
            {evidence.calculationItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-line bg-surface-muted p-3">
                <dt className="text-xs font-semibold text-steel">{item.label}</dt>
                <dd className="mt-1 text-sm font-semibold text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        </EvidenceSection>

        <EvidenceSection icon={History} title="Finansal hafıza durumu">
          <p className="text-sm leading-6 text-steel">{evidence.memoryStatus}</p>
        </EvidenceSection>

        <EvidenceSection icon={TrendingUp} title="Trendler">
          <ul className="space-y-2">
            {evidence.trendLabels.map((label) => (
              <li key={label} className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm text-steel">
                {label}
              </li>
            ))}
          </ul>
        </EvidenceSection>

        <EvidenceSection icon={Lightbulb} title="Öneri başlıkları">
          {evidence.recommendationTitles.length > 0 ? (
            <ul className="space-y-2">
              {evidence.recommendationTitles.map((title) => (
                <li key={title} className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm text-steel">
                  {title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-6 text-steel">Bu ay için gösterilecek yeterli öneri başlığı yok.</p>
          )}
        </EvidenceSection>

        <EvidenceSection icon={Percent} title="Faiz bağlamı">
          <p className="text-sm leading-6 text-steel">{evidence.rateContext}</p>
        </EvidenceSection>

        <EvidenceSection icon={LockKeyhole} title="Gizlilik sınırı">
          <p className="text-sm leading-6 text-steel">{evidence.privacyNote}</p>
        </EvidenceSection>
      </div>
    </section>
  );
}

function EvidenceSection({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  title: string;
}) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-mint/25 bg-mint/10 text-mint">
          <Icon size={16} aria-hidden={true} />
        </span>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </article>
  );
}
