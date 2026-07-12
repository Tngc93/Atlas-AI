import { liraToKurus } from "@/features/finance/money";
import type { FinancialMemorySnapshotRecord } from "@/features/memory/types";
import { sampleDebts, sampleExpenses, sampleProfile } from "@/lib/sample-data/finance";
import type { DemoFinanceState } from "./types";

function memoryRecord(monthOffset: number, debtLira: number, budgetLira: number): FinancialMemorySnapshotRecord {
  const date = new Date();
  date.setUTCDate(15);
  date.setUTCMonth(date.getUTCMonth() + monthOffset);
  const periodMonth = date.toISOString().slice(0, 7);
  const mandatoryExpenseTotalKurus = sampleExpenses.reduce((total, expense) => total + expense.amountKurus, 0);

  return {
    id: `demo-memory-${periodMonth}`,
    periodMonth,
    capturedAt: date,
    createdAt: date,
    updatedAt: date,
    trigger: "manual_refresh",
    salaryKurus: sampleProfile.monthlySalaryKurus,
    mandatoryExpenseTotalKurus,
    minimumDebtPaymentsKurus: liraToKurus(17200),
    survivalBudgetKurus: liraToKurus(budgetLira),
    dailyLimitKurus: liraToKurus(Math.max(0, Math.round(budgetLira / 30))),
    weeklyLimitKurus: liraToKurus(Math.max(0, Math.round((budgetLira / 30) * 7))),
    extraDebtPaymentCapacityKurus: liraToKurus(Math.max(0, budgetLira - 12000)),
    totalDebtKurus: liraToKurus(debtLira),
    activeDebtKurus: liraToKurus(debtLira),
    creditCardDebtKurus: liraToKurus(Math.max(0, debtLira - 18000)),
    activeDebtCount: 3,
    paidOffDebtCount: 0,
    riskLevel: budgetLira < 12000 ? "high" : "medium",
    criticalReasonCount: budgetLira < 0 ? 1 : 0,
    warningCount: 1,
    fallbackRateDebtCount: 1,
    missingRateDebtCount: 0,
    manualRateDebtCount: 2,
    providerRateDebtCount: 0,
    planExtraDebtPaymentKurus: liraToKurus(Math.max(0, budgetLira - 12000)),
    planMinimumPaymentsCovered: true,
    categoryTotals: sampleExpenses.map((expense) => ({
      category: expense.category,
      amountKurus: expense.amountKurus,
      itemCount: 1,
    })),
  };
}

export function createDemoSeed(): DemoFinanceState {
  const now = new Date();
  const effectiveDateIso = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  return structuredClone({
    profile: { ...sampleProfile, salaryDay: 25 },
    salaryRecords: [
      {
        id: "demo-salary-current",
        amountKurus: sampleProfile.monthlySalaryKurus,
        salaryDay: 25,
        effectiveDateIso,
        notes: "Kurgusal demo maaşı",
      },
    ],
    debts: sampleDebts,
    expenses: sampleExpenses,
    memorySnapshots: [memoryRecord(-2, 97000, 9000), memoryRecord(-1, 93000, 10500), memoryRecord(0, 88500, 11000)],
    reminderStates: [],
    revision: 0,
  });
}
