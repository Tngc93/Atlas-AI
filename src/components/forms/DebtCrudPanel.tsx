"use client";

import { useActionState } from "react";
import { formatTry } from "@/features/finance/money";
import { debtStatusOptions, debtTypeOptions, getDebtStatusLabel, getDebtTypeLabel } from "@/features/finance/form-options";
import type { FormActionState } from "@/lib/actions/action-state";
import { initialFormActionState } from "@/lib/actions/action-state";
import { createDebtAction, deleteDebtAction, updateDebtAction } from "@/features/debts/actions";
import { ConfirmDeleteButton, FieldError, FormMessage, FormSection, MoneyInput, SubmitButton } from "./FormControls";

export type DebtFormModel = {
  id: string;
  type: string;
  name: string;
  lender: string;
  totalDebtKurus: number;
  balanceKurus: number;
  creditLimitKurus: number | null;
  interestRateMonthly: string;
  resolvedInterestRateMonthly: string;
  interestRateSource: string;
  interestRateResolvedAt: string | null;
  interestRateNote: string | null;
  minimumPaymentKurus: number;
  dueDay: number;
  statementDay: number | null;
  installmentCount: number | null;
  remainingInstallments: number | null;
  status: string;
};

export function DebtCrudPanel({ debts }: { debts: DebtFormModel[] }) {
  const [createState, createAction] = useActionState<FormActionState, FormData>(
    createDebtAction,
    initialFormActionState,
  );

  return (
    <FormSection
      title="Borç yönetimi"
      description="Kredi kartı, ihtiyaç kredisi, ek hesap ve diğer borçları yerel SQLite veritabanında yönetin."
    >
      <form action={createAction} className="grid gap-4 xl:grid-cols-4">
        <DebtFields state={createState} />
        <div className="flex flex-wrap items-center gap-3 xl:col-span-4">
          <SubmitButton>Borç ekle</SubmitButton>
          <FormMessage state={createState} />
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {debts.length === 0 ? (
          <p className="rounded-md border border-dashed border-ink/15 bg-ink/[0.02] p-4 text-sm text-ink/60">
            Henüz borç kaydı yok. İlk borcunuzu eklediğinizde panel ve aylık plan SQLite verisiyle güncellenecek.
          </p>
        ) : (
          debts.map((debt) => <DebtRow key={debt.id} debt={debt} />)
        )}
      </div>
    </FormSection>
  );
}

function DebtRow({ debt }: { debt: DebtFormModel }) {
  const [updateState, updateAction] = useActionState<FormActionState, FormData>(
    updateDebtAction,
    initialFormActionState,
  );
  const [deleteState, deleteAction] = useActionState<FormActionState, FormData>(
    deleteDebtAction,
    initialFormActionState,
  );

  return (
    <details className="rounded-md border border-ink/10 bg-white p-4">
      <summary className="cursor-pointer text-sm font-semibold">
        {debt.name} · {getDebtTypeLabel(debt.type)} · {getDebtStatusLabel(debt.status)} · {formatTry(debt.balanceKurus)}
      </summary>
      <form action={updateAction} className="mt-4 grid gap-4 xl:grid-cols-4">
        <input type="hidden" name="id" value={debt.id} />
        <DebtFields state={updateState} debt={debt} />
        <div className="flex flex-wrap items-center gap-3 xl:col-span-4">
          <SubmitButton>Borcu güncelle</SubmitButton>
          <FormMessage state={updateState} />
        </div>
      </form>
      <form action={deleteAction} className="mt-3 flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={debt.id} />
        <ConfirmDeleteButton itemLabel="borç kaydı" />
        <FormMessage state={deleteState} />
      </form>
    </details>
  );
}

function DebtFields({ state, debt }: { state: FormActionState; debt?: DebtFormModel }) {
  return (
    <>
      <label className="block">
        <span className="text-sm font-medium text-ink/70">Borç türü</span>
        <select
          name="type"
          defaultValue={debt?.type ?? "credit_card"}
          className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
        >
          {debtTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError state={state} name="type" />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink/70">Banka veya alacaklı</span>
        <input
          name="lender"
          type="text"
          defaultValue={debt?.lender ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
        />
        <FieldError state={state} name="lender" />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink/70">Borç adı</span>
        <input
          name="name"
          type="text"
          defaultValue={debt?.name ?? ""}
          className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
        />
        <FieldError state={state} name="name" />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink/70">Durum</span>
        <select
          name="status"
          defaultValue={debt?.status ?? "active"}
          className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
        >
          {debtStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError state={state} name="status" />
      </label>

      <MoneyInput state={state} name="totalDebtKurus" label="Toplam borç" value={debt?.totalDebtKurus} required />
      <MoneyInput state={state} name="balanceKurus" label="Kalan borç" value={debt?.balanceKurus} required />
      <MoneyInput state={state} name="minimumPaymentKurus" label="Minimum ödeme" value={debt?.minimumPaymentKurus} required />
      <MoneyInput
        state={state}
        name="creditLimitKurus"
        label="Kredi limiti"
        value={debt?.creditLimitKurus}
        helper="Varsa kredi kartı limitini TL olarak girin."
      />

      <label className="block">
        <span className="text-sm font-medium text-ink/70">Manuel aylık faiz (%)</span>
        <input
          name="interestRateMonthly"
          type="number"
          min="0"
          max="25"
          step="0.01"
          defaultValue={debt?.interestRateMonthly ?? "0"}
          className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
        />
        <p className="mt-1 text-xs text-ink/45">
          Boş bırakırsanız kredi kartında sağlayıcı/cache/fallback oranı, diğer borçlarda 0% ve uyarı kullanılır.
        </p>
        {debt ? (
          <p className="mt-1 text-xs font-medium text-steel">
            Kullanılan faiz: %{Number(debt.resolvedInterestRateMonthly || 0).toLocaleString("tr-TR")} ·{" "}
            {interestSourceLabel(debt.interestRateSource)}
          </p>
        ) : null}
        <FieldError state={state} name="interestRateMonthly" />
      </label>

      <NumberInput state={state} name="dueDay" label="Son ödeme günü" min={1} max={31} value={debt?.dueDay} />
      <NumberInput state={state} name="statementDay" label="Hesap kesim günü" min={1} max={31} value={debt?.statementDay} />
      <NumberInput state={state} name="installmentCount" label="Taksit sayısı" min={1} value={debt?.installmentCount} />
      <NumberInput state={state} name="remainingInstallments" label="Kalan taksit" min={0} value={debt?.remainingInstallments} />
    </>
  );
}

function interestSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    manual: "Manuel",
    tcmb_contractual: "TCMB akdi",
    tcmb_overdue: "TCMB gecikme",
    cached_contractual: "Önbellek akdi",
    cached_overdue: "Önbellek gecikme",
    fallback_contractual: "Fallback/örnek",
    fallback_overdue: "Fallback gecikme",
    missing: "Faiz eksik",
  };

  return labels[source] ?? "Bilinmiyor";
}

function NumberInput({
  state,
  name,
  label,
  value,
  min,
  max,
}: {
  state: FormActionState;
  name: string;
  label: string;
  value?: number | null;
  min: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/70">{label}</span>
      <input
        name={name}
        type="number"
        min={min}
        max={max}
        defaultValue={value ?? ""}
        className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
      />
      <FieldError state={state} name={name} />
    </label>
  );
}
