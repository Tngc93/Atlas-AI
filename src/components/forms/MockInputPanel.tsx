"use client";

import { useMemo, useState } from "react";
import { liraToKurus, formatTry } from "@/features/finance/money";
import type { DebtAccount, MandatoryExpense, Profile } from "@/features/finance/types";
import { trCopy } from "@/lib/copy/tr";

export function IncomeInputPanel({ profile }: { profile: Profile }) {
  const [salary, setSalary] = useState(profile.monthlySalaryKurus / 100);
  const [threshold, setThreshold] = useState(profile.survivalThresholdKurus / 100);

  return (
    <MockPanel title={trCopy.forms.incomeTitle} description={trCopy.forms.incomeDescription}>
      <NumberField label={trCopy.forms.monthlySalary} value={salary} onChange={setSalary} />
      <NumberField label={trCopy.forms.survivalThreshold} value={threshold} onChange={setThreshold} />
      <p className="rounded-md bg-mint/10 p-3 text-sm text-steel">
        {trCopy.forms.preview
          .replace("{salary}", formatTry(liraToKurus(salary)))
          .replace("{threshold}", formatTry(liraToKurus(threshold)))}
      </p>
    </MockPanel>
  );
}

export function DebtsInputPanel({ debts }: { debts: DebtAccount[] }) {
  const total = useMemo(() => debts.reduce((sum, debt) => sum + debt.balanceKurus, 0), [debts]);

  return (
    <MockPanel title={trCopy.forms.debtsTitle} description={trCopy.forms.debtsDescription}>
      <div className="space-y-3">
        {debts.map((debt) => (
          <div key={debt.id} className="rounded-md border border-line bg-surface p-4">
            <p className="font-medium">{debt.name}</p>
            <p className="mt-1 text-sm text-steel">
              {debt.lender} · {trCopy.forms.balance} {formatTry(debt.balanceKurus)} · {trCopy.forms.min}{" "}
              {formatTry(debt.minimumPaymentKurus)} · {trCopy.forms.dueDay} {debt.dueDay}
            </p>
          </div>
        ))}
      </div>
      <p className="rounded-md bg-steel/10 p-3 text-sm text-steel">
        {trCopy.forms.totalSampleDebt}: {formatTry(total)}
      </p>
    </MockPanel>
  );
}

export function ExpensesInputPanel({ expenses }: { expenses: MandatoryExpense[] }) {
  const total = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amountKurus, 0), [expenses]);

  return (
    <MockPanel title={trCopy.forms.expensesTitle} description={trCopy.forms.expensesDescription}>
      <div className="grid gap-3 sm:grid-cols-2">
        {expenses.map((expense) => (
          <div key={expense.id} className="rounded-md border border-line bg-surface p-4">
            <p className="font-medium">{expense.name}</p>
            <p className="mt-1 text-sm text-steel">
              {expense.category} · {formatTry(expense.amountKurus)}
            </p>
          </div>
        ))}
      </div>
      <p className="rounded-md bg-coral/10 p-3 text-sm text-steel">
        {trCopy.forms.totalSampleExpenses}: {formatTry(total)}
      </p>
    </MockPanel>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-steel">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function MockPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-surface/75 p-5 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">{description}</p>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}
