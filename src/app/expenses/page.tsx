import { AppShell } from "@/components/dashboard/AppShell";
import { ExpenseCrudPanel } from "@/components/forms/ExpenseCrudPanel";
import { PageNotice } from "@/components/forms/PageNotice";
import { PageHeader } from "@/components/ui/Primitives";
import { listExpenses } from "@/features/expenses/repository";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  expenseDeleted: "Gider kaydı silindi.",
};

export default async function ExpensesPage({ searchParams }: { searchParams?: Promise<{ notice?: string }> }) {
  const params = await searchParams;
  const expenses = await listExpenses();
  const expenseFormModels = expenses.map((expense) => ({
    id: expense.id,
    name: expense.name,
    category: expense.category,
    amountKurus: expense.amountKurus,
    dueDay: expense.dueDay,
    isFixed: expense.isFixed,
    notes: expense.notes,
  }));

  return (
    <AppShell>
      <PageHeader kicker="Kayıtlar" title="Zorunlu giderler" description="Yaşam bütçesini korumak için düzenli ve zorunlu gider kayıtlarınızı yönetin." />
      <PageNotice message={params?.notice ? noticeMessages[params.notice] : undefined} />
      <div className="mt-7"><ExpenseCrudPanel expenses={expenseFormModels} /></div>
    </AppShell>
  );
}
