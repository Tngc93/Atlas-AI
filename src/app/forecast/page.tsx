import Link from "next/link";
import { AppShell } from "@/components/dashboard/AppShell";
import { ForecastDebtTrendChart, ForecastLivingBudgetChart } from "@/components/forecast/ForecastCharts";
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
        completed ? "border-mint/20 bg-mint/10 text-mint" : "border-ink/15 bg-white text-ink hover:bg-ink/[0.03]"
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
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-steel">{trCopy.forecast.kicker}</p>
        <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl">{trCopy.forecast.title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-ink/65">{trCopy.forecast.description}</p>
      </div>

      {cannotBuildUsefulForecast ? (
        <section className="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{trCopy.forecast.setupTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/60">{trCopy.forecast.setupDescription}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {setupItems.map((item) => (
              <SetupCta key={item.label} {...item} />
            ))}
          </div>
        </section>
      ) : null}

      {activeDebts.length === 0 ? (
        <section className="mt-6 rounded-lg border border-dashed border-ink/15 bg-white p-5 text-sm text-ink/65">
          {trCopy.forecast.noActiveDebt}
        </section>
      ) : (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <article key={card.label} className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <p className="text-sm text-ink/55">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
                <p className="mt-2 text-xs leading-5 text-ink/55">{card.helper}</p>
              </article>
            ))}
          </section>

          <section className="mt-6 rounded-lg border border-mint/20 bg-mint/10 p-5">
            <p className="text-sm font-semibold text-mint">{trCopy.forecast.coachTitle}</p>
            <h2 className="mt-2 text-xl font-semibold">{report.coachSummary.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">{report.coachSummary.body}</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">Neden? {report.coachSummary.why}</p>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">{trCopy.forecast.checkpointTitle}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {report.checkpoints.map((checkpoint) => (
                <article key={checkpoint.horizonMonths} className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-semibold">{checkpoint.label}</h3>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink/55">Kalan borç</dt>
                      <dd className="font-semibold">{formatTry(checkpoint.remainingDebtKurus)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink/55">Dönem faizi</dt>
                      <dd>{formatTry(checkpoint.periodInterestKurus)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink/55">Ortalama yaşam bütçesi</dt>
                      <dd>{formatTry(checkpoint.averageLivingBudgetKurus)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink/55">En yüksek risk</dt>
                      <dd>{visibleRiskLabel(checkpoint.highestRiskLevel)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.forecast.debtTrend}</h2>
              <div className="mt-4">
                <ForecastDebtTrendChart trend={report.monthlyTrend} />
              </div>
            </article>
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.forecast.livingBudgetTrend}</h2>
              <div className="mt-4">
                <ForecastLivingBudgetChart trend={report.monthlyTrend} />
              </div>
            </article>
          </section>

          <section className="mt-6 overflow-x-auto rounded-lg border border-ink/10 bg-white">
            <div className="border-b border-ink/10 p-5">
              <h2 className="text-lg font-semibold">{trCopy.forecast.riskTrend}</h2>
            </div>
            <table className="min-w-full divide-y divide-ink/10 text-sm">
              <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-[0.12em] text-ink/55">
                <tr>
                  <th className="px-4 py-3">Ay</th>
                  <th className="px-4 py-3">Kalan borç</th>
                  <th className="px-4 py-3">Yaşam bütçesi</th>
                  <th className="px-4 py-3">Faiz etkisi</th>
                  <th className="px-4 py-3">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
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
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.forecast.cashSqueeze}</h2>
              <div className="mt-4 space-y-3">
                {report.riskWarnings.length > 0 ? (
                  report.riskWarnings.map((warning) => (
                    <p key={warning.id} className="rounded-md border border-amber/25 bg-amber/10 p-3 text-sm leading-6 text-ink/70">
                      <span className="font-semibold">{warning.month}: </span>
                      {warning.message}
                    </p>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-ink/60">{trCopy.forecast.noWarnings}</p>
                )}
              </div>
            </article>

            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.forecast.payoffMilestones}</h2>
              <div className="mt-4 space-y-3">
                {report.payoffMilestones.length > 0 ? (
                  report.payoffMilestones.map((milestone) => (
                    <p key={`${milestone.debtAccountId}-${milestone.month}`} className="text-sm leading-6 text-ink/70">
                      <span className="font-semibold">{milestone.debtName}</span> için tahmini kapanış: {milestone.month}
                    </p>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-ink/60">{trCopy.forecast.noMilestones}</p>
                )}
              </div>
            </article>

            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.forecast.assumptions}</h2>
              <dl className="mt-4 space-y-3">
                {report.assumptions.map((assumption) => (
                  <div key={assumption.id}>
                    <dt className="text-sm font-semibold">{assumption.label}</dt>
                    <dd className="mt-1 text-sm leading-6 text-ink/60">{assumption.value}</dd>
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
