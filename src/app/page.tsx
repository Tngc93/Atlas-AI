import Link from "next/link";
import { AppShell } from "@/components/dashboard/AppShell";
import { CoachPanel } from "@/components/dashboard/CoachPanel";
import { DebtPriorityTable } from "@/components/dashboard/DebtPriorityTable";
import { PayoffRoadmapChart, SalaryWaterfall } from "@/components/dashboard/DashboardCharts";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RatePanel } from "@/components/dashboard/RatePanel";
import { buildCoachInputSummary, generateCoachInsight } from "@/features/coach/orchestrator";
import { getMonthlyFinancePlanSnapshot } from "@/features/finance/data-service";
import { formatTry } from "@/features/finance/money";
import { getLatestInterestRateSnapshot } from "@/features/rates/service";
import { trCopy } from "@/lib/copy/tr";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [{ hasProfile, debts, expenses, monthlyPlan }, rateSnapshot] = await Promise.all([
    getMonthlyFinancePlanSnapshot(12),
    getLatestInterestRateSnapshot(),
  ]);
  const coachInsight = await generateCoachInsight(buildCoachInputSummary(monthlyPlan, rateSnapshot));
  const allocation = monthlyPlan.cashFlow;
  const isEmpty = !hasProfile && debts.length === 0 && expenses.length === 0;
  const setupItems = [
    {
      title: "Güncel maaşını ekle",
      description: "Aylık planın başlangıç noktası gelir kaydıdır.",
      href: "/income",
      cta: "Gelire git",
      completed: hasProfile && allocation.salaryKurus > 0,
    },
    {
      title: "Zorunlu giderlerini yaz",
      description: "Kira, faturalar ve temel yaşam giderleri önce korunur.",
      href: "/expenses",
      cta: "Giderlere git",
      completed: expenses.length > 0,
    },
    {
      title: "Aktif borçlarını gir",
      description: "Asgari ödemeler, faiz baskısı ve ödeme önceliği buradan hesaplanır.",
      href: "/debts",
      cta: "Borçlara git",
      completed: debts.some((debt) => debt.status === "active"),
    },
  ];
  const hasIncompleteSetup = setupItems.some((item) => !item.completed);

  return (
    <AppShell>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-steel">{trCopy.dashboard.kicker}</p>
        <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl">{trCopy.dashboard.title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-ink/65">{trCopy.dashboard.intro}</p>
      </div>

      {hasIncompleteSetup ? <FirstSetupChecklist isEmpty={isEmpty} items={setupItems} /> : null}

      <section className="mt-6 rounded-lg border border-mint/20 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Karar desteği</p>
            <h2 className="mt-2 text-lg font-semibold">“Şunu yaparsam ne olur?” sorularını simüle edin</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/60">
              Ek ödeme, maaş artışı, bonus veya gider azaltımı gibi kararları gerçek kayıtlarınızı değiştirmeden karşılaştırın.
            </p>
          </div>
          <Link
            href="/decisions"
            className="inline-flex w-fit items-center justify-center rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/85"
          >
            Karar Simülatörünü Aç
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={trCopy.dashboard.monthlySalary}
          value={formatTry(allocation.salaryKurus)}
          helper={trCopy.dashboard.monthlySalaryHelper}
        />
        <MetricCard
          label={trCopy.dashboard.mandatoryExpenses}
          value={formatTry(allocation.mandatoryExpenseTotalKurus)}
          helper={trCopy.dashboard.mandatoryExpensesHelper}
        />
        <MetricCard
          label={trCopy.dashboard.minimumPayments}
          value={formatTry(allocation.minimumDebtPaymentsKurus)}
          helper={trCopy.dashboard.minimumPaymentsHelper}
        />
        <MetricCard
          label={trCopy.dashboard.survivalBudget}
          value={formatTry(monthlyPlan.livingBudget.remainingForMonthKurus)}
          helper={trCopy.dashboard.survivalBudgetHelper}
          risk={monthlyPlan.riskLevel}
        />
        <MetricCard
          label={trCopy.dashboard.dailyLimit}
          value={formatTry(monthlyPlan.livingBudget.dailyLimitKurus)}
          helper={trCopy.dashboard.dailyLimitHelper}
        />
        <MetricCard
          label={trCopy.dashboard.weeklyLimit}
          value={formatTry(monthlyPlan.livingBudget.weeklyLimitKurus)}
          helper={trCopy.dashboard.weeklyLimitHelper}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0 rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{trCopy.dashboard.salaryAllocation}</h2>
              <p className="mt-1 text-sm text-ink/60">{trCopy.dashboard.salaryAllocationHelper}</p>
            </div>
          </div>
          <SalaryWaterfall allocation={allocation} />
        </div>
        <CoachPanel insight={coachInsight} />
      </section>

      <section className="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">{trCopy.dashboard.riskTitle}</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md bg-coral/10 p-4">
            <h3 className="text-sm font-semibold text-coral">{trCopy.dashboard.criticalReasons}</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              {(monthlyPlan.criticalReasons.length > 0 ? monthlyPlan.criticalReasons : [trCopy.dashboard.noWarnings]).map(
                (reason) => (
                  <li key={reason}>• {reason}</li>
                ),
              )}
            </ul>
          </div>
          <div className="rounded-md bg-amber/10 p-4">
            <h3 className="text-sm font-semibold text-amber">{trCopy.dashboard.warnings}</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              {(monthlyPlan.warnings.length > 0 ? monthlyPlan.warnings : [trCopy.dashboard.noWarnings]).map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <RatePanel initialSnapshot={rateSnapshot} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="min-w-0">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">{trCopy.dashboard.debtPriority}</h2>
            <p className="mt-1 text-sm text-ink/60">{trCopy.dashboard.debtPriorityHelper}</p>
          </div>
          <DebtPriorityTable debts={monthlyPlan.debtPriorities} />
        </div>
        <div className="min-w-0 rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{trCopy.dashboard.payoffRoadmap}</h2>
          <p className="mt-1 text-sm text-ink/60">{trCopy.dashboard.payoffRoadmapHelper}</p>
          <PayoffRoadmapChart months={monthlyPlan.payoffForecast} />
        </div>
      </section>
    </AppShell>
  );
}

function FirstSetupChecklist({
  isEmpty,
  items,
}: {
  isEmpty: boolean;
  items: { title: string; description: string; href: string; cta: string; completed: boolean }[];
}) {
  return (
    <section className="mt-6 rounded-lg border border-mint/20 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">İlk kurulum</p>
          <h2 className="mt-2 text-lg font-semibold">
            {isEmpty ? "Finans koçunu çalıştırmak için üç temel kaydı ekleyin" : "Kurulumda eksik kalan adımları tamamlayın"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/60">
            Panel gerçek SQLite verinizle hesaplanır. Başlangıçta gerçek finansal veri veya otomatik seed kullanılmaz; yalnızca
            sizin eklediğiniz lokal kayıtlar kullanılır.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.title}
            className={`rounded-md border p-4 ${item.completed ? "border-mint/20 bg-mint/10" : "border-ink/10 bg-ink/[0.02]"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  item.completed ? "bg-mint/15 text-mint" : "bg-amber/15 text-amber"
                }`}
              >
                {item.completed ? "Tamam" : "Eksik"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/60">{item.description}</p>
            <Link
              href={item.href}
              className="mt-4 inline-flex items-center justify-center rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-ink/[0.03]"
            >
              {item.cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
