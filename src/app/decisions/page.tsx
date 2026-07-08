import Link from "next/link";
import { AppShell } from "@/components/dashboard/AppShell";
import { DecisionSimulatorPanel } from "@/components/decision/DecisionSimulatorPanel";
import { getFinanceSnapshot } from "@/features/finance/data-service";
import { trCopy } from "@/lib/copy/tr";

export const dynamic = "force-dynamic";

export default async function DecisionsPage() {
  const snapshot = await getFinanceSnapshot();
  const activeDebts = snapshot.debts
    .filter((debt) => debt.status === "active" && debt.balanceKurus > 0)
    .map((debt) => ({ id: debt.id, name: debt.name }));
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

  return (
    <AppShell>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-steel">Decision Intelligence Engine</p>
        <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl">{trCopy.decisions.title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-steel">{trCopy.decisions.description}</p>
      </div>

      <section className="mt-6 rounded-lg border border-amber/25 bg-amber/10 p-4">
        <p className="text-sm leading-6 text-steel">{trCopy.decisions.caveat}</p>
      </section>

      {setupItems.some((item) => !item.completed) ? (
        <section className="mt-6 rounded-lg border border-line bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Daha güçlü simülasyon için eksik kayıtlar</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
            Karar simülatörü mevcut lokal SQLite kayıtlarınızı kullanır. Eksik alanlar varsa bazı senaryo türleri sınırlı
            çalışabilir.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {setupItems.map((item) => (
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
        </section>
      ) : null}

      <section className="mt-6">
        <DecisionSimulatorPanel
          activeDebts={activeDebts}
          hasProfile={snapshot.hasProfile && snapshot.profile.monthlySalaryKurus > 0}
          hasExpenses={snapshot.expenses.length > 0}
        />
      </section>
    </AppShell>
  );
}
