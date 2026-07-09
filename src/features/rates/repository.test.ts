import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { mapRateSnapshotToDomain } from "./repository";

describe("rate repository mappers", () => {
  it("maps Decimal-like rate values and retrievedAt timestamps to domain values", () => {
    const snapshot = mapRateSnapshotToDomain({
      source: "tcmb",
      providerStatus: "fresh",
      country: "TR",
      currency: "TRY",
      effectiveDate: "2026-07",
      rateType: "credit_card",
      referenceRate: new Prisma.Decimal(3.11),
      maxContractualRate: new Prisma.Decimal(4.25),
      maxOverdueRate: new Prisma.Decimal(4.55),
      rawSourceUrl: "https://example.invalid/rates",
      retrievedAt: new Date("2026-07-09T12:00:00.000Z"),
      note: null,
    });

    expect(snapshot.referenceRate).toBe(3.11);
    expect(snapshot.maxContractualRate).toBe(4.25);
    expect(snapshot.maxOverdueRate).toBe(4.55);
    expect(snapshot.retrievedAt).toBe("2026-07-09T12:00:00.000Z");
  });

  it("keeps plain number and null rate values stable", () => {
    const snapshot = mapRateSnapshotToDomain({
      source: "fallback_sample",
      providerStatus: "fallback",
      country: "TR",
      currency: "TRY",
      effectiveDate: "Örnek dönem",
      rateType: "credit_card",
      referenceRate: 3.11,
      maxContractualRate: null,
      maxOverdueRate: null,
      rawSourceUrl: "https://example.invalid/rates",
      retrievedAt: new Date("2026-07-09T12:00:00.000Z"),
      note: "Örnek fallback oran.",
    });

    expect(snapshot.referenceRate).toBe(3.11);
    expect(snapshot.maxContractualRate).toBeUndefined();
    expect(snapshot.maxOverdueRate).toBeUndefined();
    expect(snapshot.isStale).toBe(true);
  });
});
