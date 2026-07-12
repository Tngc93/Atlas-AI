"use client";

import { useMemo, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { buildCoachContext } from "@/features/coach/context-builder";
import { simulateDecisionScenario } from "@/features/decision/service";
import { useDemoFinance } from "@/features/demo/store";
import { buildDashboardDecisionBrief } from "@/features/finance/dashboard-brief";
import { formatTry, liraToKurus } from "@/features/finance/money";
import type { DebtAccount, MandatoryExpense, UiRiskLevel } from "@/features/finance/types";
import { buildCurrentMemorySnapshotInput } from "@/features/memory/service";
import { sampleInterestRateSnapshot } from "@/features/rates/tcmb-provider";
import { buildForecastReport } from "@/features/forecast/service";

function riskLabel(level: UiRiskLevel | "critical" | string) {
  const labels: Record<string, string> = { low: "Düşük", medium: "Orta", high: "Yüksek", critical: "Yüksek" };
  return labels[level] ?? "Yüksek";
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return <div className="mb-6"><h1 className="text-3xl font-semibold">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-steel">{description}</p></div>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-line bg-surface p-5 shadow-sm"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4">{children}</div></section>;
}

function DashboardDemo() {
  const { planSnapshot, reminderInbox } = useDemoFinance();
  const plan = planSnapshot.monthlyPlan;
  const brief = buildDashboardDecisionBrief(plan);
  return <><PageHeader title="Bugün" description="Kurgusal demo verilerinden hesaplanan güncel finans görünümü." /><div className="grid gap-4 md:grid-cols-3"><Card title="Yaşam bütçesi"><strong>{formatTry(plan.livingBudget.remainingForMonthKurus)}</strong></Card><Card title="Risk seviyesi"><strong>{riskLabel(plan.riskLevel)}</strong></Card><Card title="Hatırlatma"><strong>{reminderInbox.items.length} konu</strong></Card></div><div className="mt-6"><Card title="Bu ayın karar özeti"><dl className="space-y-3 text-sm"><div><dt className="font-semibold">Önce korunması gereken şey</dt><dd className="text-steel">{brief.protectedThing}</dd></div><div><dt className="font-semibold">En önemli risk</dt><dd className="text-steel">{brief.primaryRisk}</dd></div><div><dt className="font-semibold">Sıradaki güvenli adım</dt><dd className="text-steel">{brief.nextSafeStep}</dd></div><div><dt className="font-semibold">Neden?</dt><dd className="text-steel">{brief.why}</dd></div></dl></Card></div></>;
}

function IncomeDemo() {
  const { state, dispatch } = useDemoFinance();
  const [salary, setSalary] = useState(String(Math.round(state.profile.monthlySalaryKurus / 100)));
  return <><PageHeader title="Gelir" description="Demo maaşını değiştirerek plan etkisini bu sekmede inceleyin." /><Card title="Aylık maaş"><form onSubmit={(event) => { event.preventDefault(); dispatch({ type: "set_salary", amountKurus: liraToKurus(Number(salary)) }); }} className="flex flex-wrap gap-3"><input aria-label="Aylık maaş" type="number" min="0" value={salary} onChange={(event) => setSalary(event.target.value)} className="rounded-md border border-line bg-surface px-3 py-2" /><button className="rounded-md bg-mint px-4 py-2 font-semibold text-white">Geçici olarak güncelle</button></form><p role="status" className="mt-3 text-sm text-steel">Mevcut demo maaşı: {formatTry(state.profile.monthlySalaryKurus)}</p></Card></>;
}

function DebtsDemo() {
  const { state, dispatch } = useDemoFinance();
  function add(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const debt: DebtAccount = { id: crypto.randomUUID(), type: "credit_card", name: String(data.get("name")), lender: "Kurgusal Demo", balanceKurus: liraToKurus(Number(data.get("balance"))), interestRateMonthly: 3.5, minimumPaymentKurus: liraToKurus(Number(data.get("minimum"))), dueDay: 15, status: "active" }; dispatch({ type: "add_debt", debt }); event.currentTarget.reset(); }
  return <><PageHeader title="Borçlar" description="Kurgusal borç kayıtlarını ekleyin, güncelleyin veya silin." /><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><Card title="Borç ekle"><form onSubmit={add} className="space-y-3"><input required name="name" placeholder="Kurgusal borç adı" className="w-full rounded-md border border-line bg-surface px-3 py-2" /><input required name="balance" type="number" min="1" placeholder="Bakiye (TL)" className="w-full rounded-md border border-line bg-surface px-3 py-2" /><input required name="minimum" type="number" min="0" placeholder="Asgari ödeme (TL)" className="w-full rounded-md border border-line bg-surface px-3 py-2" /><button className="rounded-md bg-mint px-4 py-2 font-semibold text-white">Geçici borç ekle</button></form></Card><Card title="Demo borçları"><div className="space-y-3">{state.debts.map((debt) => <article key={debt.id} className="rounded-md border border-line p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">{debt.name}</h3><p className="text-sm text-steel">{formatTry(debt.balanceKurus)}</p></div><div className="flex gap-2"><button onClick={() => dispatch({ type: "update_debt", debt: { ...debt, balanceKurus: Math.round(debt.balanceKurus * 0.9) } })} className="rounded-md border border-line px-3 py-2 text-sm">Bakiyeyi %10 azalt</button><button onClick={() => dispatch({ type: "delete_debt", id: debt.id })} className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700">Sil</button></div></div></article>)}</div></Card></div></>;
}

function ExpensesDemo() {
  const { state, dispatch } = useDemoFinance();
  function add(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const expense: MandatoryExpense = { id: crypto.randomUUID(), name: String(data.get("name")), category: String(data.get("category")), amountKurus: liraToKurus(Number(data.get("amount"))), isFixed: false }; dispatch({ type: "add_expense", expense }); event.currentTarget.reset(); }
  return <><PageHeader title="Giderler" description="Demo giderleri yalnız bu sekmedeki hesaplamaları etkiler." /><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><Card title="Gider ekle"><form onSubmit={add} className="space-y-3"><input required name="name" placeholder="Kurgusal gider adı" className="w-full rounded-md border border-line px-3 py-2" /><input required name="category" placeholder="Kategori" className="w-full rounded-md border border-line px-3 py-2" /><input required name="amount" type="number" min="1" placeholder="Tutar (TL)" className="w-full rounded-md border border-line px-3 py-2" /><button className="rounded-md bg-mint px-4 py-2 font-semibold text-white">Geçici gider ekle</button></form></Card><Card title="Demo giderleri"><div className="space-y-3">{state.expenses.map((expense) => <article key={expense.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line p-3"><div><h3 className="font-semibold">{expense.name}</h3><p className="text-sm text-steel">{expense.category} · {formatTry(expense.amountKurus)}</p></div><div className="flex gap-2"><button onClick={() => dispatch({ type: "update_expense", expense: { ...expense, amountKurus: Math.round(expense.amountKurus * 0.9) } })} className="rounded-md border border-line px-3 py-2 text-sm">%10 azalt</button><button onClick={() => dispatch({ type: "delete_expense", id: expense.id })} className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700">Sil</button></div></article>)}</div></Card></div></>;
}

function PlanDemo() { const { planSnapshot } = useDemoFinance(); const plan = planSnapshot.monthlyPlan; return <><PageHeader title="Aylık Plan" description="Plan, demo state üzerinden deterministic finance engine tarafından hesaplanır." /><div className="grid gap-4 md:grid-cols-2"><Card title="Nakit akışı"><p>{formatTry(plan.cashFlow.salaryKurus)} gelirden {formatTry(plan.cashFlow.totalRequiredKurus)} zorunlu yük ayrılıyor.</p></Card><Card title="Aksiyon planı"><ol className="space-y-2">{plan.actionPlan.slice(0, 4).map((item) => <li key={item.id} className="text-sm"><strong>{item.title}</strong><p className="text-steel">{item.description}</p></li>)}</ol></Card></div></>; }

function ForecastDemo() { const { snapshot } = useDemoFinance(); const report = useMemo(() => buildForecastReport(snapshot), [snapshot]); return <><PageHeader title="Finansal Tahmin" description="Kurgusal kayıtların 24 aylık varsayıma bağlı görünümü; garanti değildir." /><div className="grid gap-4 md:grid-cols-3"><Card title="24 ay sonu borç"><strong>{formatTry(report.finalRemainingDebtKurus)}</strong></Card><Card title="Tahmini faiz"><strong>{formatTry(report.totalEstimatedInterestKurus)}</strong></Card><Card title="En yüksek risk"><strong>{riskLabel(report.highestRiskLevel)}</strong></Card></div><div className="mt-6"><Card title="Bu tahmin neye dayanıyor?"><ul className="space-y-2 text-sm text-steel">{report.assumptions.map((item) => <li key={item.id}><strong className="text-ink">{item.label}:</strong> {item.value}</li>)}</ul></Card></div></>; }

function DecisionsDemo() { const { snapshot } = useDemoFinance(); const result = useMemo(() => simulateDecisionScenario(snapshot, { type: "reduce_expenses_percent", percent: 10 }), [snapshot]); return <><PageHeader title="Karar Simülatörü" description="Geçici bir gider azaltma senaryosu seçenekleri karşılaştırır; karar vermez." /><div className="grid gap-4 md:grid-cols-2"><Card title="Karar çerçevesi"><p className="text-sm text-steel">{result.frame.currentReality}</p><p className="mt-2 text-sm">{result.frame.protectedConstraint}</p></Card><Card title="Trade-off özeti"><p className="text-sm text-steel">{result.tradeoffSummary.summary}</p><p className="mt-3 text-sm font-semibold">{result.tradeoffSummary.decisionNote}</p></Card></div></>; }

function MemoryDemo() { const { state, snapshot, planSnapshot, memoryReport, dispatch } = useDemoFinance(); function refresh() { const input = buildCurrentMemorySnapshotInput(snapshot, "manual_refresh"); const now = new Date(); dispatch({ type: "refresh_memory", snapshot: { ...input, id: `demo-memory-${input.periodMonth}`, createdAt: now, updatedAt: now } }); } return <><PageHeader title="Finansal Hafıza" description="Kurgusal snapshot’lar zaman içindeki değişimi gösterir ve yalnız bu sekmede tutulur." /><Card title="Hafıza özeti"><p>{memoryReport.snapshotCount} geçici snapshot · {memoryReport.hasEnoughHistory ? "Trend üretilebilir" : "Yeterli geçmiş yok"}</p><button onClick={refresh} className="mt-4 rounded-md bg-mint px-4 py-2 font-semibold text-white">Hafızayı geçici güncelle</button><p className="mt-2 text-xs text-steel">Son değişiklik revision: {state.revision}; güncel risk {riskLabel(planSnapshot.monthlyPlan.riskLevel)}.</p></Card></>; }

function RemindersDemo() { const { reminderInbox, dispatch } = useDemoFinance(); return <><PageHeader title="Hatırlatmalar" description="Kurgusal tarihler ve plan sinyallerinden uygulama içinde üretilir." /><Card title="Dikkat gerektirenler"><div className="space-y-3">{reminderInbox.items.map((item) => <article key={item.key} className="rounded-md border border-line p-3"><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm text-steel">{item.reason}</p><button onClick={() => { const now = new Date(); dispatch({ type: "set_reminder_state", state: { id: crypto.randomUUID(), reminderKey: item.key, status: "dismissed", dismissedAt: now, createdAt: now, updatedAt: now } }); }} className="mt-2 rounded-md border border-line px-3 py-1.5 text-sm">Bu demo oturumunda gizle</button></article>)}</div></Card></>; }

function CoachDemo() { const { planSnapshot, memoryReport } = useDemoFinance(); const context = useMemo(() => buildCoachContext({ monthlyPlan: planSnapshot.monthlyPlan, memoryReport, rateSnapshot: sampleInterestRateSnapshot }), [planSnapshot, memoryReport]); const risk = context.summary.riskLevel === "critical" ? "high" : context.summary.riskLevel; return <><PageHeader title="Finans Koçu" description="Demo AI yalnız minimize edilmiş deterministic bağlamı örnek metne dönüştürür." /><Card title="Demo AI"><span className="rounded-md bg-mint/10 px-2 py-1 text-xs font-semibold text-mint">Mock · 0 TL</span><p className="mt-4 leading-7">{context.summary.month} için risk seviyesi {riskLabel(risk)}. Önce hesaplama motorunun belirlediği yaşam bütçesi ve ödeme sınırlarını gözden geçirmek anlamlı olabilir.</p><p className="mt-3 text-sm text-steel">Gerçek provider çağrısı yapılmadı. Bu açıklama finansal tavsiye değildir.</p></Card></>; }

export default function DemoPage() {
  const pathname = usePathname();
  if (pathname === "/income") return <IncomeDemo />;
  if (pathname === "/debts") return <DebtsDemo />;
  if (pathname === "/expenses") return <ExpensesDemo />;
  if (pathname === "/plan") return <PlanDemo />;
  if (pathname === "/forecast") return <ForecastDemo />;
  if (pathname === "/decisions") return <DecisionsDemo />;
  if (pathname === "/memory") return <MemoryDemo />;
  if (pathname === "/reminders") return <RemindersDemo />;
  if (pathname === "/coach") return <CoachDemo />;
  return <DashboardDemo />;
}
