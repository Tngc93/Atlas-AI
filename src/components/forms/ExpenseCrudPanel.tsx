"use client";

import { useActionState } from "react";
import { ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/ui/Primitives";
import { formatTry } from "@/features/finance/money";
import { expenseCategoryOptions, getExpenseCategoryLabel } from "@/features/finance/form-options";
import type { FormActionState } from "@/lib/actions/action-state";
import { initialFormActionState } from "@/lib/actions/action-state";
import { createExpenseAction, deleteExpenseAction, updateExpenseAction } from "@/features/expenses/actions";
import { ConfirmDeleteButton, DaySelect, FieldError, FormMessage, FormSection, MoneyInput, SubmitButton } from "./FormControls";

export type ExpenseFormModel = {
  id: string;
  name: string;
  category: string;
  amountKurus: number;
  dueDay: number | null;
  isFixed: boolean;
  notes: string | null;
};

export function ExpenseCrudPanel({ expenses }: { expenses: ExpenseFormModel[] }) {
  const [createState, createAction] = useActionState<FormActionState, FormData>(
    createExpenseAction,
    initialFormActionState,
  );

  return (
    <FormSection
      title="Zorunlu gider yönetimi"
      description="Kira, market, faturalar ve diğer zorunlu giderleri aylık planınız için yönetin."
    >
      <form action={createAction} className="grid gap-4 lg:grid-cols-3">
        <ExpenseFields state={createState} />
        <div className="flex flex-wrap items-center gap-3 lg:col-span-3">
          <SubmitButton>Gider ekle</SubmitButton>
          <FormMessage state={createState} />
        </div>
      </form>

      <div className="mt-6 grid gap-3">
        {expenses.length === 0 ? (
          <EmptyState icon={ReceiptText} kicker="Gider kaydı" title="Henüz zorunlu gider yok" description="İlk gideri yukarıdaki formdan eklediğinizde yaşam bütçesi ve aylık plan deterministik olarak güncellenir." />
        ) : (
          expenses.map((expense) => <ExpenseRow key={expense.id} expense={expense} />)
        )}
      </div>
    </FormSection>
  );
}

function ExpenseRow({ expense }: { expense: ExpenseFormModel }) {
  const [updateState, updateAction] = useActionState<FormActionState, FormData>(
    updateExpenseAction,
    initialFormActionState,
  );
  const [deleteState, deleteAction] = useActionState<FormActionState, FormData>(
    deleteExpenseAction,
    initialFormActionState,
  );

  return (
    <details className="rounded-md border border-line bg-surface p-4">
      <summary className="cursor-pointer text-sm font-semibold">
        {expense.name} · {getExpenseCategoryLabel(expense.category)} · {formatTry(expense.amountKurus)}
      </summary>
      <form action={updateAction} className="mt-4 grid gap-4 lg:grid-cols-3">
        <input type="hidden" name="id" value={expense.id} />
        <ExpenseFields state={updateState} expense={expense} />
        <div className="flex flex-wrap items-center gap-3 lg:col-span-3">
          <SubmitButton>Gideri güncelle</SubmitButton>
          <FormMessage state={updateState} />
        </div>
      </form>
      <form action={deleteAction} className="mt-3 flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={expense.id} />
        <ConfirmDeleteButton itemLabel="gider kaydı" />
        <FormMessage state={deleteState} />
      </form>
    </details>
  );
}

function ExpenseFields({ state, expense }: { state: FormActionState; expense?: ExpenseFormModel }) {
  return (
    <>
      <label className="block">
        <span className="text-sm font-medium text-steel">Gider adı</span>
        <input
          name="name"
          type="text"
          defaultValue={expense?.name ?? ""}
          className="ui-input mt-2 w-full"
        />
        <FieldError state={state} name="name" />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-steel">Kategori</span>
        <select
          name="category"
          defaultValue={expense?.category ?? "rent"}
          className="ui-input mt-2 w-full"
        >
          {expenseCategoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError state={state} name="category" />
      </label>

      <MoneyInput state={state} name="amountKurus" label="Tutar" value={expense?.amountKurus} required />

      <DaySelect state={state} name="dueDay" label="Son ödeme günü" value={expense?.dueDay} emptyLabel="Son ödeme günü yok" />

      <label className="flex items-center gap-3 rounded-md border border-line px-3 py-2 text-sm font-medium text-steel">
        <input name="isFixed" type="checkbox" defaultChecked={expense?.isFixed ?? true} className="h-4 w-4" />
        Sabit aylık gider
      </label>

      <label className="block">
        <span className="text-sm font-medium text-steel">Not</span>
        <input
          name="notes"
          type="text"
          defaultValue={expense?.notes ?? ""}
          className="ui-input mt-2 w-full"
        />
        <FieldError state={state} name="notes" />
      </label>
    </>
  );
}
