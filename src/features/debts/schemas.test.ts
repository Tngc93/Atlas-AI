import { describe, expect, it } from "vitest";
import { debtSchema } from "./schemas";

describe("debt validation schema", () => {
  const validDebt = {
    type: "credit_card",
    lender: "Örnek Banka",
    name: "Örnek Kart",
    totalDebtKurus: "10.000,50",
    balanceKurus: "8.000,25",
    creditLimitKurus: "20.000,75",
    interestRateMonthly: "4.25",
    minimumPaymentKurus: "1.000,10",
    dueDay: "15",
    statementDay: "5",
    installmentCount: "",
    remainingInstallments: "",
    status: "active",
  };

  it("converts TL form amounts to integer kurus", () => {
    const parsed = debtSchema.parse(validDebt);

    expect(parsed.totalDebtKurus).toBe(1_000_050);
    expect(parsed.balanceKurus).toBe(800_025);
    expect(parsed.minimumPaymentKurus).toBe(100_010);
  });

  it("allows manual interest to be empty so provider fallback can resolve it", () => {
    const parsed = debtSchema.parse({
      ...validDebt,
      interestRateMonthly: "",
    });

    expect(parsed.interestRateMonthly).toBeUndefined();
  });

  it("rejects remaining debt above total debt", () => {
    const parsed = debtSchema.safeParse({
      ...validDebt,
      balanceKurus: "12000",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.balanceKurus?.[0]).toBe("Kalan borç toplam borçtan büyük olamaz.");
  });

  it("rejects minimum payment above remaining debt", () => {
    const parsed = debtSchema.safeParse({
      ...validDebt,
      minimumPaymentKurus: "9000",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.minimumPaymentKurus?.[0]).toBe(
      "Minimum ödeme kalan borçtan büyük olamaz.",
    );
  });
});
