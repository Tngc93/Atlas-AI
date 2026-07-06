"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatTry } from "@/features/finance/money";
import type { MemoryTrendPoint } from "@/features/memory/types";

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
          <CartesianGrid strokeDasharray="3 3" stroke="#d8ded8" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickFormatter={(value) => `${Number(value).toLocaleString("tr-TR")} TL`} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip formatter={(value) => formatTry(Number(value) * 100)} labelFormatter={(label) => `Ay: ${label}`} />
          <Legend />
          <Line type="monotone" dataKey="totalDebt" name="Toplam borç" stroke="#0f766e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="activeDebt" name="Aktif borç" stroke="#b45309" strokeWidth={2} dot={false} />
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
          <CartesianGrid strokeDasharray="3 3" stroke="#d8ded8" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickFormatter={(value) => `${Number(value).toLocaleString("tr-TR")} TL`} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip formatter={(value) => formatTry(Number(value) * 100)} labelFormatter={(label) => `Ay: ${label}`} />
          <Legend />
          <Line type="monotone" dataKey="survivalBudget" name="Yaşam bütçesi" stroke="#0f766e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="mandatoryExpenses" name="Zorunlu gider" stroke="#1d4ed8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
