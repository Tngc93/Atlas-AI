"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, DatabaseZap, RotateCcw, Sparkles } from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { buildCoachContext } from "@/features/coach/context-builder";
import { simulateDecisionScenario } from "@/features/decision/service";
import type { DecisionScenarioInput, DecisionScenarioType } from "@/features/decision/types";
import {
  buildDemoActionItems,
  buildDemoDecisionBrief,
  buildDemoReminderCopy,
  formatDemoMonthFromIso,
  formatDemoPeriodMonth,
  formatDemoTry,
} from "@/features/demo/presentation";
import { useDemoFinance } from "@/features/demo/store";
import { liraToKurus } from "@/features/finance/money";
import type { DebtAccount, MandatoryExpense, UiRiskLevel } from "@/features/finance/types";
import { simulateForecastScenario } from "@/features/forecast/scenario-engine";
import { buildForecastReport } from "@/features/forecast/service";
import type { ForecastHorizon } from "@/features/forecast/types";
import { buildCurrentMemorySnapshotInput } from "@/features/memory/service";
import { sampleInterestRateSnapshot } from "@/features/rates/tcmb-provider";

const supportedRoutes = new Set(["dashboard", "income", "debts", "expenses", "plan", "forecast", "decisions", "memory", "reminders", "coach"]);

function riskLabel(level: UiRiskLevel | "critical" | string) {
  return ({ low: "Low", medium: "Medium", high: "High", critical: "High" } as Record<string, string>)[level] ?? "High";
}

