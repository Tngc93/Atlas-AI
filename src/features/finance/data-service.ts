import { buildMonthlyFinancePlan } from "./calculations";
import { emptyProfile, mapDebtToDomain, mapExpenseToDomain, mapProfileToDomain } from "./mappers";
import type { MonthlyFinancePlan } from "./types";
import { listDebts } from "@/features/debts/repository";
import { listExpenses } from "@/features/expenses/repository";
import { getProfile } from "@/features/income/repository";

export type FinanceSnapshot = {
  hasProfile: boolean;
  profile: ReturnType<typeof mapProfileToDomain>;
  debts: ReturnType<typeof mapDebtToDomain>[];
  expenses: ReturnType<typeof mapExpenseToDomain>[];
};

export type FinancePlanSnapshot = FinanceSnapshot & {
  monthlyPlan: MonthlyFinancePlan;
};

export async function getFinanceSnapshot(): Promise<FinanceSnapshot> {
  const [profileRecord, debtRecords, expenseRecords] = await Promise.all([getProfile(), listDebts(), listExpenses()]);

  return {
    hasProfile: Boolean(profileRecord),
    profile: profileRecord ? mapProfileToDomain(profileRecord) : emptyProfile,
    debts: debtRecords.map(mapDebtToDomain),
    expenses: expenseRecords.map(mapExpenseToDomain),
  };
}

export async function getMonthlyFinancePlanSnapshot(horizonMonths = 12): Promise<FinancePlanSnapshot> {
  const snapshot = await getFinanceSnapshot();
  const monthlyPlan = buildMonthlyFinancePlan(snapshot.profile, snapshot.debts, snapshot.expenses, { horizonMonths });

  return {
    ...snapshot,
    monthlyPlan,
  };
}
