import Link from "next/link";
import { AppShell } from "@/components/dashboard/AppShell";
import { MemoryBudgetTrendChart, MemoryDebtTrendChart } from "@/components/memory/MemoryCharts";
import { formatTry } from "@/features/finance/money";
import { refreshFinancialMemoryAndRedirectAction } from "@/features/memory/actions";
import { getMemoryReportData } from "@/features/memory/repository";
import { buildFinancialMemoryReport } from "@/features/memory/service";
import type { MemoryWindowComparison } from "@/features/memory/types";
import { trCopy } from "@/lib/copy/tr";
import { EmptyState, PageHeader } from "@/components/ui/Primitives";
import { History } from "lucide-react";

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
      <p role="status" aria-live="polite" className="rounded-xl border border-mint/25 bg-mint/10 p-4 text-sm font-semibold text-mint">
        Finansal hafıza güncellendi.
      </p>
    );
  }

  if (notice === "memoryError") {
    return (
      <p role="alert" className="rounded-xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">
        Finansal hafıza güncellenemedi. Kayıtlarınızı kontrol edip tekrar deneyin.
      </p>
    );
  }

  return null;
}

function WindowCard({ comparison }: { comparison: MemoryWindowComparison }) {
  return (
    <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
      <h3 className="text-base font-semibold">Son {comparison.months} ay</h3>
      {comparison.hasEnoughHistory ? (
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-steel">Toplam borç farkı</dt>
            <dd className="font-semibold">{formatTry(comparison.totalDebtDeltaKurus)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-steel">Yaşam bütçesi farkı</dt>
            <dd>{formatTry(comparison.survivalBudgetDeltaKurus)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-steel">Gider / maaş oranı</dt>
            <dd>{formatPercent(comparison.mandatoryExpenseRatioDelta)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-steel">Yüksek riskli ay</dt>
            <dd>{comparison.highRiskMonthCount}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm leading-6 text-steel">
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
      <PageHeader kicker={trCopy.memory.kicker} title={trCopy.memory.title} description={`${trCopy.memory.description} Finansal Hafıza yapılandırılmış aylık finans snapshot’larını saklar; gizli AI hafızası değildir.`} action={
        <form action={refreshFinancialMemoryAndRedirectAction}>
          <button className="ui-primary-button">
            {trCopy.memory.refresh}
          </button>
        </form>
      } />

      <div className="mt-4">
        <Notice notice={params?.notice} />
      </div>

      {!report.hasAnySnapshot ? (
        <div className="mt-7"><EmptyState icon={History} kicker="Yapılandırılmış snapshot" title={trCopy.memory.emptyTitle} description={trCopy.memory.emptyDescription} actions={
          <>
            <Link className="rounded-md border border-line px-3 py-2 text-sm font-semibold" href="/income">
              Gelir ekle
            </Link>
            <Link className="rounded-md border border-line px-3 py-2 text-sm font-semibold" href="/expenses">
              Gider ekle
            </Link>
            <Link className="rounded-md border border-line px-3 py-2 text-sm font-semibold" href="/debts">
              Borç ekle
            </Link>
          </>
        } /></div>
      ) : null}

      {latest ? (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <p className="text-sm text-steel">Son snapshot</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{latest.periodMonth}</p>
              <p className="mt-2 text-xs leading-5 text-steel">Tetikleyici: {trCopy.memory.triggers[latest.trigger]}</p>
            </article>
            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <p className="text-sm text-steel">Toplam borç</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{formatTry(latest.totalDebtKurus)}</p>
              <p className="mt-2 text-xs leading-5 text-steel">Aktif borç: {formatTry(latest.activeDebtKurus)}</p>
            </article>
            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <p className="text-sm text-steel">Yaşam bütçesi</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{formatTry(latest.survivalBudgetKurus)}</p>
              <p className="mt-2 text-xs leading-5 text-steel">Günlük limit: {formatTry(latest.dailyLimitKurus)}</p>
            </article>
            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <p className="text-sm text-steel">Risk seviyesi</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{riskLabel(latest.riskLevel)}</p>
              <p className="mt-2 text-xs leading-5 text-steel">{latest.criticalReasonCount} kritik neden, {latest.warningCount} uyarı</p>
            </article>
          </section>

          {!report.hasEnoughHistory ? (
            <section className="mt-6 rounded-lg border border-amber/25 bg-amber/10 p-5">
              <h2 className="text-lg font-semibold">{trCopy.memory.notEnoughHistoryTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{trCopy.memory.notEnoughHistoryDescription}</p>
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
            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.memory.debtTrend}</h2>
              <div className="mt-4">
                <MemoryDebtTrendChart trend={report.trend} />
              </div>
            </article>
            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.memory.budgetTrend}</h2>
              <div className="mt-4">
                <MemoryBudgetTrendChart trend={report.trend} />
              </div>
            </article>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-3">
            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm xl:col-span-2">
              <h2 className="text-lg font-semibold">{trCopy.memory.insights}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {report.insights.map((item) => (
                  <div key={item.id} className="rounded-md border border-line bg-paper p-4">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-steel">{item.body}</p>
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{report.planAdherence.label}</h2>
              <p className="mt-3 text-3xl font-semibold">{report.planAdherence.score == null ? "Yeterli geçmiş yok" : `%${report.planAdherence.score}`}</p>
              <p className="mt-3 text-sm leading-6 text-steel">{report.planAdherence.helper}</p>
            </article>
          </section>

          <section className="mt-6 rounded-lg border border-line bg-surface p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{trCopy.memory.categoryChanges}</h2>
            {report.categoryChanges.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="product-data-table min-w-full divide-y divide-line text-sm">
                  <thead className="bg-surface-muted text-left text-xs uppercase tracking-[0.12em] text-steel">
                    <tr>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Güncel</th>
                      <th className="px-4 py-3">Önceki</th>
                      <th className="px-4 py-3">Fark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
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
              <p className="mt-3 text-sm leading-6 text-steel">Kategori değişimi için en az iki snapshot gerekir.</p>
            )}
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
