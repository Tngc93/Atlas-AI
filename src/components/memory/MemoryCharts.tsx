"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatTry } from "@/features/finance/money";
import type { MemoryTrendPoint } from "@/features/memory/types";
import { chartLabelStyle, chartTheme, chartTooltipStyle } from "@/components/ui/chartTheme";

function toChartData(trend: MemoryTrendPoint[]) {
  return trend.map((point) => ({
    month: point.periodMonth,
    totalDebt: Math.round(point.totalDebtKurus / 100),
    activeDebt: Math.round(point.activeDebtKurus / 100),
    survivalBudget: Math.round(point.survivalBudgetKurus / 100),
    mandatoryExpenses: Math.round(point.mandatoryExpenseTotalKurus / 100),
  }));
}

export function MemoryDebtTrendChart({ trend }: { trend: MemoryTrendPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={toChartData(trend)} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="memoryDebtGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={chartTheme.mint} stopOpacity={0.75} />
              <stop offset="100%" stopColor={chartTheme.steel} stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
          <YAxis tickFormatter={(value) => `${Number(value).toLocaleString("tr-TR")} TL`} tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
          <Tooltip formatter={(value) => formatTry(Number(value) * 100)} labelFormatter={(label) => `Ay: ${label}`} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} />
          <Legend wrapperStyle={chartLabelStyle} />
          <Line type="monotone" dataKey="totalDebt" name="Toplam borç" stroke="url(#memoryDebtGradient)" strokeWidth={3} dot={false} animationDuration={900} />
          <Line type="monotone" dataKey="activeDebt" name="Aktif borç" stroke={chartTheme.amber} strokeWidth={2} dot={false} animationDuration={900} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MemoryBudgetTrendChart({ trend }: { trend: MemoryTrendPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={toChartData(trend)} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="memoryBudgetGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={chartTheme.mint} stopOpacity={0.9} />
              <stop offset="100%" stopColor={chartTheme.steel} stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
          <YAxis tickFormatter={(value) => `${Number(value).toLocaleString("tr-TR")} TL`} tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
          <Tooltip formatter={(value) => formatTry(Number(value) * 100)} labelFormatter={(label) => `Ay: ${label}`} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} />
          <Legend wrapperStyle={chartLabelStyle} />
          <Line type="monotone" dataKey="survivalBudget" name="Yaşam bütçesi" stroke="url(#memoryBudgetGradient)" strokeWidth={3} dot={false} animationDuration={900} />
          <Line type="monotone" dataKey="mandatoryExpenses" name="Zorunlu gider" stroke={chartTheme.steel} strokeWidth={2} dot={false} animationDuration={900} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
