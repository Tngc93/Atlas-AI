"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { simulateForecastScenarioAction, type ForecastScenarioActionState } from "@/features/forecast/actions";
import type { ForecastScenarioComparisonItem, ForecastScenarioType } from "@/features/forecast/types";
import { formatTry } from "@/features/finance/money";
import type { UiRiskLevel } from "@/features/finance/types";
import { FieldError, FormMessage, MoneyInput } from "@/components/forms/FormControls";
import { initialFormActionState } from "@/lib/actions/action-state";
import { trCopy } from "@/lib/copy/tr";

const scenarioOptions: { value: ForecastScenarioType; label: string; description: string }[] = [
  {
    value: "salary_increase",
    label: "Maaş artışı",
    description: "Aylık maaşın tahmin boyunca artmış olduğunu varsayar.",
  },
  {
    value: "salary_decrease",
    label: "Maaş azalması",
    description: "Aylık maaşın tahmin boyunca azalmış olduğunu varsayar.",
  },
  {
    value: "expense_decrease",
    label: "Gider azalması",
    description: "Zorunlu giderlerin yüzde olarak azaldığını varsayar.",
  },
  {
    value: "expense_increase",
    label: "Gider artışı",
    description: "Zorunlu giderlerin yüzde olarak arttığını varsayar.",
  },
  {
    value: "extra_debt_payment",
    label: "Ek borç ödemesi",
    description: "Ek ödemenin mevcut tahmin içinde borç kapatma hızına etkisini gösterir.",
  },
  {
    value: "new_debt",
    label: "Yeni borç",
    description: "Geçici yeni borcun uzun vadeli tahmine etkisini gösterir.",
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

function signedCount(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

function payoffDeltaLabel(value: number | null): string {
  if (value === null) {
    return "24 ay içinde netleşmiyor";
  }

  if (value > 0) {
    return `${value} ay daha erken`;
  }

  if (value < 0) {
    return `${Math.abs(value)} ay daha geç`;
  }

  return "Değişmiyor";
}

function amountTone(value: number, lowerIsBetter = true): string {
  if (value === 0) {
    return "text-ink";
  }

  const isGood = lowerIsBetter ? value < 0 : value > 0;
  return isGood ? "text-mint" : "text-coral";
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="ui-primary-button">
      {pending ? "Hesaplanıyor..." : "Karşılaştır"}
    </button>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button type="button" onClick={onReset} className="ui-secondary-button">
      Sıfırla
    </button>
  );
}

export function ForecastScenarioPanel() {
  const [resetKey, setResetKey] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedType, setSelectedType] = useState<ForecastScenarioType>("salary_increase");
  const [state, action] = useActionState<ForecastScenarioActionState, FormData>(
    simulateForecastScenarioAction,
    initialFormActionState,
  );
  const selectedScenario = useMemo(
    () => scenarioOptions.find((scenario) => scenario.value === selectedType) ?? scenarioOptions[0],
    [selectedType],
  );
  const requiresAmount = ["salary_increase", "salary_decrease", "extra_debt_payment", "new_debt"].includes(selectedType);
  const requiresPercent = ["expense_decrease", "expense_increase"].includes(selectedType);
  const requiresNewDebtFields = selectedType === "new_debt";
  const formAction = (formData: FormData) => {
    setShowResult(true);
    action(formData);
  };
  const resetScenario = () => {
    setResetKey((value) => value + 1);
    setShowResult(false);
  };

  return (
    <section className="mt-6 rounded-lg border border-line bg-surface p-5 shadow-sm">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Geçici senaryo</p>
          <h2 className="mt-2 text-lg font-semibold">Senaryo karşılaştır</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Bu alan kayıtlı verilerinizi değiştirmez ve geçmişe kaydedilmez. Yalnızca mevcut tahminle geçici bir varsayımı
            karşılaştırır.
          </p>

          <form key={resetKey} action={formAction} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-steel">Senaryo türü</span>
              <select
                name="type"
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value as ForecastScenarioType)}
                className="ui-input mt-2 w-full"
              >
                {scenarioOptions.map((scenario) => (
                  <option key={scenario.value} value={scenario.value}>
                    {scenario.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-steel">{selectedScenario.description}</p>
              <FieldError state={state} name="type" />
            </label>

            {requiresAmount ? (
              <MoneyInput state={state} name="amountKurus" label="Tutar" helper="Geçici senaryoda kullanılacak TL tutarı." required />
            ) : null}

            {requiresPercent ? (
              <label className="block">
                <span className="text-sm font-medium text-steel">Yüzde</span>
                <input name="percent" type="number" min="0" max="100" step="0.1" className="ui-input mt-2 w-full" required />
                <p className="mt-1 text-xs text-steel">Örnek: 10 yazarsanız giderler %10 değişmiş varsayılır.</p>
                <FieldError state={state} name="percent" />
              </label>
            ) : null}

            {requiresNewDebtFields ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <MoneyInput
                  state={state}
                  name="minimumPaymentKurus"
                  label="Minimum ödeme"
                  helper="Geçici yeni borcun aylık minimum ödemesi."
                  required
                />
                <label className="block">
                  <span className="text-sm font-medium text-steel">Aylık faiz (%)</span>
                  <input name="interestRateMonthly" type="number" min="0" step="0.01" className="ui-input mt-2 w-full" />
                  <p className="mt-1 text-xs text-steel">Boş bırakılırsa %0 varsayılır ve uyarı gösterilir.</p>
                  <FieldError state={state} name="interestRateMonthly" />
                </label>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <SubmitButton />
              <ResetButton onReset={resetScenario} />
              {showResult ? <FormMessage state={state} /> : null}
            </div>
          </form>
        </div>

        <div aria-live="polite"><ForecastScenarioResult state={state} showResult={showResult} /></div>
      </div>
    </section>
  );
}

function ForecastScenarioResult({ state, showResult }: { state: ForecastScenarioActionState; showResult: boolean }) {
  const result = state.result;

  if (!result || !showResult) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface-muted p-5">
        <h3 className="text-base font-semibold">Sonuç bekleniyor</h3>
        <p className="mt-2 text-sm leading-6 text-steel">
          Bir senaryo çalıştırdığınızda mevcut tahminle geçici senaryo arasındaki fark burada görünür.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-mint/20 bg-mint/10 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Geçici senaryo sonucu</p>
          <h3 className="mt-2 text-xl font-semibold">{result.title}</h3>
        </div>
        <span className="w-fit rounded-md border border-line bg-surface px-3 py-2 text-xs font-semibold text-steel">
          Mevcut veri değişmedi
        </span>
      </div>

      <div className="mt-5 rounded-md border border-line bg-surface p-4">
        <h4 className="text-sm font-semibold">Karşılaştırma özeti</h4>
        <p className="mt-2 text-sm leading-6 text-steel">{result.comparison.summary}</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <ScenarioInsightList title="İyileşen taraflar" items={result.comparison.improvements} emptyText="Belirgin bir iyileşme sinyali görünmüyor." />
          <ScenarioInsightList title="Zorlaşan taraflar" items={result.comparison.worsenings} emptyText="Belirgin bir zorlaşma sinyali görünmüyor." />
          <ScenarioInsightList title="Trade-off" items={result.comparison.tradeOffs} emptyText="Belirgin bir trade-off görünmüyor." />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ScenarioImpact label="Risk etkisi" value={result.comparison.riskImpact} />
          <ScenarioImpact label="Ödeme kapasitesi etkisi" value={result.comparison.paymentCapacityImpact} />
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-sm font-semibold">Detay farklar</h4>
        <p className="mt-1 text-xs leading-5 text-steel">Bu metrikler karşılaştırma özetini destekleyen hesaplanmış farklardır.</p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <ScenarioMetric
          label="24 ay sonu kalan borç farkı"
          value={signedTry(result.delta.finalRemainingDebtDeltaKurus)}
          tone={amountTone(result.delta.finalRemainingDebtDeltaKurus)}
        />
        <ScenarioMetric
          label="Toplam faiz farkı"
          value={signedTry(result.delta.totalInterestDeltaKurus)}
          tone={amountTone(result.delta.totalInterestDeltaKurus)}
        />
        <ScenarioMetric
          label="Ortalama yaşam bütçesi farkı"
          value={signedTry(result.delta.averageLivingBudgetDeltaKurus)}
          tone={amountTone(result.delta.averageLivingBudgetDeltaKurus, false)}
        />
        <ScenarioMetric label="Tahmini kapanış farkı" value={payoffDeltaLabel(result.delta.payoffMonthDelta)} />
        <ScenarioMetric
          label="Risk seviyesi"
          value={`${riskLabel(result.delta.baselineRiskLevel)} → ${riskLabel(result.delta.scenarioRiskLevel)}`}
        />
        <ScenarioMetric label="Riskli ay sayısı farkı" value={signedCount(result.delta.riskWarningCountDelta)} />
      </div>

      <div className="mt-5 rounded-md border border-line bg-surface p-4">
        <h4 className="text-sm font-semibold">Neden?</h4>
        <p className="mt-2 text-sm leading-6 text-steel">{result.explanation.why}</p>
      </div>

      {result.warnings.length > 0 ? (
        <div className="mt-4 rounded-md border border-amber/25 bg-amber/10 p-4">
          <h4 className="text-sm font-semibold">Senaryo uyarıları</h4>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-steel">
            {result.warnings.map((warning) => (
              <li key={warning.id}>• {warning.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-steel">
        Bu karşılaştırma geçici varsayımdır; kayıtlı gelir, gider, borç ve geçmiş verilerinizi değiştirmez.
      </p>
    </div>
  );
}

function insightToneClass(tone: ForecastScenarioComparisonItem["tone"]): string {
  if (tone === "positive") {
    return "border-mint/25 bg-mint/10";
  }

  if (tone === "negative") {
    return "border-coral/25 bg-coral/10";
  }

  if (tone === "watch") {
    return "border-amber/25 bg-amber/10";
  }

  return "border-line bg-surface-muted";
}

function ScenarioInsightList({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: ForecastScenarioComparisonItem[];
  emptyText: string;
}) {
  return (
    <section className="rounded-md border border-line bg-surface-muted p-3">
      <h5 className="text-xs font-semibold uppercase tracking-[0.12em] text-steel">{title}</h5>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.slice(0, 3).map((item) => (
            <li key={item.id} className={`rounded-md border p-3 ${insightToneClass(item.tone)}`}>
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-steel">{item.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-steel">{emptyText}</p>
      )}
    </section>
  );
}

function ScenarioImpact({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-md border border-line bg-surface-muted p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-2 text-sm leading-6 text-steel">{value}</p>
    </article>
  );
}

function ScenarioMetric({ label, value, tone = "text-ink" }: { label: string; value: string; tone?: string }) {
  return (
    <article className="rounded-md border border-line bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${tone}`}>{value}</p>
    </article>
  );
}
