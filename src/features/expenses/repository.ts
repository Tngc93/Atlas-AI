import { getPrisma } from "@/lib/db/prisma";
import type { ExpenseInput, UpdateExpenseInput } from "./schemas";

export async function listExpenses() {
  return getPrisma().mandatoryExpense.findMany({
    orderBy: [{ dueDay: "asc" }, { createdAt: "desc" }],
  });
}

export async function createExpense(input: ExpenseInput) {
  return getPrisma().mandatoryExpense.create({
    data: input,
  });
}

export async function updateExpense(input: UpdateExpenseInput) {
  const { id, ...data } = input;

  return getPrisma().mandatoryExpense.update({
    where: { id },
    data,
  });
}

export async function deleteExpense(id: string) {
  return getPrisma().mandatoryExpense.delete({
    where: { id },
  });
}
