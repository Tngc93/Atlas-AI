"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import { kurusToLira } from "@/features/finance/money";
import type { PaymentPlanMonth, SalaryAllocation } from "@/features/finance/types";
import { trCopy } from "@/lib/copy/tr";
import { chartLabelStyle, chartTheme, chartTooltipStyle } from "@/components/ui/chartTheme";

function formatTooltipValue(value: unknown): string {
  return `${Number(value ?? 0).toLocaleString("tr-TR")} TL`;
}

export function SalaryWaterfall({ allocation }: { allocation: SalaryAllocation }) {
  const data = [
    { name: trCopy.charts.income, amount: kurusToLira(allocation.salaryKurus) },
    { name: trCopy.charts.expenses, amount: -kurusToLira(allocation.mandatoryExpenseTotalKurus) },
    { name: trCopy.charts.minimums, amount: -kurusToLira(allocation.minimumDebtPaymentsKurus) },
    { name: trCopy.charts.extraDebt, amount: -kurusToLira(allocation.extraDebtPaymentKurus) },
    { name: trCopy.charts.buffer, amount: kurusToLira(allocation.emergencyBufferKurus) },
  ];

  return (
    <div className="h-72 min-w-0 overflow-hidden">
      <ResponsiveContainer>
        <BarChart data={data}>
          <defs>
            <linearGradient id="salaryBarGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={chartTheme.mint} stopOpacity={0.95} />
              <stop offset="100%" stopColor={chartTheme.steel} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
          <Tooltip formatter={formatTooltipValue} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} />
          <Bar dataKey="amount" fill="url(#salaryBarGradient)" radius={[8, 8, 0, 0]} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PayoffRoadmapChart({ months }: { months: PaymentPlanMonth[] }) {
  const data = months.map((month) => ({
    month: month.month,
    remaining: kurusToLira(month.debtProjections.reduce((total, debt) => total + debt.endingBalanceKurus, 0)),
    interest: kurusToLira(month.debtProjections.reduce((total, debt) => total + debt.interestChargedKurus, 0)),
  }));

  return (
    <div className="h-72 min-w-0 overflow-hidden">
      <ResponsiveContainer>
        <LineChart data={data}>
          <defs>
            <linearGradient id="payoffRemainingGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={chartTheme.steel} stopOpacity={0.75} />
              <stop offset="100%" stopColor={chartTheme.mint} stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} tick={chartLabelStyle} />
          <Tooltip formatter={formatTooltipValue} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} />
          <Line type="monotone" dataKey="remaining" name="Kalan borç" stroke="url(#payoffRemainingGradient)" strokeWidth={3} dot={false} animationDuration={900} />
          <Line type="monotone" dataKey="interest" name="Faiz etkisi" stroke={chartTheme.coral} strokeWidth={2} dot={false} animationDuration={900} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
