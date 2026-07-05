"use client";

import { useState } from "react";
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

  return <p className="mt-1 text-xs font-medium text-coral">{error}</p>;
}

export function FormMessage({ state }: { state: FormActionState }) {
  if (!state.message) {
    return null;
  }

  const tone = state.status === "success" ? "border-mint/25 bg-mint/10 text-mint" : "border-coral/25 bg-coral/10 text-coral";

  return (
    <p role="status" className={`rounded-md border px-3 py-2 text-sm font-medium ${tone}`}>
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
      className="inline-flex items-center justify-center rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:bg-ink/45"
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
      className="inline-flex items-center justify-center rounded-md border border-coral/25 px-3 py-2 text-sm font-semibold text-coral transition hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Siliniyor..." : "Sil"}
    </button>
  );
}

export function ConfirmDeleteButton({ itemLabel = "kayıt" }: { itemLabel?: string }) {
  const { pending } = useFormStatus();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => setIsConfirming(true)}
        className="inline-flex items-center justify-center rounded-md border border-coral/25 px-3 py-2 text-sm font-semibold text-coral transition hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Sil
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-coral/20 bg-coral/10 p-2">
      <span className="text-sm font-medium text-coral">Bu {itemLabel} silinsin mi?</span>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-md bg-coral px-3 py-2 text-sm font-semibold text-white transition hover:bg-coral/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Siliniyor..." : "Eminim sil"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setIsConfirming(false)}
        className="inline-flex items-center justify-center rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-ink/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
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
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/70">{label}</span>
      <div className="mt-2 flex overflow-hidden rounded-md border border-ink/15 bg-white transition focus-within:border-mint focus-within:ring-2 focus-within:ring-mint/20">
        <span className="flex items-center border-r border-ink/10 bg-ink/[0.03] px-3 text-sm font-semibold text-ink/55">
          ₺
        </span>
        <input
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required={required}
          defaultValue={kurusToLiraInput(value)}
          placeholder="0,00"
          className="w-full bg-white px-3 py-2 text-sm outline-none"
        />
      </div>
      <p className="mt-1 text-xs text-ink/45">{helper}</p>
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
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/60">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
