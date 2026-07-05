import { sampleInterestRateSnapshot } from "./tcmb-provider";
import type { InterestRateProvider, InterestRateSnapshot, ResolvedInterestRate } from "./types";
import { getLatestInterestRateSnapshotFromDb, saveInterestRateSnapshot } from "./repository";

const CREDIT_CARD_DB_TYPE = "credit_card";

function snapshotStatus(snapshot: InterestRateSnapshot): "tcmb" | "cached" | "fallback" {
  if (snapshot.source === "TCMB" && snapshot.providerStatus === "fresh" && !snapshot.isStale) {
    return "tcmb";
  }

  if (snapshot.source === "TCMB" || snapshot.providerStatus === "cached" || snapshot.providerStatus === "stale") {
    return "cached";
  }

  return "fallback";
}

export async function refreshInterestRates(provider: InterestRateProvider): Promise<InterestRateSnapshot> {
  const snapshot = await provider.fetchLatest();
  return saveInterestRateSnapshot(snapshot);
}

export async function getLatestInterestRateSnapshot(): Promise<InterestRateSnapshot> {
  const cached = await getLatestInterestRateSnapshotFromDb();

  if (!cached) {
    return sampleInterestRateSnapshot;
  }

  return {
    ...cached,
    providerStatus: cached.providerStatus === "fresh" ? "cached" : cached.providerStatus,
    isStale: cached.providerStatus !== "fresh",
  };
}

export async function resolveDebtInterestRate({
  debtType,
  manualInterestRateMonthly,
  useOverdueRate = false,
}: {
  debtType: string;
  manualInterestRateMonthly?: number | null;
  useOverdueRate?: boolean;
}): Promise<ResolvedInterestRate> {
  const resolvedAt = new Date().toISOString();

  if (typeof manualInterestRateMonthly === "number" && manualInterestRateMonthly > 0) {
    return {
      monthlyRate: manualInterestRateMonthly,
      source: "manual",
      resolvedAt,
      note: "Manuel faiz oranı kullanıldı.",
    };
  }

  if (debtType !== CREDIT_CARD_DB_TYPE) {
    return {
      monthlyRate: 0,
      source: "missing",
      resolvedAt,
      note: "Bu borç türü için otomatik faiz tahmini yapılmadı. Manuel faiz girilmediği için 0% kullanıldı.",
    };
  }

  const snapshot = await getLatestInterestRateSnapshot();
  const monthlyRate = useOverdueRate ? snapshot.maxOverdueRate : snapshot.maxContractualRate;
  const status = snapshotStatus(snapshot);
  const source =
    status === "tcmb"
      ? useOverdueRate
        ? "tcmb_overdue"
        : "tcmb_contractual"
      : status === "cached"
        ? useOverdueRate
          ? "cached_overdue"
          : "cached_contractual"
        : useOverdueRate
          ? "fallback_overdue"
          : "fallback_contractual";

  return {
    monthlyRate: typeof monthlyRate === "number" ? monthlyRate : 0,
    source,
    resolvedAt,
    snapshot,
    note:
      status === "fallback"
        ? "Güvenli örnek/fallback oran kullanıldı; gerçek banka oranı gibi değerlendirilmemelidir."
        : "Kredi kartı için güncel faiz sağlayıcısı bağlamı kullanıldı.",
  };
}
