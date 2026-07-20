"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import { formatDemoTry } from "@/features/demo/presentation";
import { useDemoFinance } from "@/features/demo/store";
import { simulateForecastScenario } from "@/features/forecast/scenario-engine";
import { buildForecastReport } from "@/features/forecast/service";
import type { ForecastHorizon } from "@/features/forecast/types";
import { chartLabelStyle, chartTheme, chartTooltipStyle } from "@/components/ui/chartTheme";
import { useReducedMotion } from "@/components/ui/useReducedMotion";

function riskLabel(level: string) {
  return ({ low: "Low", medium: "Medium", high: "High", critical: "High" } as Record<string, string>)[level] ?? "High";
}

function formatChartValue(value: unknown) {
  return `${Number(value ?? 0).toLocaleString("en-US")} TRY`;
}

export default function DemoForecastPage() {
  const { snapshot } = useDemoFinance();
  const reducedMotion = useReducedMotion();
  const [horizon, setHorizon] = useState<ForecastHorizon>(24);
  const [compare, setCompare] = useState(true);

  const report = useMemo(() => buildForecastReport(snapshot), [snapshot]);
  const scenario = useMemo(
    () => simulateForecastScenario(snapshot, { type: "expense_decrease", percent: 10 }),
    [snapshot],
  );

  const checkpoint = report.checkpoints.find((item) => item.horizonMonths === horizon) ?? report.checkpoints.at(-1);
  const visibleTrend = report.monthlyTrend.slice(0, horizon);
  const visibleScenarioTrend = scenario.scenarioReport.monthlyTrend.slice(0, horizon);

  const chartData = visibleTrend.map((month, index) => ({
    month: month.month,
    remainingDebt: Math.round(month.remainingDebtKurus / 100),
    scenarioDebt: Math.round((visibleScenarioTrend[index]?.remainingDebtKurus ?? month.remainingDebtKurus) / 100),
    livingBudget: Math.round(month.livingBudgetKurus / 100),
  }));

  const debtImprovement = Math.abs(scenario.delta.finalRemainingDebtDeltaKurus);
  const interestImprovement = Math.abs(scenario.delta.totalInterestDeltaKurus);

  return (
    <>
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Public Demo · Fictional Data</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Forecast</h1>
        <p className="mt-3 max-w-3xl text-[15px] font-medium leading-7 text-steel sm:text-base">
          Review deterministic projections, inspect the trend over time and compare a reversible scenario without changing current data.
        </p>
      </div>

      <section className="ui-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink sm:text-xl">Projection horizon</h2>
            <p className="mt-1 text-sm leading-6 text-steel">The chart and metrics update together for the selected period.</p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Forecast horizon">
            {report.horizons.map((item) => (
              <button
                type="button"
                key={item}
                aria-pressed={horizon === item}
                onClick={() => setHorizon(item)}
                className={horizon === item ? "ui-button-primary" : "ui-button-secondary"}
              >
                {item} months
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-surface-muted/55 p-4">
            <span className="text-sm text-steel">Projected remaining debt</span>
            <strong className="mt-1 block text-2xl">{formatDemoTry(checkpoint?.remainingDebtKurus ?? 0)}</strong>
          </div>
          <div className="rounded-xl border border-line bg-surface-muted/55 p-4">
            <span className="text-sm text-steel">Estimated period interest</span>
            <strong className="mt-1 block text-2xl">{formatDemoTry(checkpoint?.periodInterestKurus ?? 0)}</strong>
          </div>
          <div className="rounded-xl border border-line bg-surface-muted/55 p-4">
            <span className="text-sm text-steel">Projected highest risk</span>
            <strong className="mt-1 block text-2xl">{riskLabel(checkpoint?.highestRiskLevel ?? "high")}</strong>
          </div>
        </div>
      </section>

      <section className="ui-card mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink sm:text-xl">Debt forecast and scenario comparison</h2>
            <p className="mt-1 text-sm leading-6 text-steel">
              Baseline debt trajectory compared with a hypothetical 10% mandatory-expense decrease.
            </p>
          </div>
          <button type="button" className="ui-button-secondary" aria-pressed={compare} onClick={() => setCompare((value) => !value)}>
            {compare ? "Hide scenario" : "Show 10% expense decrease"}
          </button>
        </div>

        <div className="mt-5 h-80 min-w-0 overflow-hidden" aria-label="Debt forecast chart">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} width={70} />
              <Tooltip formatter={formatChartValue} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey="remainingDebt"
                name="Current projection"
                stroke={chartTheme.steel}
                strokeWidth={3}
                dot={false}
                isAnimationActive={!reducedMotion}
              />
              {compare ? (
                <Line
                  type="monotone"
                  dataKey="scenarioDebt"
                  name="10% lower expenses"
                  stroke={chartTheme.mint}
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={!reducedMotion}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="ui-card">
          <TrendingDown className="text-mint" aria-hidden size={22} />
          <p className="mt-3 text-sm font-semibold text-steel">Scenario debt impact</p>
          <strong className="mt-1 block text-2xl">{formatDemoTry(debtImprovement)}</strong>
          <p className="mt-2 text-sm leading-6 text-steel">Potential reduction in 24-month remaining debt versus the baseline.</p>
        </article>
        <article className="ui-card">
          <TrendingUp className="text-mint" aria-hidden size={22} />
          <p className="mt-3 text-sm font-semibold text-steel">Average safe-budget impact</p>
          <strong className="mt-1 block text-2xl">{formatDemoTry(scenario.delta.averageLivingBudgetDeltaKurus)}</strong>
          <p className="mt-2 text-sm leading-6 text-steel">Average monthly change created by the temporary scenario.</p>
        </article>
        <article className="ui-card">
          <TriangleAlert className="text-mint" aria-hidden size={22} />
          <p className="mt-3 text-sm font-semibold text-steel">Risk movement</p>
          <strong className="mt-1 block text-2xl">
            {riskLabel(scenario.delta.baselineRiskLevel)} → {riskLabel(scenario.delta.scenarioRiskLevel)}
          </strong>
          <p className="mt-2 text-sm leading-6 text-steel">Deterministic comparison of the highest projected risk level.</p>
        </article>
      </section>

      <section className="ui-card mt-6 border-mint/25 bg-mint/10">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-mint">Deterministic analysis</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">What changes in the comparison?</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-steel">
          A 10% decrease in mandatory expenses creates {formatDemoTry(scenario.delta.averageLivingBudgetDeltaKurus)} of additional average monthly room and changes estimated interest by {formatDemoTry(interestImprovement)}. The calculation comes from the finance engine; no AI model is used to generate these values.
        </p>
        <p className="mt-3 text-xs font-semibold text-mint">Hypothetical and reversible · Current fictional records remain unchanged · Not financial advice</p>
      </section>

      <section className="ui-card mt-6">
        <h2 className="text-lg font-semibold text-ink sm:text-xl">Monthly safe-budget trend</h2>
        <p className="mt-1 text-sm leading-6 text-steel">Expected living-budget capacity across the selected forecast horizon.</p>
        <div className="mt-5 h-64 min-w-0 overflow-hidden" aria-label="Safe budget forecast chart">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} width={70} />
              <Tooltip formatter={formatChartValue} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} />
              <Line
                type="monotone"
                dataKey="livingBudget"
                name="Safe budget"
                stroke={chartTheme.mint}
                strokeWidth={3}
                dot={false}
                isAnimationActive={!reducedMotion}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
