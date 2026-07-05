import { getPrisma } from "@/lib/db/prisma";
import type { DebtInput, UpdateDebtInput } from "./schemas";
import { resolveDebtInterestRate } from "@/features/rates/service";

export async function listDebts() {
  return getPrisma().debtAccount.findMany({
    orderBy: [{ status: "asc" }, { dueDay: "asc" }, { createdAt: "desc" }],
  });
}

export async function createDebt(input: DebtInput) {
  const { interestRateMonthly, ...data } = input;
  const resolvedRate = await resolveDebtInterestRate({
    debtType: input.type,
    manualInterestRateMonthly: interestRateMonthly,
  });

  return getPrisma().debtAccount.create({
    data: {
      ...data,
      manualInterestRateMonthly: interestRateMonthly,
      interestRateMonthly: resolvedRate.monthlyRate,
      resolvedInterestRateMonthly: resolvedRate.monthlyRate,
      interestRateSource: resolvedRate.source,
      interestRateResolvedAt: new Date(resolvedRate.resolvedAt),
      interestRateNote: resolvedRate.note,
    },
  });
}

export async function updateDebt(input: UpdateDebtInput) {
  const { id, interestRateMonthly, ...data } = input;
  const resolvedRate = await resolveDebtInterestRate({
    debtType: input.type,
    manualInterestRateMonthly: interestRateMonthly,
  });

  return getPrisma().debtAccount.update({
    where: { id },
    data: {
      ...data,
      manualInterestRateMonthly: interestRateMonthly,
      interestRateMonthly: resolvedRate.monthlyRate,
      resolvedInterestRateMonthly: resolvedRate.monthlyRate,
      interestRateSource: resolvedRate.source,
      interestRateResolvedAt: new Date(resolvedRate.resolvedAt),
      interestRateNote: resolvedRate.note,
    },
  });
}

export async function deleteDebt(id: string) {
  return getPrisma().debtAccount.delete({
    where: { id },
  });
}
