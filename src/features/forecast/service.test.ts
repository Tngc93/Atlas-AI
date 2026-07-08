import { describe, expect, it } from "vitest";
import type { FinanceSnapshot } from "@/features/finance/data-service";
import { liraToKurus } from "@/features/finance/money";
import type { DebtAccount, MandatoryExpense, Profile } from "@/features/finance/types";
import { buildForecastReport } from "./service";

const asOfDate = new Date(2026, 6, 4);

function buildSnapshot(overrides: Partial<FinanceSnapshot> = {}): FinanceSnapshot {
  const profile: Profile = {
    id: "forecast-qa-profile",
    currency: "TRY",
    monthlySalaryKurus: liraToKurus(100_000),
    survivalThresholdKurus: liraToKurus(10_000),
  };
  const debts: DebtAccount[] = [
    {
      id: "forecast-card",
      type: "credit_card",
      name: "Örnek Forecast Kart",
      lender: "Örnek Banka",
      balanceKurus: liraToKurus(20_000),
      interestRateMonthly: 4,
      manualInterestRateMonthly: 4,
      interestRateSource: "manual",
      minimumPaymentKurus: liraToKurus(2_000),
      dueDay: 15,
      status: "active",
    },
    {
      id: "forecast-paused-loan",
      type: "loan",
      name: "Örnek Pasif Kredi",
      lender: "Örnek Banka",
      balanceKurus: liraToKurus(80_000),
      interestRateMonthly: 8,
      minimumPaymentKurus: liraToKurus(9_000),
      dueDay: 20,
      status: "paused",
    },
  ];
  const expenses: MandatoryExpense[] = [
    {
      id: "forecast-rent",
      name: "Örnek Forecast Kira",
      category: "rent",
      amountKurus: liraToKurus(30_000),
      dueDay: 1,
      isFixed: true,
    },
    {
      id: "forecast-market",
      name: "Örnek Forecast Market",
      category: "groceries",
      amountKurus: liraToKurus(10_000),
      isFixed: true,
    },
  ];

  return {
    hasProfile: true,
    profile,
    debts,
    expenses,
    ...overrides,
  };
}

