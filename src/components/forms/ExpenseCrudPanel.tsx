"use client";

import { useActionState } from "react";
import { formatTry } from "@/features/finance/money";
import { expenseCategoryOptions, getExpenseCategoryLabel } from "@/features/finance/form-options";
import type { FormActionState } from "@/lib/actions/action-state";
import { initialFormActionState } from "@/lib/actions/action-state";
import { createExpenseAction, deleteExpenseAction, updateExpenseAction } from "@/features/expenses/actions";
import { ConfirmDeleteButton, FieldError, FormMessage, FormSection, MoneyInput, SubmitButton } from "./FormControls";

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
      description="Kira, market, faturalar ve diğer zorunlu giderleri yerel SQLite veritabanında yönetin."
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
          <p className="rounded-md border border-dashed border-ink/15 bg-ink/[0.02] p-4 text-sm text-ink/60">
            Henüz zorunlu gider kaydı yok. Gider eklediğinizde hayatta kalma bütçesi ve aylık plan güncellenecek.
          </p>
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
    <details className="rounded-md border border-ink/10 bg-white p-4">
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
        <span className="text-sm font-medium text-ink/70">Gider adı</span>
        <input
          name="name"
          type="text"
          defaultValue={expense?.name ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
        />
        <FieldError state={state} name="name" />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink/70">Kategori</span>
        <select
          name="category"
          defaultValue={expense?.category ?? "rent"}
          className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
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

      <label className="block">
        <span className="text-sm font-medium text-ink/70">Son ödeme günü</span>
        <input
          name="dueDay"
          type="number"
          min="1"
          max="31"
          defaultValue={expense?.dueDay ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
        />
        <FieldError state={state} name="dueDay" />
      </label>

      <label className="flex items-center gap-3 rounded-md border border-ink/10 px-3 py-2 text-sm font-medium text-ink/70">
        <input name="isFixed" type="checkbox" defaultChecked={expense?.isFixed ?? true} className="h-4 w-4" />
        Sabit aylık gider
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink/70">Not</span>
        <input
          name="notes"
          type="text"
          defaultValue={expense?.notes ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
        />
        <FieldError state={state} name="notes" />
      </label>
    </>
  );
}
