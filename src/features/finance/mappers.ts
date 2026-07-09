import type {
  DebtAccount as PrismaDebtAccount,
  MandatoryExpense as PrismaMandatoryExpense,
  Profile as PrismaProfile,
} from "@prisma/client";
import type { DebtAccount, DebtType, MandatoryExpense, Profile } from "./types";

export const emptyProfile: Profile = {
  id: "empty-local-profile",
  currency: "TRY",
  monthlySalaryKurus: 0,
  survivalThresholdKurus: 0,
  salaryDay: undefined,
};

function mapDebtType(type: PrismaDebtAccount["type"]): DebtType {
  if (type === "credit_card") {
    return "credit_card";
  }

  if (type === "personal_loan") {
    return "loan";
  }

  return "other";
}

export function mapProfileToDomain(profile: PrismaProfile | null): Profile {
  if (!profile) {
    return emptyProfile;
  }

  return {
    id: profile.id,
    currency: "TRY",
    monthlySalaryKurus: profile.monthlySalaryKurus,
    survivalThresholdKurus: profile.survivalThresholdKurus,
    salaryDay: profile.salaryDay ?? undefined,
  };
}

export function mapDebtToDomain(debt: PrismaDebtAccount): DebtAccount {
  return {
    id: debt.id,
    type: mapDebtType(debt.type),
    name: debt.name,
    lender: debt.lender,
    balanceKurus: debt.balanceKurus,
    creditLimitKurus: debt.creditLimitKurus ?? undefined,
    interestRateMonthly: debt.resolvedInterestRateMonthly.toNumber(),
    interestRateAnnual: debt.interestRateAnnual?.toNumber(),
    manualInterestRateMonthly: debt.manualInterestRateMonthly?.toNumber(),
    resolvedInterestRateMonthly: debt.resolvedInterestRateMonthly.toNumber(),
    interestRateSource: debt.interestRateSource,
    interestRateResolvedAt: debt.interestRateResolvedAt?.toISOString(),
    interestRateNote: debt.interestRateNote ?? undefined,
    minimumPaymentKurus: debt.minimumPaymentKurus,
    dueDay: debt.dueDay,
    statementDay: debt.statementDay ?? undefined,
    installmentCount: debt.installmentCount ?? undefined,
    remainingInstallments: debt.remainingInstallments ?? undefined,
    status: debt.status,
  };
}

export function mapExpenseToDomain(expense: PrismaMandatoryExpense): MandatoryExpense {
  return {
    id: expense.id,
    name: expense.name,
    category: expense.category,
    amountKurus: expense.amountKurus,
    dueDay: expense.dueDay ?? undefined,
    isFixed: expense.isFixed,
    notes: expense.notes ?? undefined,
  };
}
