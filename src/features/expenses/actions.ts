"use server";

import { redirect } from "next/navigation";
import type { FormActionState } from "@/lib/actions/action-state";
import { toErrorState, toSuccessState } from "@/lib/actions/action-state";
import { revalidateFinancePages } from "@/lib/actions/revalidate-finance";
import { createExpense, deleteExpense, updateExpense } from "./repository";
import { deleteExpenseSchema, expenseSchema, updateExpenseSchema } from "./schemas";

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createExpenseAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = expenseSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return toErrorState("Gider kaydı eklenemedi. Lütfen alanları kontrol edin.", parsed.error.flatten().fieldErrors);
  }

  await createExpense(parsed.data);
  revalidateFinancePages();

  return toSuccessState("Gider kaydı eklendi.");
}

export async function updateExpenseAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = updateExpenseSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return toErrorState("Gider kaydı güncellenemedi. Lütfen alanları kontrol edin.", parsed.error.flatten().fieldErrors);
  }

  await updateExpense(parsed.data);
  revalidateFinancePages();

  return toSuccessState("Gider kaydı güncellendi.");
}

export async function deleteExpenseAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = deleteExpenseSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return toErrorState("Gider kaydı silinemedi.");
  }

  await deleteExpense(parsed.data.id);
  revalidateFinancePages();

  redirect("/expenses?notice=expenseDeleted");
}
