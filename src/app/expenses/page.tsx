import { AppShell } from "@/components/dashboard/AppShell";
import { ExpenseCrudPanel } from "@/components/forms/ExpenseCrudPanel";
import { PageNotice } from "@/components/forms/PageNotice";
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
      <PageNotice message={params?.notice ? noticeMessages[params.notice] : undefined} />
      <ExpenseCrudPanel expenses={expenseFormModels} />
    </AppShell>
  );
}
