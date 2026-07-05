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

function formatTooltipValue(value: unknown): string {
  return `${Number(value ?? 0).toLocaleString("tr-TR")} TL`;
}

export function ForecastDebtTrendChart({ trend }: { trend: ForecastMonthlyTrend[] }) {
  const data = trend.map((month) => ({
    month: month.month,
    remainingDebt: kurusToLira(month.remainingDebtKurus),
    interest: kurusToLira(month.interestKurus),
  }));

  return (
    <div className="h-72 min-w-0 overflow-hidden">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dde2dc" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip formatter={formatTooltipValue} />
          <Line type="monotone" dataKey="remainingDebt" name="Kalan borç" stroke="#4b6b82" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="interest" name="Faiz etkisi" stroke="#c95f4f" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ForecastLivingBudgetChart({ trend }: { trend: ForecastMonthlyTrend[] }) {
  const data = trend.map((month) => ({
    month: month.month,
    livingBudget: kurusToLira(month.livingBudgetKurus),
    extraDebtPayment: kurusToLira(month.extraDebtPaymentKurus),
  }));

  return (
    <div className="h-72 min-w-0 overflow-hidden">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dde2dc" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip formatter={formatTooltipValue} />
          <Line type="monotone" dataKey="livingBudget" name="Yaşam bütçesi" stroke="#2f8f83" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="extraDebtPayment" name="Ek borç ödemesi" stroke="#d2872f" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
