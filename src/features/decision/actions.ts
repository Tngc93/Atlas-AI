"use server";

import type { FormActionState } from "@/lib/actions/action-state";
import { toErrorState } from "@/lib/actions/action-state";
import { getFinanceSnapshot } from "@/features/finance/data-service";
import { decisionScenarioSchema } from "./schemas";
import { simulateDecisionScenario } from "./service";
import type { DecisionScenarioResult } from "./types";

export type DecisionActionState = FormActionState & {
  result?: DecisionScenarioResult;
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function simulateDecisionScenarioAction(
  _previousState: DecisionActionState,
  formData: FormData,
): Promise<DecisionActionState> {
  const parsed = decisionScenarioSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return toErrorState("Senaryo hesaplanamadı. Lütfen alanları kontrol edin.", parsed.error.flatten().fieldErrors);
  }

  const snapshot = await getFinanceSnapshot();
  const activeDebts = snapshot.debts.filter((debt) => debt.status === "active" && debt.balanceKurus > 0);

  if (
    ["extra_debt_payment", "specific_debt_payment", "no_extra_payment"].includes(parsed.data.type) &&
    activeDebts.length === 0
  ) {
    return toErrorState("Bu senaryo için en az bir aktif borç kaydı gerekir.");
  }

  if (parsed.data.type === "specific_debt_payment") {
    const hasSelectedActiveDebt = activeDebts.some((debt) => debt.id === parsed.data.debtAccountId);

    if (!hasSelectedActiveDebt) {
      return toErrorState("Seçilen aktif borç bulunamadı. Lütfen borç listesini yenileyip tekrar deneyin.", {
        debtAccountId: ["Aktif bir borç seçilmelidir."],
      });
    }
  }

  if (parsed.data.type === "reduce_expenses_percent" && snapshot.expenses.length === 0) {
    return toErrorState("Gider azaltma senaryosu için önce en az bir zorunlu gider kaydı eklenmelidir.");
  }

  return {
    status: "success",
    message: "Senaryo hesaplandı. Bu sonuç finansal karar desteğidir; kesin finansal tavsiye değildir.",
    result: simulateDecisionScenario(snapshot, parsed.data),
  };
}