function resolveDemoRoute(pathname: string) {
  if (pathname === "/demo" || pathname === "/demo/" || pathname === "/dashboard") return "dashboard";
  const route = pathname.startsWith("/demo/") ? pathname.slice("/demo/".length) : pathname.replace(/^\//, "");
  return route.split("/")[0] || "dashboard";
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Public Demo · Fictional Data</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1><p className="mt-3 max-w-3xl text-[15px] font-medium leading-7 text-steel sm:text-base">{description}</p></div>;
}

function Card({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return <section className={`ui-card ${className}`}><h2 className="text-lg font-semibold text-ink sm:text-xl">{title}</h2><div className="mt-4">{children}</div></section>;
}

function Notice({ children }: { children: ReactNode }) {
  return <p role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-mint/25 bg-mint/10 px-3.5 py-3 text-sm font-semibold text-ink"><CheckCircle2 aria-hidden size={17} className="shrink-0 text-mint" />{children}</p>;
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-line bg-surface-muted/60 p-6 text-center"><DatabaseZap aria-hidden className="mx-auto text-mint" /><h3 className="mt-3 font-semibold text-ink">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-steel">{description}</p>{action ? <div className="mt-4">{action}</div> : null}</div>;
}

function DashboardDemo() {
  const { planSnapshot, reminderInbox } = useDemoFinance();
  const plan = planSnapshot.monthlyPlan;
  const brief = buildDemoDecisionBrief(plan);
  return <><PageHeader title="Dashboard" description="A complete financial overview calculated from the immutable fictional seed and any temporary changes in this tab." /><div className="grid gap-4 md:grid-cols-3"><Card title="Safe budget"><strong className="text-3xl">{formatDemoTry(plan.livingBudget.remainingForMonthKurus)}</strong><p className="mt-2 text-sm text-steel">Illustrative amount for this demo session.</p></Card><Card title="Risk level"><strong className="text-3xl">{riskLabel(plan.riskLevel)}</strong><p className="mt-2 text-sm text-steel">Calculated by the deterministic engine.</p></Card><Card title="In-app reminders"><strong className="text-3xl">{reminderInbox.items.length}</strong><p className="mt-2 text-sm text-steel">No email, SMS or push notification.</p></Card></div><div className="mt-6"><Card title="Current decision summary"><dl className="grid gap-5 text-sm md:grid-cols-2"><div><dt className="font-semibold">What stays protected</dt><dd className="mt-1 leading-6 text-steel">{brief.protectedThing}</dd></div><div><dt className="font-semibold">Primary risk</dt><dd className="mt-1 leading-6 text-steel">{brief.primaryRisk}</dd></div><div><dt className="font-semibold">Next safe step</dt><dd className="mt-1 leading-6 text-steel">{brief.nextSafeStep}</dd></div><div><dt className="font-semibold">Why</dt><dd className="mt-1 leading-6 text-steel">{brief.why}</dd></div></dl></Card></div></>;
}

function IncomeDemo() {
  const { state, dispatch } = useDemoFinance();
  const [salary, setSalary] = useState(String(Math.round(state.profile.monthlySalaryKurus / 100)));
  const [notice, setNotice] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({ type: "set_salary", amountKurus: liraToKurus(Number(salary)) });
    setNotice(true);
  }
  return <><PageHeader title="Income" description="Change the fictional monthly income and review its effect. Current data remains unchanged outside this temporary demo session." /><Card title="Monthly income"><form onSubmit={submit} className="max-w-lg space-y-3"><label htmlFor="demo-salary" className="block text-sm font-semibold">Fictional monthly salary (TRY)</label><input id="demo-salary" type="number" min="0" required value={salary} onChange={(event) => setSalary(event.target.value)} className="ui-input w-full" /><p className="text-sm text-steel">No bank or payroll account is connected.</p><button type="submit" className="ui-button-primary">Apply temporary change</button></form>{notice ? <Notice>Temporary demo changes applied.</Notice> : null}</Card><div className="mt-6"><Card title="Temporary salary history"><div className="space-y-3">{state.salaryRecords.slice(0, 4).map((record) => <article key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-3"><span className="font-semibold">{formatDemoTry(record.amountKurus)}</span><span className="text-sm text-steel">{new Date(record.effectiveDateIso).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span></article>)}</div></Card></div></>;
}

function DebtsDemo() {
  const { state, dispatch } = useDemoFinance();
  const [notice, setNotice] = useState("");
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const debt: DebtAccount = { id: crypto.randomUUID(), type: "credit_card", name: String(data.get("name")), lender: "Fictional Demo", balanceKurus: liraToKurus(Number(data.get("balance"))), interestRateMonthly: 3.5, minimumPaymentKurus: liraToKurus(Number(data.get("minimum"))), dueDay: 15, status: "active" };
    dispatch({ type: "add_debt", debt });
    setNotice("Temporary debt added for this demo session.");
    event.currentTarget.reset();
  }
  return <><PageHeader title="Debts" description="Add, update or remove fictional debt records. These records never reach a database or another browser tab." /><div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><Card title="Add fictional debt"><form onSubmit={add} className="space-y-4"><label className="block text-sm font-semibold" htmlFor="demo-debt-name">Debt label</label><input id="demo-debt-name" required name="name" placeholder="Example credit card" className="ui-input w-full" /><label className="block text-sm font-semibold" htmlFor="demo-debt-balance">Balance (TRY)</label><input id="demo-debt-balance" required name="balance" type="number" min="1" className="ui-input w-full" /><label className="block text-sm font-semibold" htmlFor="demo-debt-minimum">Minimum payment (TRY)</label><input id="demo-debt-minimum" required name="minimum" type="number" min="0" className="ui-input w-full" /><button type="submit" className="ui-button-primary">Add temporary debt</button></form>{notice ? <Notice>{notice}</Notice> : null}</Card><Card title="Fictional debts">{state.debts.length === 0 ? <EmptyState title="No temporary debts" description="Add a fictional debt to see how the deterministic plan responds. It will disappear on refresh." /> : <div className="space-y-3">{state.debts.map((debt) => <article key={debt.id} className="rounded-xl border border-line p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">{debt.name}</h3><p className="mt-1 text-sm text-steel">{formatDemoTry(debt.balanceKurus)} · Fictional record</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { dispatch({ type: "update_debt", debt: { ...debt, balanceKurus: Math.round(debt.balanceKurus * .9) } }); setNotice("Debt balance updated for this demo session."); }} className="ui-button-secondary">Reduce by 10%</button><button type="button" onClick={() => { dispatch({ type: "delete_debt", id: debt.id }); setNotice("Temporary debt removed."); }} className="ui-button-danger">Delete</button></div></div></article>)}</div>}</Card></div></>;
}

function ExpensesDemo() {
  const { state, dispatch } = useDemoFinance();
  const [notice, setNotice] = useState("");
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const expense: MandatoryExpense = { id: crypto.randomUUID(), name: String(data.get("name")), category: String(data.get("category")), amountKurus: liraToKurus(Number(data.get("amount"))), isFixed: false };
    dispatch({ type: "add_expense", expense });
    setNotice("Temporary expense added for this demo session.");
    event.currentTarget.reset();
  }
  return <><PageHeader title="Expenses" description="Experiment with fictional mandatory expenses. No value is saved or synchronized outside this tab." /><div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><Card title="Add fictional expense"><form onSubmit={add} className="space-y-4"><label htmlFor="demo-expense-name" className="block text-sm font-semibold">Expense label</label><input id="demo-expense-name" required name="name" placeholder="Example household expense" className="ui-input w-full" /><label htmlFor="demo-expense-category" className="block text-sm font-semibold">Category</label><input id="demo-expense-category" required name="category" placeholder="Housing" className="ui-input w-full" /><label htmlFor="demo-expense-amount" className="block text-sm font-semibold">Amount (TRY)</label><input id="demo-expense-amount" required name="amount" type="number" min="1" className="ui-input w-full" /><button type="submit" className="ui-button-primary">Add temporary expense</button></form>{notice ? <Notice>{notice}</Notice> : null}</Card><Card title="Fictional expenses">{state.expenses.length === 0 ? <EmptyState title="No temporary expenses" description="Add a fictional expense to explore the safe-budget impact. The change remains temporary." /> : <div className="space-y-3">{state.expenses.map((expense) => <article key={expense.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4"><div><h3 className="font-semibold">{expense.name}</h3><p className="mt-1 text-sm text-steel">{expense.category} · {formatDemoTry(expense.amountKurus)}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { dispatch({ type: "update_expense", expense: { ...expense, amountKurus: Math.round(expense.amountKurus * .9) } }); setNotice("Expense updated for this demo session."); }} className="ui-button-secondary">Reduce by 10%</button><button type="button" onClick={() => { dispatch({ type: "delete_expense", id: expense.id }); setNotice("Temporary expense removed."); }} className="ui-button-danger">Delete</button></div></article>)}</div>}</Card></div></>;
}

function PlanDemo() {
  const { planSnapshot } = useDemoFinance();
  const plan = planSnapshot.monthlyPlan;
  const actions = buildDemoActionItems(plan);
  return <><PageHeader title="Monthly Plan" description="The deterministic finance engine calculates this illustrative plan from the current temporary demo state." /><div className="grid gap-4 md:grid-cols-2"><Card title="Cash flow"><p className="leading-7"><strong>{formatDemoTry(plan.cashFlow.salaryKurus)}</strong> fictional income is evaluated against <strong>{formatDemoTry(plan.cashFlow.totalRequiredKurus)}</strong> of mandatory commitments.</p></Card><Card title="Action sequence"><ol className="space-y-3">{actions.slice(0, 4).map((item, index) => <li key={item.id} className="flex gap-3 text-sm"><span className="font-bold text-mint">0{index + 1}</span><span><strong>{item.title}</strong><span className="mt-1 block leading-6 text-steel">{item.description}</span></span></li>)}</ol></Card></div><p className="mt-5 text-sm font-medium text-steel">Illustrative result · Based on current assumptions · Not financial advice</p></>;
}

function ForecastDemo() {
  const { snapshot } = useDemoFinance();
  const [horizon, setHorizon] = useState<ForecastHorizon>(24);
  const [compare, setCompare] = useState(false);
  const report = useMemo(() => buildForecastReport(snapshot), [snapshot]);
  const scenario = useMemo(() => simulateForecastScenario(snapshot, { type: "expense_decrease", percent: 10 }), [snapshot]);
  const checkpoint = report.checkpoints.find((item) => item.horizonMonths === horizon) ?? report.checkpoints.at(-1);
  return <><PageHeader title="Forecast" description="Review deterministic projections based on visible assumptions. Forecasts are estimates, not guarantees, and current data remains unchanged." /><Card title="Projection horizon"><div className="flex flex-wrap gap-2" role="group" aria-label="Forecast horizon">{report.horizons.map((item) => <button type="button" key={item} aria-pressed={horizon === item} onClick={() => setHorizon(item)} className={horizon === item ? "ui-button-primary" : "ui-button-secondary"}>{item} months</button>)}</div><div className="mt-6 grid gap-4 sm:grid-cols-3"><div><span className="text-sm text-steel">Projected remaining debt</span><strong className="mt-1 block text-2xl">{formatDemoTry(checkpoint?.remainingDebtKurus ?? 0)}</strong></div><div><span className="text-sm text-steel">Estimated period interest</span><strong className="mt-1 block text-2xl">{formatDemoTry(checkpoint?.periodInterestKurus ?? 0)}</strong></div><div><span className="text-sm text-steel">Projected highest risk</span><strong className="mt-1 block text-2xl">{riskLabel(checkpoint?.highestRiskLevel ?? "high")}</strong></div></div></Card><div className="mt-6"><Card title="Temporary comparison"><button type="button" className="ui-button-secondary" aria-pressed={compare} onClick={() => setCompare((value) => !value)}>{compare ? "Hide comparison" : "Compare a 10% expense decrease"}</button>{compare ? <div className="mt-5 rounded-xl border border-mint/25 bg-mint/10 p-4"><p className="font-semibold">Hypothetical scenario result</p><p className="mt-2 text-sm leading-6 text-steel">Projected 24-month remaining debt change: {formatDemoTry(scenario.delta.finalRemainingDebtDeltaKurus)}. Average safe-budget change: {formatDemoTry(scenario.delta.averageLivingBudgetDeltaKurus)}.</p><p className="mt-2 text-xs font-semibold text-mint">Current data remains unchanged.</p></div> : <EmptyState title="No temporary comparison selected" description="Run the fictional comparison to inspect a reversible result. Nothing will be saved." />}</Card></div></>;
}

const decisionOptions: Array<{ value: DecisionScenarioType; label: string }> = [
  { value: "extra_debt_payment", label: "Extra debt payment" },
  { value: "salary_increase", label: "Salary increase" },
  { value: "reduce_expenses_percent", label: "Mandatory expense decrease" },
];

function DecisionsDemo() {
  const { snapshot } = useDemoFinance();
  const [type, setType] = useState<DecisionScenarioType>("extra_debt_payment");
  const [value, setValue] = useState("1000");
  const [submitted, setSubmitted] = useState<DecisionScenarioInput>({ type: "extra_debt_payment", amountKurus: liraToKurus(1000) });
  const result = useMemo(() => simulateDecisionScenario(snapshot, submitted), [snapshot, submitted]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(type === "reduce_expenses_percent" ? { type, percent: Number(value) } : { type, amountKurus: liraToKurus(Number(value)) });
  }
  return <><PageHeader title="Decision Simulator" description="Compare a hypothetical scenario without changing the current temporary records. The final decision always remains with the visitor." /><Card title="Build a reversible scenario"><form onSubmit={submit} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"><div><label htmlFor="demo-scenario" className="block text-sm font-semibold">Scenario type</label><select id="demo-scenario" value={type} onChange={(event) => setType(event.target.value as DecisionScenarioType)} className="ui-input mt-2 w-full">{decisionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div><div><label htmlFor="demo-scenario-value" className="block text-sm font-semibold">{type === "reduce_expenses_percent" ? "Change (%)" : "Amount (TRY)"}</label><input id="demo-scenario-value" type="number" required min="1" value={value} onChange={(event) => setValue(event.target.value)} className="ui-input mt-2 w-full" /></div><button type="submit" className="ui-button-primary">Run scenario</button></form></Card><div className="mt-6 grid gap-4 md:grid-cols-3"><Card title="Safe-budget change"><strong className="text-2xl">{formatDemoTry(result.delta.livingBudgetDeltaKurus)}</strong></Card><Card title="Debt change"><strong className="text-2xl">{formatDemoTry(result.delta.firstMonthRemainingDebtDeltaKurus)}</strong></Card><Card title="Risk change"><strong className="text-2xl">{riskLabel(result.delta.baselineRiskLevel)} → {riskLabel(result.delta.scenarioRiskLevel)}</strong></Card></div><p className="mt-5 rounded-xl border border-line bg-surface-muted p-4 text-sm leading-6 text-steel"><strong className="text-ink">Hypothetical scenario:</strong> No permanent data was changed. This illustrative comparison is not financial advice.</p></>;
}

function MemoryDemo() {
  const { state, snapshot, planSnapshot, memoryReport, dispatch } = useDemoFinance();
  const [notice, setNotice] = useState(false);
  function refresh() {
    const input = buildCurrentMemorySnapshotInput(snapshot, "manual_refresh");
    const now = new Date();
    dispatch({ type: "refresh_memory", snapshot: { ...input, id: `demo-memory-${input.periodMonth}`, createdAt: now, updatedAt: now } });
    setNotice(true);
  }
  return <><PageHeader title="Financial Memory" description="Structured fictional snapshots show change over time. This is deterministic financial context, not hidden AI memory." /><Card title="Snapshot timeline">{memoryReport.snapshotCount === 0 ? <EmptyState title="No temporary snapshots" description="Refresh Financial Memory to create a fictional snapshot for this tab only." /> : <div className="grid gap-3 sm:grid-cols-3">{state.memorySnapshots.slice(-3).map((item) => <article key={item.id} className="rounded-xl border border-line p-4"><span className="text-xs font-bold text-mint">{formatDemoPeriodMonth(item.periodMonth)}</span><strong className="mt-3 block">{formatDemoTry(item.survivalBudgetKurus)}</strong><p className="mt-1 text-sm text-steel">Risk: {riskLabel(item.riskLevel)}</p></article>)}</div>}<button type="button" onClick={refresh} className="ui-button-primary mt-5">Refresh temporary snapshot</button>{notice ? <Notice>Financial Memory refreshed for this demo session. Reloading restores the original timeline.</Notice> : null}<p className="mt-3 text-xs text-steel">Session revision {state.revision} · Current risk {riskLabel(planSnapshot.monthlyPlan.riskLevel)}</p></Card></>;
}

function RemindersDemo() {
  const { reminderInbox, dispatch } = useDemoFinance();
  return <><PageHeader title="Reminders" description="Deterministic in-app reminders derived from fictional dates and plan signals. No external notification is sent." /><Card title="Items requiring attention">{reminderInbox.items.length === 0 ? <EmptyState title="No reminder requires attention" description="Dismissed reminder state is temporary. Reset or reload the demo to restore the fictional reminder seed." action={<Link href="/demo" className="ui-button-secondary">Return to Dashboard</Link>} /> : <div className="space-y-3">{reminderInbox.items.map((item) => { const copy = buildDemoReminderCopy(item); return <article key={item.key} className="rounded-xl border border-line p-4"><h3 className="font-semibold">{copy.title}</h3><p className="mt-1 text-sm leading-6 text-steel">{copy.reason}</p><button type="button" onClick={() => { const now = new Date(); dispatch({ type: "set_reminder_state", state: { id: crypto.randomUUID(), reminderKey: item.key, status: "dismissed", dismissedAt: now, createdAt: now, updatedAt: now } }); }} className="ui-button-secondary mt-3">Dismiss for this session</button></article>; })}</div>}<p className="mt-4 text-xs font-semibold text-steel">In-app only · No email, SMS or push notification</p></Card></>;
}

function CoachDemo() {
  const { planSnapshot, memoryReport } = useDemoFinance();
  const [generated, setGenerated] = useState(false);
  const context = useMemo(() => buildCoachContext({ monthlyPlan: planSnapshot.monthlyPlan, memoryReport, rateSnapshot: sampleInterestRateSnapshot }), [planSnapshot, memoryReport]);
  const risk = context.summary.riskLevel === "critical" ? "high" : context.summary.riskLevel;
  return <><PageHeader title="AI Coach" description="The deterministic finance engine produces the result. Mock AI only explains the structured output without an external provider call." /><Card title="Mock AI explanation"><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg border border-mint/25 bg-mint/10 px-3 py-1.5 text-xs font-bold text-mint">Mock AI · Deterministic · Zero API cost</span><span className="text-xs font-semibold text-steel">No external provider connected</span></div>{generated ? <div className="mt-5 rounded-xl border border-line bg-surface-muted p-4"><p className="font-semibold">Demo explanation generated by Mock AI</p><p className="mt-3 leading-7">For {formatDemoMonthFromIso(planSnapshot.monthlyPlan.asOfDateIso)}, the deterministic finance engine classified the fictional risk level as {riskLabel(risk)}. Review the safe-budget boundary and minimum-payment coverage before comparing optional actions.</p><p className="mt-3 text-sm leading-6 text-steel">No OpenAI, Gemini, Anthropic or OpenRouter request occurred. No API cost was incurred. This is not financial advice.</p></div> : <EmptyState title="No Mock AI explanation generated yet" description="Generate a local illustrative explanation from the minimized deterministic result. No provider credential is required." action={<button type="button" onClick={() => setGenerated(true)} className="ui-button-primary"><Sparkles aria-hidden size={17} /> Generate Mock AI explanation</button>} />} {generated ? <button type="button" onClick={() => setGenerated(false)} className="ui-button-secondary mt-4"><RotateCcw aria-hidden size={16} /> Clear temporary explanation</button> : null}</Card></>;
}

function UnsupportedDemoRoute({ route }: { route: string }) {
  return <div className="mx-auto max-w-3xl py-12"><div className="ui-card text-center"><AlertCircle aria-hidden className="mx-auto text-mint" size={38} /><p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-mint">Unsupported public demo route</p><h1 className="mt-2 text-3xl font-bold">This feature is unavailable in the public demo.</h1><p className="mx-auto mt-4 max-w-xl leading-7 text-steel">The route “{route}” was not opened because it does not have a database-free demo implementation. No persistence operation was attempted.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/demo" className="ui-button-primary">Return to Demo <ArrowRight aria-hidden size={17} /></Link><Link href="/docs/demo-mode" className="ui-button-secondary">Demo documentation</Link></div></div></div>;
}

export default function DemoPage() {
  const pathname = usePathname();
  const { resetGeneration } = useDemoFinance();
  const route = resolveDemoRoute(pathname);
  if (!supportedRoutes.has(route)) return <UnsupportedDemoRoute route={route} />;
  const pages: Record<string, ReactNode> = {
    dashboard: <DashboardDemo key={`dashboard-${resetGeneration}`} />,
    income: <IncomeDemo key={`income-${resetGeneration}`} />,
    debts: <DebtsDemo key={`debts-${resetGeneration}`} />,
    expenses: <ExpensesDemo key={`expenses-${resetGeneration}`} />,
    plan: <PlanDemo key={`plan-${resetGeneration}`} />,
    forecast: <ForecastDemo key={`forecast-${resetGeneration}`} />,
    decisions: <DecisionsDemo key={`decisions-${resetGeneration}`} />,
    memory: <MemoryDemo key={`memory-${resetGeneration}`} />,
    reminders: <RemindersDemo key={`reminders-${resetGeneration}`} />,
    coach: <CoachDemo key={`coach-${resetGeneration}`} />,
  };
  return pages[route];
}
