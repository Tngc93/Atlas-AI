"use server";

import { redirect } from "next/navigation";
import type { FormActionState } from "@/lib/actions/action-state";
import { toErrorState, toSuccessState } from "@/lib/actions/action-state";
import { revalidateFinancePages } from "@/lib/actions/revalidate-finance";
import { recordFinancialMemoryAfterFinanceMutation } from "@/features/memory/actions";
import { createDebt, deleteDebt, updateDebt } from "./repository";
import { debtSchema, deleteDebtSchema, updateDebtSchema } from "./schemas";

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createDebtAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = debtSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return toErrorState("Borç kaydı eklenemedi. Lütfen alanları kontrol edin.", parsed.error.flatten().fieldErrors);
  }

  await createDebt(parsed.data);
  await recordFinancialMemoryAfterFinanceMutation("debt_changed");
  revalidateFinancePages();

  return toSuccessState("Borç kaydı eklendi.");
}

export async function updateDebtAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = updateDebtSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return toErrorState("Borç kaydı güncellenemedi. Lütfen alanları kontrol edin.", parsed.error.flatten().fieldErrors);
  }

  await updateDebt(parsed.data);
  await recordFinancialMemoryAfterFinanceMutation("debt_changed");
  revalidateFinancePages();

  return toSuccessState("Borç kaydı güncellendi.");
}

export async function deleteDebtAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = deleteDebtSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return toErrorState("Borç kaydı silinemedi.");
  }

  await deleteDebt(parsed.data.id);
  await recordFinancialMemoryAfterFinanceMutation("debt_changed");
  revalidateFinancePages();

  redirect("/debts?notice=debtDeleted");
}
