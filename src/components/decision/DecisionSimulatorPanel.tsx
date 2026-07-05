"use client";

import { useActionState, useMemo, useState } from "react";
import { simulateDecisionScenarioAction, type DecisionActionState } from "@/features/decision/actions";
import type { DecisionScenarioType } from "@/features/decision/types";
import { formatTry } from "@/features/finance/money";
import type { UiRiskLevel } from "@/features/finance/types";
import { FieldError, FormMessage, MoneyInput } from "@/components/forms/FormControls";
import { initialFormActionState } from "@/lib/actions/action-state";
import { trCopy } from "@/lib/copy/tr";

type DebtOption = {
  id: string;
  name: string;
};

const scenarioOptions: { value: DecisionScenarioType; label: string; description: string }[] = [
  {
    value: "extra_debt_payment",
    label: "Bu ay X TL ekstra borç ödersem",
    description: "Ek ödeme varsayılan olarak avalanche hedef borcuna yönelir.",
  },
  {
    value: "salary_increase",
    label: "Maaşım X TL artarsa",
    description: "Maaş artışı tekrar eden aylık gelir gibi simüle edilir.",
  },
  {
    value: "one_time_bonus",
    label: "Bu ay X TL ek gelir alırsam",
    description: "Ek gelir yalnızca bu ayın nakit akışına eklenir.",
  },
  {
    value: "reduce_expenses_percent",
    label: "Zorunlu giderlerimi %X azaltırsam",
    description: "Gider azaltımı projeksiyon boyunca sabit varsayılır.",
  },
  {
    value: "specific_debt_payment",
    label: "Belirli bir borca X TL ödersem",
    description: "Ek ödeme seçilen aktif borca öncelikli uygulanır.",
  },
  {
    value: "no_extra_payment",
    label: "Bu ay ekstra ödeme yapmazsam",
    description: "Sadece zorunlu giderler ve minimum ödemeler korunur.",
  },
];

function riskLabel(riskLevel: UiRiskLevel): string {
  return trCopy.risk[riskLevel];
}

function signedTry(value: number): string {
  if (value > 0) {
    return `+${formatTry(value)}`;
  }

  return formatTry(value);
}

function payoffDeltaLabel(value: number | null): string {
  if (value === null) {
    return "24 aylık projeksiyon dışında";
  }

  if (value > 0) {
    return `${value} ay daha erken`;
  }

  if (value < 0) {
    return `${Math.abs(value)} ay daha geç`;
  }

  return "Değişmiyor";
}

function impactTone(value: number, lowerIsBetter = true): string {
  if (value === 0) {
    return "text-ink";
  }

  const isPositive = lowerIsBetter ? value < 0 : value > 0;
  return isPositive ? "text-mint" : "text-coral";
}

function SubmitButton() {
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:bg-ink/45"
    >
      Simüle Et
    </button>
  );
}

