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
          <CartesianGrid strokeDasharray="3 3" stroke="#dde2dc" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip formatter={formatTooltipValue} />
          <Bar dataKey="amount" fill="#2f8f83" radius={[6, 6, 0, 0]} />
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
          <CartesianGrid strokeDasharray="3 3" stroke="#dde2dc" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip formatter={formatTooltipValue} />
          <Line type="monotone" dataKey="remaining" stroke="#4b6b82" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="interest" stroke="#c95f4f" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
