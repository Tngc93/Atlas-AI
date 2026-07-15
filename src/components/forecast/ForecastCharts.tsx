"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { kurusToLira } from "@/features/finance/money";
import type { ForecastMonthlyTrend } from "@/features/forecast/types";
import { chartLabelStyle, chartTheme, chartTooltipStyle } from "@/components/ui/chartTheme";
import { useReducedMotion } from "@/components/ui/useReducedMotion";

function formatTooltipValue(value: unknown): string {
  return `${Number(value ?? 0).toLocaleString("tr-TR")} TL`;
}

export function ForecastDebtTrendChart({ trend }: { trend: ForecastMonthlyTrend[] }) {
  const reducedMotion = useReducedMotion();
  const data = trend.map((month) => ({
    month: month.month,
    remainingDebt: kurusToLira(month.remainingDebtKurus),
    interest: kurusToLira(month.interestKurus),
  }));

  return (
    <div className="h-72 min-w-0 overflow-hidden">
      <ResponsiveContainer>
        <LineChart data={data}>
          <defs>
            <linearGradient id="forecastDebtGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={chartTheme.steel} stopOpacity={0.7} />
              <stop offset="100%" stopColor={chartTheme.mint} stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
          <Tooltip formatter={formatTooltipValue} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} />
          <Line type="monotone" dataKey="remainingDebt" name="Kalan borç" stroke="url(#forecastDebtGradient)" strokeWidth={3} dot={false} animationDuration={900} isAnimationActive={!reducedMotion} />
          <Line type="monotone" dataKey="interest" name="Faiz etkisi" stroke={chartTheme.coral} strokeWidth={2} dot={false} animationDuration={900} isAnimationActive={!reducedMotion} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ForecastLivingBudgetChart({ trend }: { trend: ForecastMonthlyTrend[] }) {
  const reducedMotion = useReducedMotion();
  const data = trend.map((month) => ({
    month: month.month,
    livingBudget: kurusToLira(month.livingBudgetKurus),
    extraDebtPayment: kurusToLira(month.extraDebtPaymentKurus),
  }));

  return (
    <div className="h-72 min-w-0 overflow-hidden">
      <ResponsiveContainer>
        <LineChart data={data}>
          <defs>
            <linearGradient id="forecastBudgetGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={chartTheme.mint} stopOpacity={0.8} />
              <stop offset="100%" stopColor={chartTheme.amber} stopOpacity={0.95} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
          <Tooltip formatter={formatTooltipValue} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} />
          <Line type="monotone" dataKey="livingBudget" name="Yaşam bütçesi" stroke="url(#forecastBudgetGradient)" strokeWidth={3} dot={false} animationDuration={900} isAnimationActive={!reducedMotion} />
          <Line type="monotone" dataKey="extraDebtPayment" name="Ek borç ödemesi" stroke={chartTheme.amber} strokeWidth={2} dot={false} animationDuration={900} isAnimationActive={!reducedMotion} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
