"use server";

import type { FormActionState } from "@/lib/actions/action-state";
import { toErrorState } from "@/lib/actions/action-state";
import { getFinanceSnapshot } from "@/features/finance/data-service";
import { forecastScenarioSchema } from "./scenario-schema";
import { simulateForecastScenario } from "./scenario-engine";
import type { ForecastScenarioResult } from "./types";

export type ForecastScenarioActionState = FormActionState & {
  result?: ForecastScenarioResult;
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function simulateForecastScenarioAction(
  _previousState: ForecastScenarioActionState,
  formData: FormData,
): Promise<ForecastScenarioActionState> {
  const parsed = forecastScenarioSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return toErrorState("Senaryo karşılaştırılamadı. Lütfen alanları kontrol edin.", parsed.error.flatten().fieldErrors);
  }

  const snapshot = await getFinanceSnapshot();
  const activeDebts = snapshot.debts.filter((debt) => debt.status === "active" && debt.balanceKurus > 0);

  if (parsed.data.type === "extra_debt_payment" && activeDebts.length === 0) {
    return toErrorState("Ek borç ödemesi senaryosu için önce aktif borç kaydı gerekir.");
  }

  if (["expense_decrease", "expense_increase"].includes(parsed.data.type) && snapshot.expenses.length === 0) {
    return toErrorState("Gider senaryosu için önce en az bir zorunlu gider kaydı gerekir.");
  }

  return {
    status: "success",
    message: "Geçici senaryo karşılaştırıldı. Mevcut verileriniz değişmedi.",
    result: simulateForecastScenario(snapshot, parsed.data),
  };
}