describe("forecast service", () => {
  it("builds 3, 6, 12 and 24 month checkpoints from the finance engine projection", () => {
    const report = buildForecastReport(buildSnapshot(), asOfDate);

    expect(report.checkpoints.map((checkpoint) => checkpoint.horizonMonths)).toEqual([3, 6, 12, 24]);
    expect(report.monthlyTrend.length).toBeGreaterThan(0);
    expect(report.totalEstimatedInterestKurus).toBeGreaterThan(0);
  });

  it("excludes paused and paid off debts from projected remaining debt", () => {
    const report = buildForecastReport(buildSnapshot(), asOfDate);

    expect(report.monthlyTrend[0].remainingDebtKurus).toBeLessThan(liraToKurus(80_000));
    expect(report.payoffMilestones.some((milestone) => milestone.debtName === "Örnek Pasif Kredi")).toBe(false);
  });

  it("detects payoff month inside the 24 month horizon", () => {
    const report = buildForecastReport(buildSnapshot(), asOfDate);

    expect(report.estimatedPayoffMonth).toBeTruthy();
    expect(report.payoffOutsideHorizon).toBe(false);
    expect(report.payoffMilestones.map((milestone) => milestone.debtName)).toContain("Örnek Forecast Kart");
  });

  it("marks payoff as outside horizon when debt cannot close within 24 months", () => {
    const snapshot = buildSnapshot({
      profile: {
        id: "forecast-slow-profile",
        currency: "TRY",
        monthlySalaryKurus: liraToKurus(60_000),
        survivalThresholdKurus: liraToKurus(10_000),
      },
      debts: [
        {
          id: "forecast-large-card",
          type: "credit_card",
          name: "Örnek Büyük Kart",
          lender: "Örnek Banka",
          balanceKurus: liraToKurus(500_000),
          interestRateMonthly: 3,
          minimumPaymentKurus: liraToKurus(1_000),
          dueDay: 15,
          status: "active",
        },
      ],
      expenses: [
        {
          id: "forecast-basic-expense",
          name: "Örnek Temel Gider",
          category: "other",
          amountKurus: liraToKurus(45_000),
          isFixed: true,
        },
      ],
    });
    const report = buildForecastReport(snapshot, asOfDate);

    expect(report.estimatedPayoffMonth).toBeNull();
    expect(report.payoffOutsideHorizon).toBe(true);
    expect(report.finalRemainingDebtKurus).toBeGreaterThan(0);
  });

  it("shows high risk warnings and no extra payment when living budget cannot be protected", () => {
    const snapshot = buildSnapshot({
      profile: {
        id: "forecast-risk-profile",
        currency: "TRY",
        monthlySalaryKurus: liraToKurus(53_000),
        survivalThresholdKurus: liraToKurus(15_000),
      },
    });
    const report = buildForecastReport(snapshot, asOfDate);

    expect(report.highestRiskLevel).toBe("high");
    expect(report.riskWarnings.length).toBeGreaterThan(0);
    expect(report.monthlyTrend[0].extraDebtPaymentKurus).toBe(0);
  });

  it("builds safe evidence items without treating fallback interest as a bank rate", () => {
    const report = buildForecastReport(
      buildSnapshot({
        debts: [
          {
            id: "forecast-fallback-card",
            type: "credit_card",
            name: "Örnek Fallback Kart",
            lender: "Örnek Banka",
            balanceKurus: liraToKurus(20_000),
            interestRateMonthly: 4.25,
            interestRateSource: "fallback_sample",
            minimumPaymentKurus: liraToKurus(2_000),
            dueDay: 15,
            status: "active",
          },
        ],
      }),
      asOfDate,
    );

    const interestEvidence = report.evidenceItems.find((item) => item.id === "interest-context");
    const interestAssumption = report.assumptions.find((item) => item.id === "interest-source");

    expect(interestEvidence?.value).toContain("fallback");
    expect(interestEvidence?.detail).toContain("gerçek banka oranı gibi değerlendirilmemelidir");
    expect(interestAssumption?.value).toContain("gerçek banka oranı gibi değerlendirilmemelidir");
  });

  it("adds explainable risk timeline details for high risk months", () => {
    const report = buildForecastReport(
      buildSnapshot({
        profile: {
          id: "forecast-negative-profile",
          currency: "TRY",
          monthlySalaryKurus: liraToKurus(35_000),
          survivalThresholdKurus: liraToKurus(15_000),
        },
      }),
      asOfDate,
    );

    expect(report.riskWarnings[0]).toMatchObject({
      severity: "high",
      message: "Yaşam bütçesi negatife düşüyor.",
      reason: "Zorunlu giderler ve minimum ödemeler sonrası ayı karşılayacak alan kalmıyor.",
    });
    expect(report.riskWarnings[0].reviewSuggestion).toContain("minimum ödemelerin");
  });

  it("suggests safe decision prompts without raw debt or lender details", () => {
    const report = buildForecastReport(buildSnapshot(), asOfDate);
    const promptText = report.decisionPrompts.map((prompt) => `${prompt.title} ${prompt.description}`).join(" ");

    expect(report.decisionPrompts.length).toBeGreaterThan(0);
    expect(promptText).toContain("Ekstra ödeme yaparsam kapanış süresi değişir mi?");
    expect(promptText).not.toContain("Örnek Forecast Kart");
    expect(promptText).not.toContain("Örnek Banka");
  });

  it("creates a minimized forecast narrative context without changing the finance source of truth", () => {
    const report = buildForecastReport(buildSnapshot(), asOfDate);

    expect(report.narrativeContext.uncertaintyNote).toContain("gelir, gider, faiz ve ödeme davranışı değişirse");
    expect(report.narrativeContext.primaryOpportunity).toContain("karar simülatörü");
    expect(["stable", "watch", "strained"]).toContain(report.narrativeContext.status);
  });
});
