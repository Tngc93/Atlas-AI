import Link from "next/link";
import {
  Award,
  ArrowRight,
  Bot,
  CalendarClock,
  LockKeyhole,
  ShieldCheck,
  Sunrise,
  Target,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { CoachPanel } from "@/components/dashboard/CoachPanel";
import { DashboardDecisionBrief } from "@/components/dashboard/DashboardDecisionBrief";
import { DebtPriorityTable } from "@/components/dashboard/DebtPriorityTable";
import { PayoffRoadmapChart, SalaryWaterfall } from "@/components/dashboard/DashboardCharts";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RatePanel } from "@/components/dashboard/RatePanel";
import { ReminderPanel } from "@/components/reminders/ReminderPanel";
import { ActionBanner, ChartCard, RiskBadge, SetupStepCard, StatusPill } from "@/components/ui/Primitives";
import { buildCoachInputSummary, generateCoachInsight } from "@/features/coach/orchestrator";
import { buildDashboardDecisionBrief } from "@/features/finance/dashboard-brief";
import { getMonthlyFinancePlanSnapshot } from "@/features/finance/data-service";
import { formatTry } from "@/features/finance/money";
import type { DebtPriority } from "@/features/finance/types";
import { listReminderStates } from "@/features/reminders/repository";
import { applyReminderStates, buildReminderItems } from "@/features/reminders/service";
import { getLatestInterestRateSnapshot } from "@/features/rates/service";
import { trCopy } from "@/lib/copy/tr";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [{ hasProfile, profile, debts, expenses, monthlyPlan }, rateSnapshot] = await Promise.all([
    getMonthlyFinancePlanSnapshot(12),
    getLatestInterestRateSnapshot(),
  ]);
  const coachInsight = await generateCoachInsight(buildCoachInputSummary(monthlyPlan, rateSnapshot));
  const generatedReminders = buildReminderItems({ hasProfile, profile, debts, expenses, monthlyPlan });
  const reminderStates = await listReminderStates(generatedReminders.map((reminder) => reminder.key));
  const reminderInbox = applyReminderStates(
    generatedReminders,
    reminderStates,
    new Date(`${monthlyPlan.asOfDateIso}T12:00:00.000Z`),
  );
  const allocation = monthlyPlan.cashFlow;
  const decisionBrief = buildDashboardDecisionBrief(monthlyPlan);
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
  const nextAction =
    monthlyPlan.actionPlan[0]?.description ??
    "Gelir, zorunlu gider ve aktif borç kayıtlarını tamamlayarak finans koçunu çalıştırın.";
  const primaryRiskReason =
    monthlyPlan.criticalReasons[0] ?? monthlyPlan.warnings[0] ?? "Bu ay için belirgin nakit akışı uyarısı yok.";
  const hasCriticalRisk = monthlyPlan.criticalReasons.length > 0;
  const safeBudget = monthlyPlan.livingBudget.remainingForMonthKurus;
  const safeBudgetReason =
    safeBudget > 0
      ? "Zorunlu giderler ve asgari borç ödemeleri sonrası kullanılabilir alan korunuyor."
      : "Bu ay yaşam bütçesi eşiği korunamadığı için yeni harcama kararları baskı yaratabilir.";
  const aiModeLabel =
    coachInsight.providerMode === "live"
      ? "Canlı AI"
      : coachInsight.providerMode === "mock"
        ? "Demo koç"
        : coachInsight.providerMode === "fallback"
          ? "Güvenli yedek yorum"
          : "Güvenli AI modu";
  const paymentPlanItems = monthlyPlan.debtPriorities.slice(0, 3);
  const primaryPayment = [...monthlyPlan.paymentAllocations].sort((a, b) => b.totalPaymentKurus - a.totalPaymentKurus)[0];
  const primaryDebt = primaryPayment
    ? monthlyPlan.debtPriorities.find((debt) => debt.id === primaryPayment.debtAccountId)
    : undefined;
  const actionAmount = monthlyPlan.actionPlan[0]?.amountKurus ?? primaryPayment?.totalPaymentKurus ?? 0;
  const actionTarget = primaryPayment?.debtName ?? monthlyPlan.actionPlan[0]?.title ?? "Aylık plan";
  const actionDue = formatActionDue(monthlyPlan.actionPlan[0]?.dueDateIso, primaryDebt?.dueDay);
  const health = getFinancialHealthCopy(monthlyPlan.riskLevel, safeBudget);
  const topRiskAction = hasCriticalRisk ? "Önce asgari ödeme ve yaşam bütçesini koru." : "Mevcut planı bozma; harcamayı güvenli limitte tut.";
  const totalStartingDebt = monthlyPlan.paymentAllocations.reduce((total, payment) => total + payment.startingBalanceKurus, 0);
  const totalEndingDebt = monthlyPlan.paymentAllocations.reduce((total, payment) => total + payment.endingBalanceKurus, 0);
  const plannedDebtReduction = Math.max(0, totalStartingDebt - totalEndingDebt);
  const motivation = getMotivationCopy({
    riskLevel: monthlyPlan.riskLevel,
    safeBudget,
    plannedDebtReduction,
    minimumPaymentsCovered: allocation.minimumPaymentsCovered,
  });
  const dailyBriefingItems = buildDailyBriefingItems({
    coachSummary: coachInsight.summary,
    risk: coachInsight.sections.risks[0]?.finding ?? primaryRiskReason,
    action: coachInsight.sections.monthlyActions[0]?.action ?? nextAction,
    motivation,
  });
  const aiCoachLines = [
    dailyBriefingItems[0].body,
    dailyBriefingItems[1].body,
    dailyBriefingItems[2].body,
  ].filter(Boolean);

  return (
    <AppShell>
      <HeroExperience
        health={health}
        riskLabel={trCopy.risk[monthlyPlan.riskLevel]}
        actionTarget={actionTarget}
        actionAmount={actionAmount}
        actionDue={actionDue}
        nextAction={nextAction}
        expectedImpact={buildActionImpact(primaryPayment?.extraPaymentKurus ?? allocation.extraDebtPaymentKurus)}
        aiModeLabel={aiModeLabel}
        aiCoachLines={aiCoachLines}
        motivation={motivation}
      />

      <TrustLayer />

      <div className="mt-8">
        <ReminderPanel reminders={reminderInbox.items.slice(0, 3)} totalCount={reminderInbox.totalGenerated} compact />
      </div>

      <DashboardDecisionBrief brief={decisionBrief} />

      {hasIncompleteSetup ? <FirstSetupChecklist isEmpty={isEmpty} items={setupItems} /> : null}

      <DailyBriefing items={dailyBriefingItems} dateLabel={formatBriefingDate(monthlyPlan.asOfDateIso)} />

      <section className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <SafeBudgetSpotlight
          remaining={safeBudget}
          daily={monthlyPlan.livingBudget.dailyLimitKurus}
          weekly={monthlyPlan.livingBudget.weeklyLimitKurus}
          daysRemaining={monthlyPlan.livingBudget.daysRemainingInMonth}
          reason={safeBudgetReason}
        />
        <div className="grid gap-5">
          <RiskDecisionCard
            riskLabel={trCopy.risk[monthlyPlan.riskLevel]}
            status={hasCriticalRisk ? "Aksiyon gerekli" : "Kontrol altında"}
            reason={primaryRiskReason}
            action={topRiskAction}
          />
          <NextActionCard
            target={actionTarget}
            amount={actionAmount}
            due={actionDue}
            reason={nextAction}
            impact={buildActionImpact(primaryPayment?.extraPaymentKurus ?? allocation.extraDebtPaymentKurus)}
          />
        </div>
      </section>

      <div className="mt-6">
        <ActionBanner
          kicker="Karar desteği"
          title="“Şunu yaparsam ne olur?” sorularını simüle edin"
          description="Ek ödeme, maaş artışı, bonus veya gider azaltımı gibi kararları gerçek kayıtlarınızı değiştirmeden karşılaştırın."
          href="/decisions"
          cta="Karar Simülatörünü Aç"
        />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">Kontrol metrikleri</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">Kararı etkileyen finansal sınırlar</h2>
          </div>
          <RiskBadge riskLevel={monthlyPlan.riskLevel} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <MetricCard
          label="Ek ödeme potansiyeli"
          value={formatTry(allocation.extraDebtPaymentKurus)}
          helper="Hayatta kalma eşiği korunduktan sonra borca ayrılabilecek tutar."
        />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard
          title={trCopy.dashboard.salaryAllocation}
          description={`Bu trend ne anlama geliyor? Maaşın önce zorunlu yaşam giderlerini ve asgari borç ödemelerini koruyor; kalan alan ${formatTry(
            allocation.extraDebtPaymentKurus,
          )} ek ödeme potansiyeli gösteriyor.`}
        >
          <SalaryWaterfall allocation={allocation} />
        </ChartCard>
        <CoachPanel insight={coachInsight} />
      </section>

      <section className="mt-6 ui-card">
        <h2 className="text-lg font-semibold">{trCopy.dashboard.riskTitle}</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-coral/25 bg-coral/10 p-4">
            <h3 className="text-sm font-semibold text-coral">{trCopy.dashboard.criticalReasons}</h3>
            <ul className="mt-3 space-y-2 text-sm text-steel">
              {(monthlyPlan.criticalReasons.length > 0 ? monthlyPlan.criticalReasons : [trCopy.dashboard.noWarnings]).map(
                (reason) => (
                  <li key={reason}>• {reason}</li>
                ),
              )}
            </ul>
          </div>
          <div className="rounded-md border border-amber/25 bg-amber/10 p-4">
            <h3 className="text-sm font-semibold text-amber">{trCopy.dashboard.warnings}</h3>
            <ul className="mt-3 space-y-2 text-sm text-steel">
              {(monthlyPlan.warnings.length > 0 ? monthlyPlan.warnings : [trCopy.dashboard.noWarnings]).map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-6 ui-card">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Önerilen ödeme planı</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">Borç önceliğini aksiyon kartı olarak takip et</h2>
          </div>
          <StatusPill tone={paymentPlanItems.length > 0 ? "accent" : "warning"}>
            {paymentPlanItems.length > 0 ? `${paymentPlanItems.length} öneri` : "Borç kaydı bekleniyor"}
          </StatusPill>
        </div>
        {paymentPlanItems.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-3">
            {paymentPlanItems.map((debt) => (
              <PaymentPlanCard key={debt.id} debt={debt} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-surface-muted p-5 text-sm text-steel">
            Aktif borç eklediğinizde bu alanda önerilen minimum ve ek ödeme adımları görünecek.
          </div>
        )}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="min-w-0">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">{trCopy.dashboard.debtPriority}</h2>
            <p className="mt-1 text-sm text-steel">Detay tablo: faiz, vade ve kalan bakiye bilgileri burada incelenir.</p>
          </div>
          <DebtPriorityTable debts={monthlyPlan.debtPriorities} />
        </div>
        <ChartCard
          title={trCopy.dashboard.payoffRoadmap}
          description="Bu trend ne anlama geliyor? Önerilen ödemeler uygulandığında borç bakiyesinin nasıl azalacağı tahmini olarak gösterilir."
        >
          <PayoffRoadmapChart months={monthlyPlan.payoffForecast} />
        </ChartCard>
      </section>

      <section className="mt-6">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">Detay</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">Faiz referans bağlamı</h2>
        </div>
        <RatePanel initialSnapshot={rateSnapshot} />
      </section>

      <TomorrowReason
        safeBudget={safeBudget}
        actionDue={actionDue}
        riskLabel={trCopy.risk[monthlyPlan.riskLevel]}
        motivation={motivation}
      />
    </AppShell>
  );
}

function HeroExperience({
  health,
  riskLabel,
  actionTarget,
  actionAmount,
  actionDue,
  nextAction,
  expectedImpact,
  aiModeLabel,
  aiCoachLines,
  motivation,
}: {
  health: { headline: string; tone: string; description: string };
  riskLabel: string;
  actionTarget: string;
  actionAmount: number;
  actionDue: string;
  nextAction: string;
  expectedImpact: string;
  aiModeLabel: string;
  aiCoachLines: string[];
  motivation: { headline: string; detail: string; tone: "success" | "warning" | "danger" };
}) {
  return (
    <section className="ui-grid-bg overflow-hidden rounded-2xl border border-mint/25 bg-gradient-to-br from-surface via-surface to-mint/10 p-5 shadow-panel sm:p-7">
      <div className="grid gap-7 xl:grid-cols-[1.25fr_0.75fr] xl:items-stretch">
        <div className="flex min-h-[430px] flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3 py-1 text-xs font-semibold text-mint">
              <ShieldCheck size={14} aria-hidden="true" />
              Finansal sağlık durumu: {riskLabel}
            </div>
            <StatusPill tone="accent">{health.tone}</StatusPill>
          </div>

          <div className="mt-10 max-w-4xl">
            <p className="text-sm font-semibold text-steel">Günaydın. Bugünkü finansal briefing hazır.</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Bu ay finansal olarak {health.headline}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-steel">{health.description}</p>
            <div className="mt-5 inline-flex max-w-2xl items-start gap-3 rounded-xl border border-line bg-surface/85 px-4 py-3 text-sm leading-6 text-steel">
              <Award size={17} className="mt-0.5 shrink-0 text-mint" aria-hidden="true" />
              <span>
                <span className="font-semibold text-ink">{motivation.headline}</span> {motivation.detail}
              </span>
            </div>
          </div>

          <div className="mt-9 rounded-2xl border border-line bg-surface/90 p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Bugünkü en önemli karar</p>
            <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-lg font-semibold text-ink">Bugünkü odak: {actionTarget}</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                  {actionAmount > 0 ? formatTry(actionAmount) : "Planı tamamla"}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">{nextAction}</p>
              </div>
              <div className="rounded-xl border border-line bg-surface-muted p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-steel">
                  <CalendarClock size={15} aria-hidden="true" />
                  Son tarih
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">{actionDue}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-steel">
                <span className="font-semibold text-ink">Beklenen etki:</span> {expectedImpact}
              </p>
              <Link href="/coach" className="ui-primary-button shrink-0">
                Detaylı konuş
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <article className="flex min-h-full flex-col rounded-2xl border border-line bg-surface/85 p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-paper">
                <Bot size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Bugünkü koç notu</p>
                <p className="mt-1 text-sm font-semibold text-ink">{aiModeLabel}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {aiCoachLines.slice(0, 3).map((line, index) => (
              <p key={`${line}-${index}`} className="rounded-xl border border-line bg-surface-muted p-3 text-sm leading-6 text-steel">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-auto pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">Bir adım daha</p>
            <p className="mt-2 text-sm leading-6 text-ink">{nextAction}</p>
          </div>
        </article>
      </div>
    </section>
  );
}

function DailyBriefing({
  items,
  dateLabel,
}: {
  items: { title: string; body: string; tone: "accent" | "warning" | "success" }[];
  dateLabel: string;
}) {
  const toneClasses = {
    accent: "border-mint/25 bg-mint/10 text-mint",
    warning: "border-amber/25 bg-amber/10 text-amber",
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <section className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Bugünkü finansal briefing</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">{dateLabel}</h2>
        </div>
        <StatusPill tone="accent">Her gün kısa kontrol</StatusPill>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className={`rounded-xl border p-4 ${toneClasses[item.tone]}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-steel">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SafeBudgetSpotlight({
  remaining,
  daily,
  weekly,
  daysRemaining,
  reason,
}: {
  remaining: number;
  daily: number;
  weekly: number;
  daysRemaining: number;
  reason: string;
}) {
  return (
    <section className="rounded-2xl border border-mint/30 bg-gradient-to-br from-mint/15 via-surface to-surface p-6 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Güvenli bütçe</p>
          <h2 className="mt-3 text-5xl font-semibold tracking-tight text-ink">{formatTry(remaining)}</h2>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-mint/30 bg-surface text-mint">
          <WalletCards size={20} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 max-w-2xl text-base leading-7 text-steel">
        Bugün harcama kararını bu alan belirler. Kalan {daysRemaining} gün için temel yükümlülüklerden sonra hesaplandı.
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">Günlük limit</dt>
          <dd className="mt-2 text-2xl font-semibold text-ink">{formatTry(daily)}</dd>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">Haftalık limit</dt>
          <dd className="mt-2 text-2xl font-semibold text-ink">{formatTry(weekly)}</dd>
        </div>
      </dl>
      <div className="mt-5 rounded-xl border border-line bg-surface-muted p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">Neden bu rakam?</p>
        <p className="mt-2 text-sm leading-6 text-steel">{reason}</p>
      </div>
    </section>
  );
}

function RiskDecisionCard({ riskLabel, status, reason, action }: { riskLabel: string; status: string; reason: string; action: string }) {
  return (
    <section className="rounded-2xl border border-coral/25 bg-coral/10 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">Risk</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{riskLabel}</h2>
        </div>
        <StatusPill tone={status === "Aksiyon gerekli" ? "danger" : "success"}>{status}</StatusPill>
      </div>
      <div className="mt-5 space-y-4">
        <DecisionLine label="Neden risk oluştu?" value={reason} />
        <DecisionLine label="Ne yaparsan düşer?" value={action} />
      </div>
    </section>
  );
}

function NextActionCard({
  target,
  amount,
  due,
  reason,
  impact,
}: {
  target: string;
  amount: number;
  due: string;
  reason: string;
  impact: string;
}) {
  return (
    <section className="rounded-2xl border border-amber/25 bg-amber/10 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber">Bugün yap</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Ödeme hedefi: {target}</h2>
        </div>
        <Target size={22} className="text-amber" aria-hidden="true" />
      </div>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-ink">{amount > 0 ? formatTry(amount) : "Kayıtları tamamla"}</p>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-3">
          <dt className="text-xs text-steel">Son tarih</dt>
          <dd className="mt-1 text-sm font-semibold text-ink">{due}</dd>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3">
          <dt className="text-xs text-steel">Beklenen etki</dt>
          <dd className="mt-1 text-sm font-semibold text-ink">{impact}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-6 text-steel">{reason}</p>
      <Link href="/plan" className="ui-secondary-button mt-5">
        Planı gör
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}

function DecisionLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">{label}</p>
      <p className="mt-2 text-sm leading-6 text-ink">{value}</p>
    </div>
  );
}

function TrustLayer() {
  const items = [
    { icon: LockKeyhole, title: "Bu sürüm henüz public beta için hazır değildir." },
    { icon: Bot, title: "AI yalnızca minimize edilmiş finans özetlerini yorumlar." },
    { icon: ShieldCheck, title: "Hesaplamalar deterministiktir." },
  ];

  return (
    <section className="mt-5 grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="flex items-center gap-3 rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-steel">
          <item.icon size={16} className="shrink-0 text-mint" aria-hidden="true" />
          <span>{item.title}</span>
        </div>
      ))}
    </section>
  );
}

function TomorrowReason({
  safeBudget,
  actionDue,
  riskLabel,
  motivation,
}: {
  safeBudget: number;
  actionDue: string;
  riskLabel: string;
  motivation: { headline: string; detail: string; tone: "success" | "warning" | "danger" };
}) {
  return (
    <section className="mt-6 rounded-2xl border border-mint/25 bg-mint/10 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Yarın tekrar gelmen için neden</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Planın her gün biraz daha netleşir.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
            Yarın güvenli bütçeni, risk seviyeni ve {actionDue} tarihli ödeme hedefini tekrar kontrol et. Küçük takip büyük
            sürprizleri azaltır.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Sunrise size={17} className="text-mint" aria-hidden="true" />
            {motivation.headline}
          </p>
          <p className="mt-2 text-xs leading-5 text-steel">
            Bugünkü durum: {riskLabel}. Güvenli bütçe: {formatTry(safeBudget)}.
          </p>
        </div>
      </div>
    </section>
  );
}

function formatActionDue(dueDateIso?: string, dueDay?: number) {
  if (dueDateIso) {
    return new Date(dueDateIso).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  }

  if (dueDay) {
    return `Ayın ${dueDay}. günü`;
  }

  return "Bugün";
}

function buildActionImpact(extraPaymentKurus: number) {
  if (extraPaymentKurus > 0) {
    return "Borç kapanış hızını artırabilir.";
  }

  return "Nakit güvenliğini korumaya yardım eder.";
}

function formatBriefingDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function buildDailyBriefingItems({
  coachSummary,
  risk,
  action,
  motivation,
}: {
  coachSummary: string;
  risk: string;
  action: string;
  motivation: { headline: string; detail: string; tone: "success" | "warning" | "danger" };
}) {
  return [
    {
      title: "Bugün fark ettiğim şey",
      body: coachSummary,
      tone: "accent" as const,
    },
    {
      title: "Şu riske dikkat et",
      body: risk,
      tone: "warning" as const,
    },
    {
      title: motivation.headline,
      body: `${motivation.detail} Bugünkü küçük adım: ${action}`,
      tone: motivation.tone === "success" ? ("success" as const) : ("accent" as const),
    },
  ];
}

function getMotivationCopy({
  riskLevel,
  safeBudget,
  plannedDebtReduction,
  minimumPaymentsCovered,
}: {
  riskLevel: "low" | "medium" | "high";
  safeBudget: number;
  plannedDebtReduction: number;
  minimumPaymentsCovered: boolean;
}) {
  if (plannedDebtReduction > 0) {
    return {
      headline: "Harika gidiyorsun.",
      detail: `Bu plan uygulanırsa borç bakiyen ${formatTry(plannedDebtReduction)} azalabilir.`,
      tone: "success" as const,
    };
  }

  if (riskLevel === "low" && safeBudget > 0) {
    return {
      headline: "Kontrol sende.",
      detail: "Güvenli bütçen pozitif; bugün hedef planı bozmadan ilerlemek.",
      tone: "success" as const,
    };
  }

  if (minimumPaymentsCovered) {
    return {
      headline: "Bir adım daha kaldı.",
      detail: "Asgari ödemeler korunuyor; şimdi güvenli harcama limitini takip et.",
      tone: "warning" as const,
    };
  }

  return {
    headline: "Bugün sakin ilerle.",
    detail: "Önce temel ödemeleri güvenceye al; küçük netlik bile bu ay fark yaratır.",
    tone: "danger" as const,
  };
}

function getFinancialHealthCopy(riskLevel: "low" | "medium" | "high", safeBudget: number) {
  if (riskLevel === "low" && safeBudget > 0) {
    return {
      headline: "kontrol sende",
      tone: "Kontrol sende",
      description: "Temel ödemeler korunuyor. Bugünkü hedef, güvenli harcama limitini bozmadan planı sürdürmek.",
    };
  }

  if (riskLevel === "medium") {
    return {
      headline: "dikkatli ilerliyorsun",
      tone: "Dikkat gerekli",
      description: "Plan çalışıyor, ancak bir sonraki ödeme ve günlük limit bu ayın dengesini belirliyor.",
    };
  }

  return {
    headline: "öncelik net: nakdi korumak",
    tone: "Öncelik nakit güvenliği",
    description: "Bu ay önce asgari ödemeler ve temel yaşam bütçesi korunmalı. Ek kararlar ikinci sırada.",
  };
}

function PaymentPlanCard({ debt }: { debt: DebtPriority }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mint">Öncelik #{debt.priorityRank}</p>
          <h3 className="mt-2 text-base font-semibold text-ink">Ödeme önceliği: {debt.name}</h3>
          <p className="mt-1 text-xs text-steel">{debt.lender}</p>
        </div>
        <StatusPill
          tone={debt.dueDateStatus === "due_soon" || debt.dueDateStatus === "due_today" || debt.dueDateStatus === "overdue" ? "danger" : "accent"}
        >
          {formatTry(debt.recommendedPaymentKurus ?? debt.minimumPaymentKurus)}
        </StatusPill>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-steel">Asgari</dt>
          <dd className="mt-1 font-semibold text-ink">{formatTry(debt.minimumPaymentKurus)}</dd>
        </div>
        <div>
          <dt className="text-xs text-steel">Kalan bakiye</dt>
          <dd className="mt-1 font-semibold text-ink">{formatTry(debt.projectedEndingBalanceKurus ?? debt.balanceKurus)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-5 text-steel">
        Önerilen etki: faiz baskısı ve vade riskini azaltmak için bu borç ödeme sıralamasında öne alınır.
      </p>
    </article>
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
    <section className="mt-6 ui-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">İlk kurulum</p>
          <h2 className="mt-2 text-lg font-semibold">
            {isEmpty ? "Koçun seni tanıması için üç küçük adım yeterli" : "Kalan adımları birlikte tamamlayalım"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
            Acele yok. Gelir, gider ve borç bilgilerini ekledikçe bugünkü briefing daha net ve kişisel hale gelir.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <SetupStepCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
