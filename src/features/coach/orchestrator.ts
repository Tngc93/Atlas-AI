import "server-only";

import { createHash } from "node:crypto";
import type { MonthlyFinancePlan } from "@/features/finance/types";
import type { InterestRateSnapshot } from "@/features/rates/types";
import { coachInsightSchema, type AIProviderName, type CoachInputSummary, type CoachInsight } from "./types";
import { geminiProvider } from "./providers/gemini-provider";
import { mockProvider } from "./providers/mock-provider";
import { openAIProvider } from "./providers/openai-provider";
import type { AIProvider } from "./providers/types";

function parseProviderName(value: string | undefined): AIProviderName {
  if (value === "openai" || value === "gemini" || value === "mock") {
    return value;
  }

  return "mock";
}

export function selectAIProvider(): AIProvider {
  const providerName = parseProviderName(process.env.AI_PROVIDER);

  if (providerName === "openai") {
    return openAIProvider;
  }

  if (providerName === "gemini") {
    return geminiProvider;
  }

  return mockProvider;
}

function bandAmount(valueKurus: number): CoachInputSummary["salaryBand"] {
  if (valueKurus <= 0) {
    return "none";
  }

  if (valueKurus < 40_000_00) {
    return "low";
  }

  if (valueKurus < 120_000_00) {
    return "medium";
  }

  return "high";
}

function bandDailyLimit(valueKurus: number): CoachInputSummary["dailyLimitBand"] {
  if (valueKurus <= 0) {
    return "none";
  }

  if (valueKurus < 500_00) {
    return "tight";
  }

  if (valueKurus < 1_500_00) {
    return "moderate";
  }

  return "comfortable";
}

function bandRate(value: number): CoachInputSummary["topDebtRateBand"] {
  if (value <= 0) {
    return "none";
  }

  if (value < 2) {
    return "low";
  }

  if (value < 4) {
    return "medium";
  }

  return "high";
}

export function buildCoachInputSummary(
  monthlyPlan: MonthlyFinancePlan,
  rateSnapshot: InterestRateSnapshot,
): CoachInputSummary {
  const salaryKurus = monthlyPlan.cashFlow.salaryKurus;
  const activeDebts = monthlyPlan.debtPriorities;
  const topDebtRate = activeDebts[0]?.interestRateMonthly ?? 0;

  return {
    month: monthlyPlan.monthLabel,
    riskLevel: monthlyPlan.riskLevel,
    salaryBand: bandAmount(salaryKurus),
    mandatoryExpenseShare: salaryKurus > 0 ? monthlyPlan.cashFlow.mandatoryExpenseTotalKurus / salaryKurus : 0,
    minimumPaymentShare: salaryKurus > 0 ? monthlyPlan.cashFlow.minimumDebtPaymentsKurus / salaryKurus : 0,
    survivalBudgetDirection:
      monthlyPlan.livingBudget.remainingForMonthKurus < 0
        ? "negative"
        : monthlyPlan.livingBudget.remainingForMonthKurus < monthlyPlan.cashFlow.emergencyBufferKurus
          ? "thin"
          : "stable",
    dailyLimitBand: bandDailyLimit(monthlyPlan.livingBudget.dailyLimitKurus),
    activeDebtCount: activeDebts.length,
    highInterestDebtCount: activeDebts.filter((debt) => debt.interestRateMonthly >= 4).length,
    topDebtRateBand: bandRate(topDebtRate),
    warningCount: monthlyPlan.warnings.length,
    criticalReasonCount: monthlyPlan.criticalReasons.length,
    actionTitles: monthlyPlan.actionPlan.slice(0, 3).map((action) => action.title),
    rateContext: {
      source: rateSnapshot.source,
      providerStatus: rateSnapshot.providerStatus,
      isFallback: rateSnapshot.providerStatus === "fallback" || rateSnapshot.source === "fallback",
    },
  };
}

export function hashCoachInputSummary(input: CoachInputSummary): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function isWithinCostControls(input: CoachInputSummary, provider: AIProvider): boolean {
  const maxSummaryChars = Number(process.env.AI_MAX_INPUT_SUMMARY_CHARS ?? "4000");
  const dailyLimit = Number(process.env.AI_DAILY_REQUEST_LIMIT ?? "20");
  const monthlyBudgetLimitTry = Number(process.env.AI_MONTHLY_BUDGET_LIMIT_TRY ?? "100");
  const usage = provider.estimateUsage(input);

  return JSON.stringify(input).length <= maxSummaryChars && dailyLimit > 0 && monthlyBudgetLimitTry >= 0 && usage.estimatedCostKurus <= monthlyBudgetLimitTry * 100;
}

export async function generateCoachInsight(input: CoachInputSummary): Promise<CoachInsight> {
  const selectedProvider = selectAIProvider();
  const provider = selectedProvider.name === "mock" || isWithinCostControls(input, selectedProvider) ? selectedProvider : mockProvider;

  try {
    const insight = await provider.generateCoachInsight(input);
    return coachInsightSchema.parse(insight);
  } catch {
    return mockProvider.generateCoachInsight(input);
  }
}
