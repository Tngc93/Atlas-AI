"use client";

import { useActionState } from "react";
import { formatTry } from "@/features/finance/money";
import type { FormActionState } from "@/lib/actions/action-state";
import { initialFormActionState } from "@/lib/actions/action-state";
import {
  createSalaryRecordAction,
  deleteSalaryRecordAction,
  saveProfileIncomeAction,
  updateSalaryRecordAction,
} from "@/features/income/actions";
import { ConfirmDeleteButton, DaySelect, FieldError, FormMessage, FormSection, MoneyInput, SubmitButton } from "./FormControls";

export type ProfileFormModel = {
  id: string;
  monthlySalaryKurus: number;
  survivalThresholdKurus: number;
  salaryDay: number | null;
} | null;

export type SalaryRecordFormModel = {
  id: string;
  amountKurus: number;
  salaryDay: number | null;
  effectiveDateIso: string;
  notes: string | null;
};

function dateInputValue(date?: Date | string): string {
  if (!date) {
    return new Date().toISOString().slice(0, 10);
  }

  return new Date(date).toISOString().slice(0, 10);
}

export function IncomeCrudPanels({
  profile,
  salaryRecords,
}: {
  profile: ProfileFormModel;
  salaryRecords: SalaryRecordFormModel[];
}) {
  return (
    <div className="space-y-6">
      <ProfileIncomeForm profile={profile} />
      <SalaryHistoryPanel salaryRecords={salaryRecords} />
    </div>
  );
}

function ProfileIncomeForm({ profile }: { profile: ProfileFormModel }) {
  const [state, formAction] = useActionState<FormActionState, FormData>(
    saveProfileIncomeAction,
    initialFormActionState,
  );

  return (
    <FormSection
      title="Gelir yönetimi"
      description="Güncel maaş, maaş günü ve hayatta kalma bütçesi eşiğini kayıtlı finans bilgileriniz arasında yönetin."
    >
      <form action={formAction} className="grid gap-4 lg:grid-cols-3">
        <MoneyInput state={state} name="monthlySalaryKurus" label="Aylık maaş" value={profile?.monthlySalaryKurus} required />

        <MoneyInput
          state={state}
          name="survivalThresholdKurus"
          label="Hayatta kalma eşiği"
          value={profile?.survivalThresholdKurus}
          helper="Ay sonunda korunmasını istediğiniz güvenli TL tamponu."
        />

        <DaySelect state={state} name="salaryDay" label="Maaş günü" value={profile?.salaryDay} emptyLabel="Maaş günü seçilmedi" />

        <div className="flex items-end gap-3 lg:col-span-3">
          <SubmitButton>{profile ? "Geliri güncelle" : "Gelir ekle"}</SubmitButton>
          <FormMessage state={state} />
        </div>
      </form>
    </FormSection>
  );
}

function SalaryHistoryPanel({ salaryRecords }: { salaryRecords: SalaryRecordFormModel[] }) {
  const [createState, createAction] = useActionState<FormActionState, FormData>(
    createSalaryRecordAction,
    initialFormActionState,
  );

  return (
    <FormSection
      title="Maaş geçmişi"
      description="Geçmiş maaş kayıtlarını ayrıca ekleyin. Güncel maaş güncellemesi otomatik geçmiş kaydı oluşturmaz."
    >
      <form action={createAction} className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <MoneyInput state={createState} name="amountKurus" label="Maaş tutarı" required />
        <DaySelect state={createState} name="salaryDay" label="Maaş günü" emptyLabel="Maaş günü seçilmedi" />
        <label className="block">
          <span className="text-sm font-medium text-steel">Geçerlilik tarihi</span>
          <input
            name="effectiveDate"
            type="date"
            defaultValue={dateInputValue()}
            className="ui-input mt-2 w-full"
          />
          <FieldError state={createState} name="effectiveDate" />
        </label>
        <div className="flex items-end">
          <SubmitButton>Geçmişe ekle</SubmitButton>
        </div>
        <label className="block lg:col-span-3">
          <span className="text-sm font-medium text-steel">Not</span>
          <input
            name="notes"
            type="text"
            className="ui-input mt-2 w-full"
          />
          <FieldError state={createState} name="notes" />
        </label>
        <div className="lg:col-span-4">
          <FormMessage state={createState} />
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {salaryRecords.length === 0 ? (
          <p className="rounded-md border border-dashed border-line bg-surface-muted p-4 text-sm text-steel">
            Henüz maaş geçmişi kaydı yok.
          </p>
        ) : (
          salaryRecords.map((record) => <SalaryRecordRow key={record.id} record={record} />)
        )}
      </div>
    </FormSection>
  );
}

function SalaryRecordRow({ record }: { record: SalaryRecordFormModel }) {
  const [updateState, updateAction] = useActionState<FormActionState, FormData>(
    updateSalaryRecordAction,
    initialFormActionState,
  );
  const [deleteState, deleteAction] = useActionState<FormActionState, FormData>(
    deleteSalaryRecordAction,
    initialFormActionState,
  );

  return (
    <details className="rounded-md border border-line bg-surface p-4">
      <summary className="cursor-pointer text-sm font-semibold">
        {formatTry(record.amountKurus)} · {new Date(record.effectiveDateIso).toLocaleDateString("tr-TR")}
      </summary>
      <form action={updateAction} className="mt-4 grid gap-4 lg:grid-cols-4">
        <input type="hidden" name="id" value={record.id} />
        <MoneyInput state={updateState} name="amountKurus" label="Maaş tutarı" value={record.amountKurus} required />
        <DaySelect state={updateState} name="salaryDay" label="Maaş günü" value={record.salaryDay} emptyLabel="Maaş günü seçilmedi" />
        <label className="block">
          <span className="text-sm font-medium text-steel">Geçerlilik tarihi</span>
          <input
            name="effectiveDate"
            type="date"
            defaultValue={dateInputValue(record.effectiveDateIso)}
            className="ui-input mt-2 w-full"
          />
          <FieldError state={updateState} name="effectiveDate" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-steel">Not</span>
          <input
            name="notes"
            type="text"
            defaultValue={record.notes ?? ""}
            className="ui-input mt-2 w-full"
          />
          <FieldError state={updateState} name="notes" />
        </label>
        <div className="flex flex-wrap items-center gap-3 lg:col-span-4">
          <SubmitButton>Kaydı güncelle</SubmitButton>
          <FormMessage state={updateState} />
        </div>
      </form>
      <form action={deleteAction} className="mt-3 flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={record.id} />
        <ConfirmDeleteButton itemLabel="maaş kaydı" />
        <FormMessage state={deleteState} />
      </form>
    </details>
  );
}
