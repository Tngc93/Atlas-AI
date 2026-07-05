"use server";

import { redirect } from "next/navigation";
import type { FormActionState } from "@/lib/actions/action-state";
import { toErrorState, toSuccessState } from "@/lib/actions/action-state";
import { revalidateFinancePages } from "@/lib/actions/revalidate-finance";
import {
  deleteSalaryRecordSchema,
  profileIncomeSchema,
  salaryRecordSchema,
  updateSalaryRecordSchema,
} from "./schemas";
import {
  createSalaryRecord,
  deleteSalaryRecord,
  updateSalaryRecord,
  upsertProfileIncome,
} from "./repository";

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function saveProfileIncomeAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = profileIncomeSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return toErrorState("Gelir bilgileri kaydedilemedi. Lütfen alanları kontrol edin.", parsed.error.flatten().fieldErrors);
  }

  await upsertProfileIncome(parsed.data);
  revalidateFinancePages();

  return toSuccessState("Gelir bilgileri kaydedildi.");
}

export async function createSalaryRecordAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = salaryRecordSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return toErrorState("Maaş geçmişi kaydı eklenemedi. Lütfen alanları kontrol edin.", parsed.error.flatten().fieldErrors);
  }

  await createSalaryRecord(parsed.data);
  revalidateFinancePages();

  return toSuccessState("Maaş geçmişi kaydı eklendi.");
}

export async function updateSalaryRecordAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = updateSalaryRecordSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return toErrorState("Maaş geçmişi kaydı güncellenemedi. Lütfen alanları kontrol edin.", parsed.error.flatten().fieldErrors);
  }

  await updateSalaryRecord(parsed.data);
  revalidateFinancePages();

  return toSuccessState("Maaş geçmişi kaydı güncellendi.");
}

export async function deleteSalaryRecordAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = deleteSalaryRecordSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return toErrorState("Maaş geçmişi kaydı silinemedi.");
  }

  await deleteSalaryRecord(parsed.data.id);
  revalidateFinancePages();

  redirect("/income?notice=salaryRecordDeleted");
}
