"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { FormActionState } from "@/lib/actions/action-state";
import { getFirstFieldError } from "@/lib/actions/action-state";

function kurusToLiraInput(value?: number | null): string {
  if (typeof value !== "number") {
    return "";
  }

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: value % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function FieldError({ state, name }: { state: FormActionState; name: string }) {
  const error = getFirstFieldError(state, name);

  if (!error) {
    return null;
  }

  return <p id={`${name}-error`} role="alert" className="mt-2 text-sm font-semibold leading-5 text-coral">{error}</p>;
}

export function FormMessage({ state }: { state: FormActionState }) {
  if (!state.message) {
    return null;
  }

  const tone = state.status === "success" ? "border-mint/25 bg-mint/10 text-mint" : "border-coral/25 bg-coral/10 text-coral";

  return (
    <p role={state.status === "error" ? "alert" : "status"} aria-live="polite" className={`rounded-xl border px-4 py-3 text-sm font-semibold leading-5 ${tone}`}>
      {state.message}
    </p>
  );
}

export function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="ui-primary-button"
    >
      {pending ? "Kaydediliyor..." : children}
    </button>
  );
}

export function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-coral/35 px-4 py-2 text-sm font-semibold text-coral transition hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Siliniyor..." : "Sil"}
    </button>
  );
}

export function ConfirmDeleteButton({ itemLabel = "kayıt" }: { itemLabel?: string }) {
  const { pending } = useFormStatus();
  const [isConfirming, setIsConfirming] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isConfirming) confirmButtonRef.current?.focus();
  }, [isConfirming]);

  if (!isConfirming) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => setIsConfirming(true)}
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-coral/35 px-4 py-2 text-sm font-semibold text-coral transition hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Sil
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-coral/30 bg-coral/10 p-3" role="group" aria-label={`${itemLabel} silme onayı`}>
      <span className="text-sm font-semibold text-coral">Bu {itemLabel} silinsin mi?</span>
      <button
        ref={confirmButtonRef}
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Siliniyor..." : "Eminim sil"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setIsConfirming(false)}
        className="ui-secondary-button"
      >
        Vazgeç
      </button>
    </div>
  );
}

export function MoneyInput({
  state,
  name,
  label,
  value,
  helper = "TL olarak girin. Örnek: 12500,50",
  required = false,
}: {
  state: FormActionState;
  name: string;
  label: string;
  value?: number | null;
  helper?: string;
  required?: boolean;
}) {
  const error = getFirstFieldError(state, name);
  const helperId = `${name}-helper`;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <label className="block">
      <span className="product-field-label">{label}{required ? <span className="ml-1 text-coral" aria-hidden="true">*</span> : null}</span>
      <div className="mt-2 flex min-h-12 overflow-hidden rounded-xl border border-line bg-surface transition focus-within:border-mint focus-within:ring-2 focus-within:ring-mint/25">
        <span className="flex items-center border-r border-line bg-surface-muted px-3 text-sm font-semibold text-steel">
          ₺
        </span>
        <input
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={[helperId, errorId].filter(Boolean).join(" ")}
          defaultValue={kurusToLiraInput(value)}
          placeholder="0,00"
          className="w-full bg-surface px-3.5 py-2.5 text-[15px] font-medium text-ink outline-none placeholder:text-steel/70"
        />
      </div>
      <p id={helperId} className="product-helper">{helper}</p>
      <FieldError state={state} name={name} />
    </label>
  );
}

export function DaySelect({
  state,
  name,
  label,
  value,
  required = false,
  emptyLabel = "Gün seçin",
  helper,
}: {
  state: FormActionState;
  name: string;
  label: string;
  value?: number | null;
  required?: boolean;
  emptyLabel?: string;
  helper?: string;
}) {
  const error = getFirstFieldError(state, name);
  const helperId = helper ? `${name}-helper` : undefined;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <label className="block">
      <span className="product-field-label">{label}{required ? <span className="ml-1 text-coral" aria-hidden="true">*</span> : null}</span>
      <select name={name} defaultValue={value ?? ""} required={required} aria-required={required} aria-invalid={Boolean(error)} aria-describedby={[helperId, errorId].filter(Boolean).join(" ") || undefined} className="ui-input mt-2 w-full">
        <option value="">{emptyLabel}</option>
        {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
          <option key={day} value={day}>
            {day}. gün
          </option>
        ))}
      </select>
      {helper ? <p id={helperId} className="product-helper">{helper}</p> : null}
      <FieldError state={state} name={name} />
    </label>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ui-card">
      <h2 className="product-section-title">{title}</h2>
      <p className="product-body-copy mt-2 max-w-3xl">{description}</p>
      <div className="mt-7">{children}</div>
    </section>
  );
}
