"use client";

import { useState, useTransition } from "react";
import { RefreshCcw } from "lucide-react";
import type { InterestRateSnapshot } from "@/features/rates/types";
import { trCopy } from "@/lib/copy/tr";

const statusLabels: Record<InterestRateSnapshot["providerStatus"], string> = {
  fresh: "Güncel referans",
  cached: "Kaydedilmiş referans",
  stale: "Eski referans",
  fallback: "Güvenli yedek referans",
  failed: "Referans alınamadı",
};

export function RatePanel({ initialSnapshot }: { initialSnapshot: InterestRateSnapshot }) {
  const [snapshot, setSnapshot] = useState<InterestRateSnapshot>(initialSnapshot);
  const [isPending, startTransition] = useTransition();

  function refreshRates() {
    startTransition(async () => {
      const response = await fetch("/api/rates/refresh");
      const nextSnapshot = (await response.json()) as InterestRateSnapshot;
      setSnapshot(nextSnapshot);
    });
  }

  return (
    <section className="ui-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{trCopy.rates.title}</h2>
          <p className="mt-1 text-sm text-steel">{trCopy.rates.subtitle}</p>
          <p className="mt-2 text-xs font-semibold text-steel">Referans durumu: {statusLabels[snapshot.providerStatus]}</p>
        </div>
        <button
          className="ui-secondary-button"
          type="button"
          onClick={refreshRates}
          disabled={isPending}
        >
          <RefreshCcw size={16} aria-hidden="true" />
          {isPending ? trCopy.rates.refreshing : trCopy.rates.refresh}
        </button>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <RateItem label={trCopy.rates.reference} value={snapshot.referenceRate} />
        <RateItem label={trCopy.rates.maxContractual} value={snapshot.maxContractualRate} />
        <RateItem label={trCopy.rates.maxOverdue} value={snapshot.maxOverdueRate} />
      </dl>
      <p className="mt-4 text-xs leading-5 text-steel">
        {trCopy.rates.effective}: {snapshot.effectiveDate}. {trCopy.rates.retrieved}:{" "}
        {new Date(snapshot.retrievedAt).toLocaleString("tr-TR")}.
      </p>
      {snapshot.note ? <p className="mt-2 text-xs leading-5 text-steel">{snapshot.note}</p> : null}
      {snapshot.isStale ? (
        <p className="mt-3 rounded-md border border-amber/25 bg-amber/10 p-3 text-xs leading-5 text-steel">
          {trCopy.rates.staleWarning}
        </p>
      ) : null}
      <a
        className="mt-3 inline-flex text-xs font-semibold text-steel underline-offset-4 hover:underline"
        href={snapshot.rawSourceUrl}
        target="_blank"
        rel="noreferrer"
      >
        {trCopy.rates.sourceLink}
      </a>
    </section>
  );
}

function RateItem({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-md border border-line bg-surface-muted p-3">
      <dt className="text-xs font-medium uppercase tracking-[0.12em] text-steel">{label}</dt>
      <dd className="mt-2 text-xl font-semibold">
        {typeof value === "number" ? `%${value.toFixed(2)}` : trCopy.rates.notAvailable}
      </dd>
    </div>
  );
}
