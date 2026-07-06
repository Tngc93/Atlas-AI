"use server";

import { redirect } from "next/navigation";
import type { FormActionState } from "@/lib/actions/action-state";
import { toErrorState, toSuccessState } from "@/lib/actions/action-state";
import { revalidateFinancePages } from "@/lib/actions/revalidate-finance";
import { getFinanceSnapshot } from "@/features/finance/data-service";
import { buildCurrentMemorySnapshotInput } from "./service";
import { upsertMemorySnapshot } from "./repository";
import type { FinancialMemoryTrigger } from "./types";

export async function recordFinancialMemoryAfterFinanceMutation(trigger: FinancialMemoryTrigger): Promise<void> {
  try {
    const snapshot = await getFinanceSnapshot();
    const input = buildCurrentMemorySnapshotInput(snapshot, trigger);
    await upsertMemorySnapshot(input);
  } catch {
    // Memory capture is best-effort; finance CRUD success must not depend on it.
  }
}

export async function refreshFinancialMemoryAction(): Promise<FormActionState> {
  try {
    const snapshot = await getFinanceSnapshot();
    const input = buildCurrentMemorySnapshotInput(snapshot, "manual_refresh");
    await upsertMemorySnapshot(input);
    revalidateFinancePages();
    return toSuccessState("Finansal hafıza güncellendi.");
  } catch {
    return toErrorState("Finansal hafıza güncellenemedi. Lütfen kayıtlarınızı kontrol edip tekrar deneyin.");
  }
}

export async function refreshFinancialMemoryAndRedirectAction(): Promise<void> {
  const result = await refreshFinancialMemoryAction();
  const notice = result.status === "success" ? "memoryUpdated" : "memoryError";

  redirect(`/memory?notice=${notice}`);
}
