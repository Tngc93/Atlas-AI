import Link from "next/link";
import { AppShell } from "@/components/dashboard/AppShell";
import { PayoffRoadmapChart } from "@/components/dashboard/DashboardCharts";
import { getMonthlyFinancePlanSnapshot } from "@/features/finance/data-service";
import { formatTry } from "@/features/finance/money";
import { trCopy } from "@/lib/copy/tr";
import type { RiskLevel } from "@/features/finance/types";

export const dynamic = "force-dynamic";

function getVisibleRiskLabel(riskLevel: RiskLevel): string {
  return riskLevel === "critical" ? trCopy.risk.high : trCopy.risk[riskLevel];
}

export default async function MonthlyPlanPage() {
  const { hasProfile, debts, expenses, monthlyPlan } = await getMonthlyFinancePlanSnapshot(24);
  const roadmap = monthlyPlan.payoffForecast;
  const hasActiveDebt = debts.some((debt) => debt.status === "active");
  const missingPlanInputs = [
    {
      label: "Gelir kaydı",
      href: "/income",
      cta: "Gelir ekle",
      completed: hasProfile && monthlyPlan.cashFlow.salaryKurus > 0,
    },
    {
      label: "Zorunlu gider kaydı",
      href: "/expenses",
      cta: "Gider ekle",
      completed: expenses.length > 0,
    },
    {
      label: "Aktif borç kaydı",
      href: "/debts",
      cta: "Borç ekle",
      completed: hasActiveDebt,
    },
  ];
  const cannotBuildUsefulPlan = missingPlanInputs.some((item) => !item.completed);

  return (
    <AppShell>
      <section className="rounded-lg border border-line bg-surface p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{trCopy.plan.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">{trCopy.plan.description}</p>
        {cannotBuildUsefulPlan ? (
          <div className="mt-6 rounded-md border border-dashed border-line bg-surface-muted p-4">
            <h2 className="text-base font-semibold">Aylık plan için eksik bilgiler var</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">
              Uygulanabilir bir borç ödeme planı için gelir, zorunlu gider ve en az bir aktif borç kaydı gerekir. Bu ekran
              kayıtlı finans bilgilerinizle çalışır; demo veri otomatik kullanılmaz.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {missingPlanInputs.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    item.completed
                      ? "border-mint/20 bg-mint/10 text-mint"
                      : "border-line bg-surface text-ink hover:bg-surface-muted"
                  }`}
                >
                  {item.completed ? `${item.label} tamam` : item.cta}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <PayoffRoadmapChart months={roadmap} />
          </div>
        )}
      </section>

      {cannotBuildUsefulPlan ? null : (
        <>
          <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{trCopy.plan.actionPlan}</h2>
              <div className="mt-4 space-y-3">
                {monthlyPlan.actionPlan.map((action) => (
                  <article key={action.id} className="rounded-md border border-line bg-surface-muted p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold">{action.title}</h3>
                      <span className="rounded-md bg-surface px-2 py-1 text-xs font-semibold text-steel">
                        {trCopy.risk[action.priority]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-steel">{action.description}</p>
                    {typeof action.amountKurus === "number" ? (
                      <p className="mt-2 text-sm font-semibold text-mint">{formatTry(action.amountKurus)}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-line bg-surface">
              <div className="border-b border-line p-5">
                <h2 className="text-lg font-semibold">{trCopy.plan.paymentPlan}</h2>
              </div>
              <table className="min-w-full divide-y divide-line text-sm">
                <thead className="bg-surface-muted text-left text-xs uppercase tracking-[0.12em] text-steel">
                  <tr>
                    <th className="px-4 py-3">{trCopy.table.debt}</th>
                    <th className="px-4 py-3">{trCopy.table.minimum}</th>
                    <th className="px-4 py-3">{trCopy.plan.extraPayoff}</th>
                    <th className="px-4 py-3">{trCopy.plan.interest}</th>
                    <th className="px-4 py-3">{trCopy.plan.totalPayment}</th>
                    <th className="px-4 py-3">{trCopy.table.endingBalance}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {monthlyPlan.paymentAllocations.map((payment) => (
                    <tr key={payment.debtAccountId}>
                      <td className="px-4 py-3 font-medium">{payment.debtName}</td>
                      <td className="px-4 py-3">{formatTry(payment.minimumPaymentKurus)}</td>
                      <td className="px-4 py-3">{formatTry(payment.extraPaymentKurus)}</td>
                      <td className="px-4 py-3">{formatTry(payment.interestChargedKurus)}</td>
                      <td className="px-4 py-3 font-medium text-mint">{formatTry(payment.totalPaymentKurus)}</td>
                      <td className="px-4 py-3">{formatTry(payment.endingBalanceKurus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-surface-muted text-left text-xs uppercase tracking-[0.12em] text-steel">
                <tr>
                  <th className="px-4 py-3">Ay</th>
                  <th className="px-4 py-3">{trCopy.plan.extraPayoff}</th>
                  <th className="px-4 py-3">{trCopy.plan.survivalBudget}</th>
                  <th className="px-4 py-3">{trCopy.plan.risk}</th>
                  <th className="px-4 py-3">{trCopy.plan.remainingDebt}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {roadmap.map((month) => (
                  <tr key={month.month}>
                    <td className="px-4 py-3 font-medium">{month.month}</td>
                    <td className="px-4 py-3">{formatTry(month.extraDebtPaymentKurus)}</td>
                    <td className="px-4 py-3">{formatTry(month.survivalBudgetKurus)}</td>
                    <td className="px-4 py-3">{getVisibleRiskLabel(month.riskLevel)}</td>
                    <td className="px-4 py-3">
                      {formatTry(month.debtProjections.reduce((total, debt) => total + debt.endingBalanceKurus, 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </AppShell>
  );
}
