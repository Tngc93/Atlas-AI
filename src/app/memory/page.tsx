import Link from "next/link";
import { AppShell } from "@/components/dashboard/AppShell";
import { MemoryBudgetTrendChart, MemoryDebtTrendChart } from "@/components/memory/MemoryCharts";
import { formatTry } from "@/features/finance/money";
import { refreshFinancialMemoryAndRedirectAction } from "@/features/memory/actions";
import { getMemoryReportData } from "@/features/memory/repository";
import { buildFinancialMemoryReport } from "@/features/memory/service";
import type { MemoryWindowComparison } from "@/features/memory/types";
import { trCopy } from "@/lib/copy/tr";

export const dynamic = "force-dynamic";

function formatPercent(value: number) {
  return `${(value * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} puan`;
}

function riskLabel(riskLevel: "low" | "medium" | "high") {
  return trCopy.risk[riskLevel];
}

function Notice({ notice }: { notice?: string }) {
  if (notice === "memoryUpdated") {
    return (
      <p role="status" className="rounded-md border border-mint/20 bg-mint/10 p-3 text-sm text-mint">
        Finansal hafıza güncellendi.
      </p>
    );
  }

  if (notice === "memoryError") {
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Finansal hafıza güncellenemedi. Kayıtlarınızı kontrol edip tekrar deneyin.
      </p>
    );
  }

  return null;
}

function WindowCard({ comparison }: { comparison: MemoryWindowComparison }) {
  return (
    <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold">Son {comparison.months} ay</h3>
      {comparison.hasEnoughHistory ? (
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">Toplam borç farkı</dt>
            <dd className="font-semibold">{formatTry(comparison.totalDebtDeltaKurus)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">Yaşam bütçesi farkı</dt>
            <dd>{formatTry(comparison.survivalBudgetDeltaKurus)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">Gider / maaş oranı</dt>
            <dd>{formatPercent(comparison.mandatoryExpenseRatioDelta)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">Yüksek riskli ay</dt>
            <dd>{comparison.highRiskMonthCount}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm leading-6 text-ink/60">
          Yeterli geçmiş yok. Bu karşılaştırma için en az iki aylık hafıza gerekir; mevcut kayıt sayısı {comparison.availableMonths}.
        </p>
      )}
    </article>
  );
}

export default async function MemoryPage({ searchParams }: { searchParams?: Promise<{ notice?: string }> }) {
  const params = await searchParams;
  const snapshots = await getMemoryReportData();
  const report = buildFinancialMemoryReport(snapshots);
  const latest = report.latestSnapshot;

  return (
    <AppShell>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-steel">{trCopy.memory.kicker}</p>
          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl">{trCopy.memory.title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-ink/65">{trCopy.memory.description}</p>
        </div>
        <form action={refreshFinancialMemoryAndRedirectAction}>
          <button className="rounded-md bg-mint px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-mint/90 focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2">
            {trCopy.memory.refresh}
          </button>
        </form>
      </div>

      <div className="mt-4">
        <Notice notice={params?.notice} />
      </div>

      {!report.hasAnySnapshot ? (
        <section className="mt-6 rounded-lg border border-dashed border-ink/15 bg-white p-5">
          <h2 className="text-lg font-semibold">{trCopy.memory.emptyTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/60">{trCopy.memory.emptyDescription}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold" href="/income">
              Gelir ekle
            </Link>
            <Link className="rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold" href="/expenses">
              Gider ekle
            </Link>
            <Link className="rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold" href="/debts">
              Borç ekle
            </Link>
          </div>
        </section>
      ) : null}

      {latest ? (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <p className="text-sm text-ink/55">Son snapshot</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{latest.periodMonth}</p>
              <p className="mt-2 text-xs leading-5 text-ink/55">Tetikleyici: {trCopy.memory.triggers[latest.trigger]}</p>
            </article>
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <p className="text-sm text-ink/55">Toplam borç</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{formatTry(latest.totalDebtKurus)}</p>
              <p className="mt-2 text-xs leading-5 text-ink/55">Aktif borç: {formatTry(latest.activeDebtKurus)}</p>
            </article>
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <p className="text-sm text-ink/55">Yaşam bütçesi</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{formatTry(latest.survivalBudgetKurus)}</p>
              <p className="mt-2 text-xs leading-5 text-ink/55">Günlük limit: {formatTry(latest.dailyLimitKurus)}</p>
            </article>
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <p className="text-sm text-ink/55">Risk seviyesi</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{riskLabel(latest.riskLevel)}</p>
              <p className="mt-2 text-xs leading-5 text-ink/55">{latest.criticalReasonCount} kritik neden, {latest.warningCount} uyarı</p>
            </article>
          </section>

          {!report.hasEnoughHistory ? (
            <section className="mt-6 rounded-lg border border-amber/25 bg-amber/10 p-5">
              <h2 className="text-lg font-semibold">{trCopy.memory.notEnoughHistoryTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/70">{trCopy.memory.notEnoughHistoryDescription}</p>
            </section>
          ) : null}

          <section className="mt-6">
            <h2 className="text-lg font-semibold">{trCopy.memory.comparisons}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {report.comparisons.map((comparison) => (
                <WindowCard key={comparison.months} comparison={comparison} />
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.memory.debtTrend}</h2>
              <div className="mt-4">
                <MemoryDebtTrendChart trend={report.trend} />
              </div>
            </article>
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.memory.budgetTrend}</h2>
              <div className="mt-4">
                <MemoryBudgetTrendChart trend={report.trend} />
              </div>
            </article>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-3">
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm xl:col-span-2">
              <h2 className="text-lg font-semibold">{trCopy.memory.insights}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {report.insights.map((item) => (
                  <div key={item.id} className="rounded-md border border-ink/10 bg-paper p-4">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{item.body}</p>
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{report.planAdherence.label}</h2>
              <p className="mt-3 text-3xl font-semibold">{report.planAdherence.score == null ? "Yeterli geçmiş yok" : `%${report.planAdherence.score}`}</p>
              <p className="mt-3 text-sm leading-6 text-ink/60">{report.planAdherence.helper}</p>
            </article>
          </section>

          <section className="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{trCopy.memory.categoryChanges}</h2>
            {report.categoryChanges.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-ink/10 text-sm">
                  <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-[0.12em] text-ink/55">
                    <tr>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Güncel</th>
                      <th className="px-4 py-3">Önceki</th>
                      <th className="px-4 py-3">Fark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {report.categoryChanges.map((category) => (
                      <tr key={category.category}>
                        <td className="px-4 py-3 font-medium">{category.category}</td>
                        <td className="px-4 py-3">{formatTry(category.currentAmountKurus)}</td>
                        <td className="px-4 py-3">{formatTry(category.previousAmountKurus)}</td>
                        <td className="px-4 py-3">{formatTry(category.deltaKurus)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-ink/60">Kategori değişimi için en az iki snapshot gerekir.</p>
            )}
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
