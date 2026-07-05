import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { mapDebtToDomain, mapExpenseToDomain, mapProfileToDomain } from "./mappers";

describe("finance prisma mappers", () => {
  it("maps missing profile to an empty local profile without storing mock data", () => {
    const profile = mapProfileToDomain(null);

    expect(profile.monthlySalaryKurus).toBe(0);
    expect(profile.currency).toBe("TRY");
  });

  it("maps Prisma debt records to calculation engine debt records", () => {
    const debt = mapDebtToDomain({
      id: "debt-1",
      type: "personal_loan",
      name: "Örnek İhtiyaç Kredisi",
      lender: "Örnek Banka",
      totalDebtKurus: 100_000_00,
      balanceKurus: 80_000_00,
      creditLimitKurus: null,
      interestRateMonthly: new Prisma.Decimal(3.5),
      interestRateAnnual: null,
      manualInterestRateMonthly: new Prisma.Decimal(3.5),
      resolvedInterestRateMonthly: new Prisma.Decimal(3.5),
      interestRateSource: "manual",
      interestRateResolvedAt: new Date("2026-07-01"),
      interestRateNote: "Manuel faiz oranı kullanıldı.",
      minimumPaymentKurus: 5_000_00,
      dueDay: 12,
      statementDay: null,
      lastPaymentDate: null,
      isMinimumPaymentPaidThisMonth: false,
      priorityOverride: null,
      graceDays: null,
      paymentStatus: null,
      installmentCount: 12,
      remainingInstallments: 8,
      status: "active",
      createdAt: new Date("2026-07-01"),
      updatedAt: new Date("2026-07-01"),
    });

    expect(debt.type).toBe("loan");
    expect(debt.interestRateMonthly).toBe(3.5);
    expect(debt.interestRateSource).toBe("manual");
    expect(debt.remainingInstallments).toBe(8);
  });

  it("maps Prisma expense records to calculation engine expense records", () => {
    const expense = mapExpenseToDomain({
      id: "expense-1",
      name: "Örnek Kira",
      category: "rent",
      amountKurus: 25_000_00,
      dueDay: 1,
      isFixed: true,
      isPaidThisMonth: false,
      priority: null,
      notes: null,
      createdAt: new Date("2026-07-01"),
      updatedAt: new Date("2026-07-01"),
    });

    expect(expense.name).toBe("Örnek Kira");
    expect(expense.amountKurus).toBe(25_000_00);
  });
});
