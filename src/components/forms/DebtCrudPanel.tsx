"use client";

import { useActionState, useMemo, useState } from "react";
import { formatTry } from "@/features/finance/money";
import { debtStatusOptions, debtTypeOptions, getDebtStatusLabel, getDebtTypeLabel } from "@/features/finance/form-options";
import type { FormActionState } from "@/lib/actions/action-state";
import { initialFormActionState } from "@/lib/actions/action-state";
import { createDebtAction, deleteDebtAction, updateDebtAction } from "@/features/debts/actions";
import { ConfirmDeleteButton, DaySelect, FieldError, FormMessage, FormSection, MoneyInput, SubmitButton } from "./FormControls";

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
      description="Kredi kartı, ihtiyaç kredisi, ek hesap ve diğer borçları aylık planınız için yönetin."
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
          <p className="rounded-md border border-dashed border-line bg-surface-muted p-4 text-sm text-steel">
            Henüz borç kaydı yok. İlk borcunuzu eklediğinizde panel ve aylık plan kayıtlı bilgilerle güncellenecek.
          </p>
        ) : (
          debts.map((debt) => <DebtRow key={debt.id} debt={debt} />)
        )}
      </div>
    </FormSection>
  );
}

function kurusToLiraInput(value?: number | null): string {
  if (typeof value !== "number") {
    return "";
  }

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: value % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function parseLiraInputToKurus(value: string): number {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.round(parsed * 100);
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
    <details className="rounded-md border border-line bg-surface p-4">
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
  const [selectedType, setSelectedType] = useState(debt?.type ?? "credit_card");
  const [balanceInput, setBalanceInput] = useState(kurusToLiraInput(debt?.balanceKurus));
  const balanceKurus = useMemo(() => parseLiraInputToKurus(balanceInput), [balanceInput]);
  const isCreditCard = selectedType === "credit_card";
  const calculatedMinimumPaymentKurus = Math.round(balanceKurus * 0.4);
  const calculatedMinimumPaymentLira = calculatedMinimumPaymentKurus / 100;

  return (
    <>
      <label className="block">
        <span className="text-sm font-medium text-steel">Borç türü</span>
        <select
          name="type"
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
          className="ui-input mt-2 w-full"
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
        <span className="text-sm font-medium text-steel">Banka veya alacaklı</span>
        <input
          name="lender"
          type="text"
          required
          defaultValue={debt?.lender ?? ""}
          className="ui-input mt-2 w-full"
        />
        <FieldError state={state} name="lender" />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-steel">Borç adı</span>
        <input
          name="name"
          type="text"
          required
          defaultValue={debt?.name ?? ""}
          className="ui-input mt-2 w-full"
        />
        <FieldError state={state} name="name" />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-steel">Durum</span>
        <select
          name="status"
          defaultValue={debt?.status ?? "active"}
          className="ui-input mt-2 w-full"
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
      <BalanceMoneyInput state={state} value={balanceInput} onChange={setBalanceInput} />
      {isCreditCard ? (
        <label className="block">
          <span className="text-sm font-medium text-steel">Minimum ödeme</span>
          <input type="hidden" name="minimumPaymentKurus" value={calculatedMinimumPaymentLira} />
          <output className="mt-2 flex min-h-10 w-full items-center rounded-md border border-line bg-surface-muted px-3 py-2 text-sm font-semibold text-ink">
            {formatTry(calculatedMinimumPaymentKurus)}
          </output>
          <p className="mt-1 text-xs text-steel">Kredi kartı için kalan borcun %40’ı otomatik hesaplanır.</p>
          <FieldError state={state} name="minimumPaymentKurus" />
        </label>
      ) : (
        <MoneyInput
          state={state}
          name="minimumPaymentKurus"
          label="Minimum ödeme"
          value={debt?.minimumPaymentKurus}
          helper="Kredi, ek hesap veya diğer borçlar için bankanın bildirdiği minimum/aylık ödeme."
          required
        />
      )}
      <MoneyInput
        state={state}
        name="creditLimitKurus"
        label="Kredi limiti"
        value={debt?.creditLimitKurus}
        helper="Varsa kredi kartı limitini TL olarak girin."
      />

      <label className="block">
        <span className="text-sm font-medium text-steel">Manuel aylık faiz (%)</span>
        <input
          name="interestRateMonthly"
          type="number"
          min="0"
          max="25"
          step="0.01"
          defaultValue={debt?.interestRateMonthly ?? "0"}
          className="ui-input mt-2 w-full"
        />
        <p className="mt-1 text-xs text-steel">
          Boş bırakırsanız kredi kartında güvenli referans oranı, diğer borçlarda 0% ve uyarı kullanılır.
        </p>
        {debt ? (
          <p className="mt-1 text-xs font-medium text-steel">
            Kullanılan faiz: %{Number(debt.resolvedInterestRateMonthly || 0).toLocaleString("tr-TR")} ·{" "}
            {interestSourceLabel(debt.interestRateSource)}
          </p>
        ) : null}
        <FieldError state={state} name="interestRateMonthly" />
      </label>

      <DaySelect state={state} name="dueDay" label="Son ödeme günü" value={debt?.dueDay} required />
      <DaySelect
        state={state}
        name="statementDay"
        label="Hesap kesim günü"
        value={debt?.statementDay}
        emptyLabel="Hesap kesim günü yok"
      />
      <NumberInput state={state} name="installmentCount" label="Taksit sayısı" min={1} value={debt?.installmentCount} />
      <NumberInput state={state} name="remainingInstallments" label="Kalan taksit" min={0} value={debt?.remainingInstallments} />
    </>
  );
}

function BalanceMoneyInput({
  state,
  value,
  onChange,
}: {
  state: FormActionState;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-steel">Kalan borç</span>
      <div className="mt-2 flex overflow-hidden rounded-md border border-line bg-surface transition focus-within:border-mint focus-within:ring-2 focus-within:ring-mint/20">
        <span className="flex items-center border-r border-line bg-surface-muted px-3 text-sm font-semibold text-steel">₺</span>
        <input
          name="balanceKurus"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0,00"
          className="w-full bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-steel/70"
        />
      </div>
      <p className="mt-1 text-xs text-steel">Kredi kartı minimum ödemesi bu tutar üzerinden otomatik hesaplanır.</p>
      <FieldError state={state} name="balanceKurus" />
    </label>
  );
}

function interestSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    manual: "Manuel",
    tcmb_contractual: "TCMB akdi",
    tcmb_overdue: "TCMB gecikme",
    cached_contractual: "Önbellek akdi",
    cached_overdue: "Önbellek gecikme",
    fallback_contractual: "Güvenli yedek",
    fallback_overdue: "Güvenli yedek gecikme",
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
      <span className="text-sm font-medium text-steel">{label}</span>
      <input
        name={name}
        type="number"
        min={min}
        max={max}
        defaultValue={value ?? ""}
        className="ui-input mt-2 w-full"
      />
      <FieldError state={state} name={name} />
    </label>
  );
}
