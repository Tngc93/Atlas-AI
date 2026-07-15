import Link from "next/link";
import { AppShell } from "@/components/dashboard/AppShell";
import { ForecastDebtTrendChart, ForecastLivingBudgetChart } from "@/components/forecast/ForecastCharts";
import { ForecastScenarioPanel } from "@/components/forecast/ForecastScenarioPanel";
import { EmptyState, PageHeader } from "@/components/ui/Primitives";
import { TrendingUp } from "lucide-react";
import { getFinanceSnapshot } from "@/features/finance/data-service";
import { formatTry } from "@/features/finance/money";
import type { RiskLevel, UiRiskLevel } from "@/features/finance/types";
import { buildForecastReport } from "@/features/forecast/service";
import { trCopy } from "@/lib/copy/tr";

export const dynamic = "force-dynamic";

function visibleRiskLabel(riskLevel: RiskLevel | UiRiskLevel): string {
  return riskLevel === "critical" ? trCopy.risk.high : trCopy.risk[riskLevel];
}

function SetupCta({
  href,
  completed,
  label,
  cta,
}: {
  href: string;
  completed: boolean;
  label: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold transition ${
        completed ? "border-mint/20 bg-mint/10 text-mint" : "border-line bg-surface text-ink hover:bg-surface-muted"
      }`}
    >
      {completed ? `${label} tamam` : cta}
    </Link>
  );
}

export default async function ForecastPage() {
  const snapshot = await getFinanceSnapshot();
  const activeDebts = snapshot.debts.filter((debt) => debt.status === "active" && debt.balanceKurus > 0);
  const setupItems = [
    {
      label: "Gelir kaydı",
      href: "/income",
      cta: "Gelir ekle",
      completed: snapshot.hasProfile && snapshot.profile.monthlySalaryKurus > 0,
    },
    {
      label: "Zorunlu gider kaydı",
      href: "/expenses",
      cta: "Gider ekle",
      completed: snapshot.expenses.length > 0,
    },
    {
      label: "Aktif borç kaydı",
      href: "/debts",
      cta: "Borç ekle",
      completed: activeDebts.length > 0,
    },
  ];
  const cannotBuildUsefulForecast = setupItems.some((item) => !item.completed);
  const report = buildForecastReport(snapshot);
  const summaryCards = [
    {
      label: trCopy.forecast.finalRemainingDebt,
      value: formatTry(report.finalRemainingDebtKurus),
      helper: "24 aylık tahmin penceresi sonunda beklenen toplam borç.",
    },
    {
      label: trCopy.forecast.estimatedPayoffMonth,
      value: report.estimatedPayoffMonth ?? trCopy.forecast.outsideHorizon,
      helper: "İlk sıfır kalan borç ayı; yoksa tahmin penceresi dışı.",
    },
    {
      label: trCopy.forecast.totalInterest,
      value: formatTry(report.totalEstimatedInterestKurus),
      helper: "Mevcut faiz ve ödeme varsayımlarıyla toplam tahmini faiz etkisi.",
    },
    {
      label: trCopy.forecast.highestRisk,
      value: visibleRiskLabel(report.highestRiskLevel),
      helper: "24 aylık pencerede görülen en yüksek nakit akışı riski.",
    },
  ];

  return (
    <AppShell>
      <PageHeader kicker={trCopy.forecast.kicker} title={trCopy.forecast.title} description={trCopy.forecast.description} />

      {cannotBuildUsefulForecast ? (
        <section className="mt-6 rounded-lg border border-line bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{trCopy.forecast.setupTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">{trCopy.forecast.setupDescription}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {setupItems.map((item) => (
              <SetupCta key={item.label} {...item} />
            ))}
          </div>
        </section>
      ) : null}

      {activeDebts.length === 0 ? (
        <div className="mt-7"><EmptyState icon={TrendingUp} kicker="Tahmin verisi" title="Henüz borç tahmini oluşturulamıyor" description={trCopy.forecast.noActiveDebt} actions={<Link href="/debts" className="ui-primary-button">Borç ekle</Link>} /></div>
      ) : (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <article key={card.label} className="ui-card min-h-48">
                <p className="text-sm font-semibold text-steel">{card.label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight">{card.value}</p>
                <p className="mt-3 text-sm font-medium leading-6 text-steel">{card.helper}</p>
              </article>
            ))}
          </section>

          <section className="mt-6 rounded-lg border border-line bg-surface p-5 shadow-sm">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Bu tahmin neye dayanıyor?</h2>
              <p className="max-w-3xl text-sm leading-6 text-steel">
                Bu bölüm tahmini garanti gibi değil, hesaplama motorunun kullandığı varsayımlar ve kapsam olarak okumanız için
                hazırlanır.
              </p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {report.evidenceItems.map((item) => (
                <article key={item.id} className="rounded-md border border-line bg-surface-muted p-4">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm text-ink">{item.value}</p>
                  <p className="mt-2 text-xs leading-5 text-steel">{item.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-mint/20 bg-mint/10 p-5">
            <p className="text-sm font-semibold text-mint">Tahminin kısa okuması</p>
            <h2 className="mt-2 text-xl font-semibold">{report.coachSummary.title}</h2>
            <p className="mt-2 text-sm leading-6 text-steel">{report.coachSummary.body}</p>
            <p className="mt-2 text-sm leading-6 text-steel">Neden? {report.coachSummary.why}</p>
          </section>

          <ForecastScenarioPanel />

          <section className="mt-6">
            <h2 className="text-lg font-semibold">{trCopy.forecast.checkpointTitle}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {report.checkpoints.map((checkpoint) => (
                <article key={checkpoint.horizonMonths} className="rounded-lg border border-line bg-surface p-5 shadow-sm">
                  <h3 className="text-base font-semibold">{checkpoint.label}</h3>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-steel">Kalan borç</dt>
                      <dd className="font-semibold">{formatTry(checkpoint.remainingDebtKurus)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-steel">Dönem faizi</dt>
                      <dd>{formatTry(checkpoint.periodInterestKurus)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-steel">Ortalama yaşam bütçesi</dt>
                      <dd>{formatTry(checkpoint.averageLivingBudgetKurus)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-steel">En yüksek risk</dt>
                      <dd>{visibleRiskLabel(checkpoint.highestRiskLevel)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.forecast.debtTrend}</h2>
              <div className="mt-4">
                <ForecastDebtTrendChart trend={report.monthlyTrend} />
              </div>
            </article>
            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.forecast.livingBudgetTrend}</h2>
              <div className="mt-4">
                <ForecastLivingBudgetChart trend={report.monthlyTrend} />
              </div>
            </article>
          </section>

          <section className="mt-6 overflow-x-auto rounded-lg border border-line bg-surface">
            <div className="border-b border-line p-5">
              <h2 className="text-lg font-semibold">{trCopy.forecast.riskTrend}</h2>
            </div>
            <table className="product-data-table min-w-full divide-y divide-line text-sm">
              <thead className="bg-surface-muted text-left text-xs uppercase tracking-[0.12em] text-steel">
                <tr>
                  <th className="px-4 py-3">Ay</th>
                  <th className="px-4 py-3">Kalan borç</th>
                  <th className="px-4 py-3">Yaşam bütçesi</th>
                  <th className="px-4 py-3">Faiz etkisi</th>
                  <th className="px-4 py-3">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {report.monthlyTrend.map((month) => (
                  <tr key={month.month}>
                    <td className="px-4 py-3 font-medium">{month.month}</td>
                    <td className="px-4 py-3">{formatTry(month.remainingDebtKurus)}</td>
                    <td className="px-4 py-3">{formatTry(month.livingBudgetKurus)}</td>
                    <td className="px-4 py-3">{formatTry(month.interestKurus)}</td>
                    <td className="px-4 py-3">{visibleRiskLabel(month.riskLevel)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-3">
            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Risk zaman çizgisi</h2>
              <p className="mt-2 text-sm leading-6 text-steel">
                Risk görünen aylar, nedenleri ve gözden geçirilecek noktalar.
              </p>
              <div className="mt-4 space-y-3">
                {report.riskWarnings.length > 0 ? (
                  report.riskWarnings.map((warning) => (
                    <p key={warning.id} className="rounded-md border border-amber/25 bg-amber/10 p-3 text-sm leading-6 text-steel">
                      <span className="font-semibold">
                        {warning.month} - {visibleRiskLabel(warning.severity)} risk:
                      </span>{" "}
                      {warning.message}
                      <span className="mt-2 block text-xs leading-5">Neden? {warning.reason}</span>
                      <span className="mt-1 block text-xs leading-5">Gözden geçir: {warning.reviewSuggestion}</span>
                    </p>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-steel">{trCopy.forecast.noWarnings}</p>
                )}
              </div>
            </article>

            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold">İstersen deneyebileceğin senaryolar</h2>
              <p className="mt-2 text-sm leading-6 text-steel">
                Bunlar karar değildir; yalnızca tahmini değiştirebilecek varsayımları keşfetmek için başlangıç sorularıdır.
              </p>
              <div className="mt-4 space-y-3">
                {report.decisionPrompts.map((prompt) => (
                  <Link
                    key={prompt.id}
                    href={prompt.href}
                    className="block rounded-md border border-line bg-surface-muted p-3 text-sm transition hover:border-mint/40 hover:bg-mint/10"
                  >
                    <span className="font-semibold text-ink">{prompt.title}</span>
                    <span className="mt-1 block leading-6 text-steel">{prompt.description}</span>
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.forecast.payoffMilestones}</h2>
              <div className="mt-4 space-y-3">
                {report.payoffMilestones.length > 0 ? (
                  report.payoffMilestones.map((milestone) => (
                    <p key={`${milestone.debtAccountId}-${milestone.month}`} className="text-sm leading-6 text-steel">
                      <span className="font-semibold">{milestone.debtName}</span> için tahmini kapanış: {milestone.month}
                    </p>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-steel">{trCopy.forecast.noMilestones}</p>
                )}
              </div>
            </article>

            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.forecast.assumptions}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{report.narrativeContext.uncertaintyNote}</p>
              <dl className="mt-4 space-y-3">
                {report.assumptions.map((assumption) => (
                  <div key={assumption.id}>
                    <dt className="text-sm font-semibold">{assumption.label}</dt>
                    <dd className="mt-1 text-sm leading-6 text-steel">{assumption.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </section>
        </>
      )}
    </AppShell>
  );
}
