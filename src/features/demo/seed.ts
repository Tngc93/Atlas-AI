import { liraToKurus } from "@/features/finance/money";
import type { DebtAccount, MandatoryExpense, Profile } from "@/features/finance/types";
import type { FinancialMemorySnapshotRecord } from "@/features/memory/types";
import type { DemoFinanceState } from "./types";

export const DEMO_MONTHLY_SALARY_KURUS = liraToKurus(150_000);

const demoProfile: Profile = {
  id: "demo-profile",
  currency: "TRY",
  monthlySalaryKurus: DEMO_MONTHLY_SALARY_KURUS,
  survivalThresholdKurus: liraToKurus(12_000),
};

const demoDebts: DebtAccount[] = [
  {
    id: "demo-card-grocery",
    type: "credit_card",
    name: "Fictional Grocery Card",
    lender: "Example Bank",
    balanceKurus: liraToKurus(42_000),
    creditLimitKurus: liraToKurus(90_000),
    interestRateMonthly: 4.25,
    interestRateAnnual: 64.8,
    minimumPaymentKurus: liraToKurus(8_500),
    dueDay: 12,
    statementDay: 2,
    status: "active",
  },
  {
    id: "demo-card-travel",
    type: "credit_card",
    name: "Fictional Travel Card",
    lender: "Demo Finance",
    balanceKurus: liraToKurus(28_500),
    creditLimitKurus: liraToKurus(65_000),
    interestRateMonthly: 3.89,
    interestRateAnnual: 58.1,
    minimumPaymentKurus: liraToKurus(5_700),
    dueDay: 20,
    statementDay: 10,
    status: "active",
  },
  {
    id: "demo-installment-phone",
    type: "installment",
    name: "Fictional Phone Installment",
    lender: "Technology Store",
    balanceKurus: liraToKurus(18_000),
    interestRateMonthly: 0,
    minimumPaymentKurus: liraToKurus(3_000),
    dueDay: 5,
    installmentCount: 12,
    remainingInstallments: 6,
    status: "active",
  },
];

const demoExpenses: MandatoryExpense[] = [
  {
    id: "demo-rent",
    name: "Fictional Rent",
    category: "Housing",
    amountKurus: liraToKurus(25_000),
    dueDay: 1,
    isFixed: true,
  },
  {
    id: "demo-utilities",
    name: "Fictional Utilities",
    category: "Utilities",
    amountKurus: liraToKurus(6_500),
    dueDay: 15,
    isFixed: false,
  },
  {
    id: "demo-food",
    name: "Fictional Groceries",
    category: "Living Costs",
    amountKurus: liraToKurus(14_000),
    isFixed: false,
  },
  {
    id: "demo-transport",
    name: "Fictional Transport",
    category: "Transport",
    amountKurus: liraToKurus(4_500),
    isFixed: false,
  },
];

function memoryRecord(monthOffset: number, debtLira: number, budgetLira: number): FinancialMemorySnapshotRecord {
  const date = new Date();
  date.setUTCDate(15);
  date.setUTCMonth(date.getUTCMonth() + monthOffset);
  const periodMonth = date.toISOString().slice(0, 7);
  const mandatoryExpenseTotalKurus = demoExpenses.reduce((total, expense) => total + expense.amountKurus, 0);

  return {
    id: `demo-memory-${periodMonth}`,
    periodMonth,
    capturedAt: date,
    createdAt: date,
    updatedAt: date,
    trigger: "manual_refresh",
    salaryKurus: demoProfile.monthlySalaryKurus,
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
    categoryTotals: demoExpenses.map((expense) => ({
      category: expense.category,
      amountKurus: expense.amountKurus,
      itemCount: 1,
    })),
  };
}

export function createDemoSeed(): DemoFinanceState {
  const now = new Date();
  const demoSalaryDay = Math.min(28, now.getUTCDate());
  const effectiveDateIso = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  return structuredClone({
    profile: { ...demoProfile, salaryDay: demoSalaryDay },
    salaryRecords: [
      {
        id: "demo-salary-current",
        amountKurus: demoProfile.monthlySalaryKurus,
        salaryDay: demoSalaryDay,
        effectiveDateIso,
        notes: "Fictional demo salary",
      },
    ],
    debts: demoDebts,
    expenses: demoExpenses,
    memorySnapshots: [memoryRecord(-2, 97_000, 76_000), memoryRecord(-1, 93_000, 79_000), memoryRecord(0, 88_500, 82_800)],
    reminderStates: [],
    revision: 0,
  });
}