export function DecisionSimulatorPanel({
  activeDebts,
  hasProfile,
  hasExpenses,
}: {
  activeDebts: DebtOption[];
  hasProfile: boolean;
  hasExpenses: boolean;
}) {
  const [state, action] = useActionState<DecisionActionState, FormData>(
    simulateDecisionScenarioAction,
    initialFormActionState,
  );
  const [selectedType, setSelectedType] = useState<DecisionScenarioType>("extra_debt_payment");
  const selectedScenario = useMemo(
    () => scenarioOptions.find((scenario) => scenario.value === selectedType) ?? scenarioOptions[0],
    [selectedType],
  );
  const requiresAmount = ["extra_debt_payment", "salary_increase", "one_time_bonus", "specific_debt_payment"].includes(
    selectedType,
  );
  const requiresPercent = selectedType === "reduce_expenses_percent";
  const requiresDebt = selectedType === "specific_debt_payment";

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Deterministik simülasyon</p>
          <h2 className="mt-2 text-lg font-semibold">“Şunu yaparsam ne olur?” senaryosu</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Bu form gerçek kayıtlarınızı değiştirmez. Sonuçlar mevcut finans motorundan üretilir ve yalnızca karar desteği
            sağlar.
          </p>
        </div>

        {!hasProfile ? (
          <p className="mt-4 rounded-md border border-amber/25 bg-amber/10 p-3 text-sm text-ink/70">
            Daha anlamlı simülasyon için önce gelir sayfasından güncel maaşınızı ekleyin.
          </p>
        ) : null}

        <form action={action} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink/70">Senaryo türü</span>
            <select
              name="type"
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value as DecisionScenarioType)}
              className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20"
            >
              {scenarioOptions.map((scenario) => (
                <option key={scenario.value} value={scenario.value}>
                  {scenario.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink/45">{selectedScenario.description}</p>
            <FieldError state={state} name="type" />
          </label>

          {requiresAmount ? (
            <MoneyInput state={state} name="amountKurus" label="Tutar" helper="Simülasyonda kullanılacak TL tutarı." required />
          ) : null}

          {requiresPercent ? (
            <label className="block">
              <span className="text-sm font-medium text-ink/70">Azaltma yüzdesi</span>
              <input
                name="percent"
                type="number"
                min="0"
                max="100"
                step="0.1"
                disabled={!hasExpenses}
                className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20 disabled:cursor-not-allowed disabled:bg-ink/[0.03]"
              />
              <p className="mt-1 text-xs text-ink/45">
                Örnek: 10 yazarsanız zorunlu giderler %10 azaltılmış varsayılır.
              </p>
              <FieldError state={state} name="percent" />
            </label>
          ) : null}

          {requiresDebt ? (
            <label className="block">
              <span className="text-sm font-medium text-ink/70">Hedef borç</span>
              <select
                name="debtAccountId"
                disabled={activeDebts.length === 0}
                className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20 disabled:cursor-not-allowed disabled:bg-ink/[0.03]"
              >
                <option value="">Aktif borç seçin</option>
                {activeDebts.map((debt) => (
                  <option key={debt.id} value={debt.id}>
                    {debt.name}
                  </option>
                ))}
              </select>
              <FieldError state={state} name="debtAccountId" />
            </label>
          ) : null}

          {activeDebts.length === 0 && ["extra_debt_payment", "specific_debt_payment", "no_extra_payment"].includes(selectedType) ? (
            <p className="rounded-md border border-amber/25 bg-amber/10 p-3 text-sm text-ink/70">
              Borç odaklı senaryolar için önce aktif borç kaydı eklenmelidir.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton />
            <FormMessage state={state} />
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        {state.result ? <ScenarioResult state={state} /> : <EmptyResult />}
      </section>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="flex min-h-96 flex-col justify-center rounded-md border border-dashed border-ink/15 bg-ink/[0.02] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">Sonuç bekleniyor</p>
      <h2 className="mt-2 text-xl font-semibold">Bir senaryo seçip simülasyonu çalıştırın</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">
        Sonuç geldiğinde mevcut planla fark, kalan borç etkisi, yaşam bütçesi etkisi, risk değişimi ve “neden?”
        açıklaması burada görünecek.
      </p>
    </div>
  );
}

function ScenarioResult({ state }: { state: DecisionActionState }) {
  const result = state.result;

  if (!result) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Senaryo sonucu</p>
          <h2 className="mt-2 text-xl font-semibold">{result.title}</h2>
        </div>
        <span className="w-fit rounded-md bg-ink/[0.04] px-3 py-2 text-xs font-semibold text-ink/65">
          Kesin tavsiye değil
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ResultMetric
          label="İlk ay kalan borç farkı"
          value={signedTry(result.delta.firstMonthRemainingDebtDeltaKurus)}
          tone={impactTone(result.delta.firstMonthRemainingDebtDeltaKurus)}
        />
        <ResultMetric
          label="24 ay sonu kalan borç farkı"
          value={signedTry(result.delta.horizonRemainingDebtDeltaKurus)}
          tone={impactTone(result.delta.horizonRemainingDebtDeltaKurus)}
        />
        <ResultMetric
          label="Yaşam bütçesi etkisi"
          value={signedTry(result.delta.livingBudgetDeltaKurus)}
          tone={impactTone(result.delta.livingBudgetDeltaKurus, false)}
        />
        <ResultMetric label="Kapanış süresi etkisi" value={payoffDeltaLabel(result.delta.payoffMonthDelta)} />
        <ResultMetric
          label="Risk seviyesi"
          value={`${riskLabel(result.delta.baselineRiskLevel)} → ${riskLabel(result.delta.scenarioRiskLevel)}`}
          tone={
            result.delta.baselineRiskLevel === result.delta.scenarioRiskLevel
              ? "text-ink"
              : result.delta.scenarioRiskLevel === "high"
                ? "text-coral"
                : "text-mint"
          }
        />
        <ResultMetric
          label="Borç önceliği"
          value={result.delta.priorityChanged ? "Değişiyor" : "Değişmiyor"}
          helper={`${result.delta.baselineTopDebtName ?? "Yok"} → ${result.delta.scenarioTopDebtName ?? "Yok"}`}
        />
      </div>

      <div className="mt-5 rounded-md border border-mint/20 bg-mint/10 p-4">
        <h3 className="text-sm font-semibold text-mint">Koç yorumu</h3>
        <p className="mt-2 text-sm leading-6 text-ink/70">{result.coachComment.summary}</p>
      </div>

      <div className="mt-4 rounded-md border border-ink/10 bg-ink/[0.02] p-4">
        <h3 className="text-sm font-semibold">Neden?</h3>
        <p className="mt-2 text-sm leading-6 text-ink/70">{result.coachComment.why}</p>
      </div>

      {result.warnings.length > 0 ? (
        <div className="mt-4 rounded-md border border-coral/20 bg-coral/10 p-4">
          <h3 className="text-sm font-semibold text-coral">Risk uyarıları</h3>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-ink/70">
            {result.warnings.map((warning) => (
              <li key={warning.id}>• {warning.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 text-sm text-ink/65 sm:grid-cols-2">
        <p className="rounded-md bg-ink/[0.03] p-3">
          Günlük limit farkı: <span className="font-semibold">{signedTry(result.delta.dailyLimitDeltaKurus)}</span>
        </p>
        <p className="rounded-md bg-ink/[0.03] p-3">
          Haftalık limit farkı: <span className="font-semibold">{signedTry(result.delta.weeklyLimitDeltaKurus)}</span>
        </p>
      </div>
    </div>
  );
}

function ResultMetric({
  label,
  value,
  helper,
  tone = "text-ink",
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: string;
}) {
  return (
    <article className="rounded-md border border-ink/10 bg-ink/[0.02] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${tone}`}>{value}</p>
      {helper ? <p className="mt-1 text-xs text-ink/50">{helper}</p> : null}
    </article>
  );
}
