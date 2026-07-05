import { beforeEach, describe, expect, it, vi } from "vitest";
import { sampleInterestRateSnapshot } from "./tcmb-provider";

const repositoryMock = vi.hoisted(() => ({
  getLatestInterestRateSnapshotFromDb: vi.fn(),
  saveInterestRateSnapshot: vi.fn(),
}));

vi.mock("./repository", () => repositoryMock);

describe("interest rate service", () => {
  beforeEach(() => {
    repositoryMock.getLatestInterestRateSnapshotFromDb.mockReset();
    repositoryMock.saveInterestRateSnapshot.mockReset();
  });

  it("uses manual interest rate before provider or fallback data", async () => {
    const { resolveDebtInterestRate } = await import("./service");
    const resolved = await resolveDebtInterestRate({
      debtType: "credit_card",
      manualInterestRateMonthly: 3.75,
    });

    expect(resolved.monthlyRate).toBe(3.75);
    expect(resolved.source).toBe("manual");
    expect(repositoryMock.getLatestInterestRateSnapshotFromDb).not.toHaveBeenCalled();
  });

  it("uses fallback credit card contractual rate when cached provider data is missing", async () => {
    repositoryMock.getLatestInterestRateSnapshotFromDb.mockResolvedValue(null);
    const { resolveDebtInterestRate } = await import("./service");
    const resolved = await resolveDebtInterestRate({
      debtType: "credit_card",
      manualInterestRateMonthly: undefined,
    });

    expect(resolved.monthlyRate).toBe(sampleInterestRateSnapshot.maxContractualRate);
    expect(resolved.source).toBe("fallback_contractual");
    expect(resolved.note).toContain("fallback");
  });

  it("does not estimate non-credit-card rates when manual interest is missing", async () => {
    const { resolveDebtInterestRate } = await import("./service");
    const resolved = await resolveDebtInterestRate({
      debtType: "personal_loan",
      manualInterestRateMonthly: undefined,
    });

    expect(resolved.monthlyRate).toBe(0);
    expect(resolved.source).toBe("missing");
    expect(resolved.note).toContain("otomatik faiz tahmini yapılmadı");
  });
});
