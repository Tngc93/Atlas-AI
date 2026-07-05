import type { InterestRateSnapshot } from "./types";
import { getPrisma } from "@/lib/db/prisma";

function decimalToNumber(value: { toNumber: () => number } | number | null | undefined): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  return typeof value === "number" ? value : value.toNumber();
}

export function mapRateSnapshotToDomain(snapshot: {
  source: string;
  providerStatus: string;
  country: string;
  currency: string;
  effectiveDate: string;
  rateType: string;
  referenceRate: { toNumber: () => number } | number | null;
  maxContractualRate: { toNumber: () => number } | number | null;
  maxOverdueRate: { toNumber: () => number } | number | null;
  rawSourceUrl: string;
  retrievedAt: Date;
  note: string | null;
}): InterestRateSnapshot {
  return {
    source: snapshot.source as InterestRateSnapshot["source"],
    providerStatus: snapshot.providerStatus as InterestRateSnapshot["providerStatus"],
    country: "TR",
    currency: "TRY",
    effectiveDate: snapshot.effectiveDate,
    rateType: "credit_card",
    referenceRate: decimalToNumber(snapshot.referenceRate),
    maxContractualRate: decimalToNumber(snapshot.maxContractualRate),
    maxOverdueRate: decimalToNumber(snapshot.maxOverdueRate),
    rawSourceUrl: snapshot.rawSourceUrl,
    retrievedAt: snapshot.retrievedAt.toISOString(),
    isStale: snapshot.providerStatus !== "fresh",
    note: snapshot.note ?? undefined,
  };
}

export async function saveInterestRateSnapshot(snapshot: InterestRateSnapshot): Promise<InterestRateSnapshot> {
  const saved = await getPrisma().interestRateSnapshot.create({
    data: {
      source: snapshot.source,
      providerStatus: snapshot.providerStatus,
      country: snapshot.country,
      currency: snapshot.currency,
      effectiveDate: snapshot.effectiveDate,
      rateType: snapshot.rateType,
      referenceRate: snapshot.referenceRate,
      maxContractualRate: snapshot.maxContractualRate,
      maxOverdueRate: snapshot.maxOverdueRate,
      rawSourceUrl: snapshot.rawSourceUrl,
      retrievedAt: new Date(snapshot.retrievedAt),
      note: snapshot.note,
    },
  });

  return mapRateSnapshotToDomain(saved);
}

export async function getLatestInterestRateSnapshotFromDb(): Promise<InterestRateSnapshot | null> {
  const snapshot = await getPrisma().interestRateSnapshot.findFirst({
    orderBy: { retrievedAt: "desc" },
  });

  return snapshot ? mapRateSnapshotToDomain(snapshot) : null;
}
