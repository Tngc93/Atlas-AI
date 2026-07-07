import { z } from "zod";

export const coachInsightSchema = z.object({
  summary: z.string(),
  riskExplanation: z.string(),
  recommendedActions: z.array(z.string()).min(1).max(5),
  questionsToReview: z.array(z.string()).min(1).max(5),
  sections: z.object({
    financialStatus: z.object({
      title: z.string(),
      finding: z.string(),
      why: z.string(),
    }),
    risks: z.array(
      z.object({
        title: z.string(),
        finding: z.string(),
        why: z.string(),
      }),
    ),
    insights: z.array(
      z.object({
        title: z.string(),
        finding: z.string(),
        why: z.string(),
      }),
    ),
    monthlyActions: z.array(
      z.object({
        title: z.string(),
        action: z.string(),
        why: z.string(),
      }),
    ),
    priorities: z.array(
      z.object({
        title: z.string(),
        priority: z.string(),
        why: z.string(),
      }),
    ),
    expectedOutcome: z.object({
      title: z.string(),
      outcome: z.string(),
      why: z.string(),
    }),
    coachComment: z.object({
      title: z.string(),
      comment: z.string(),
      why: z.string(),
    }),
    decisionSimulatorPreview: z.array(
      z.object({
        scenario: z.string(),
        interpretation: z.string(),
        why: z.string(),
      }),
    ),
  }),
  caveats: z.string(),
  model: z.string(),
  isPlaceholder: z.boolean(),
  provider: z.enum(["mock", "openai", "gemini"]),
  providerMode: z.enum(["mock", "placeholder", "live", "fallback"]),
  usage: z.object({
    estimatedInputTokens: z.number().int().nonnegative(),
    estimatedOutputTokens: z.number().int().nonnegative(),
    estimatedCostKurus: z.number().int().nonnegative(),
  }),
});

export type CoachInsight = z.infer<typeof coachInsightSchema>;

export type AIProviderName = "mock" | "openai" | "gemini";

export const geminiCoachResponseSchema = z.object({
  summary: z.string().min(1),
  strengths: z.array(z.string().min(1)).max(5),
  risks: z.array(z.string().min(1)).max(5),
  recommendations: z.array(z.string().min(1)).min(1).max(5),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  confidence: z.number().min(0).max(1),
});

export type GeminiCoachResponse = z.infer<typeof geminiCoachResponseSchema>;

export type CoachInputSummary = {
  month: string;
  riskLevel: string;
  salaryBand: "none" | "low" | "medium" | "high";
  mandatoryExpenseShare: number;
  minimumPaymentShare: number;
  survivalBudgetDirection: "negative" | "thin" | "stable";
  dailyLimitBand: "none" | "tight" | "moderate" | "comfortable";
  activeDebtCount: number;
  highInterestDebtCount: number;
  topDebtRateBand: "none" | "low" | "medium" | "high";
  warningCount: number;
  criticalReasonCount: number;
  actionTitles: string[];
  rateContext: {
    source: string;
    providerStatus: string;
    isFallback: boolean;
  };
};

export type CoachMemoryContext = {
  hasAnySnapshot: boolean;
  hasEnoughHistory: boolean;
  snapshotCount: number;
  latestPeriodMonth: string | null;
  highRiskMonthCount: number;
  cashSqueezeCount: number;
  totalDebtTrend: "unknown" | "decreasing" | "flat" | "increasing";
  survivalBudgetTrend: "unknown" | "improving" | "flat" | "worsening";
  planAdherenceScore: number | null;
  insightTitles: string[];
};

export type CoachTrendDirection = "unknown" | "increasing" | "decreasing" | "flat" | "improving" | "worsening";

export type CoachTrendMagnitude = "none" | "small" | "medium" | "large";

export type CoachTrendBurden = "unknown" | "low" | "medium" | "high";

export type CoachTrendContext = {
  hasEnoughHistory: boolean;
  reason: "none" | "no_snapshot" | "single_snapshot";
  windowMonths: 3 | 6 | 12 | null;
  availableMonths: number;
  incomeTrend: CoachTrendDirection;
  mandatoryExpenseTrend: CoachTrendDirection;
  totalDebtTrend: CoachTrendDirection;
  activeDebtTrend: CoachTrendDirection;
  survivalBudgetTrend: CoachTrendDirection;
  minimumPaymentBurdenTrend: CoachTrendDirection;
  minimumPaymentBurden: CoachTrendBurden;
  riskTrend: CoachTrendDirection;
  debtPayoffVelocity: CoachTrendMagnitude;
  cashSqueezeRecurrence: "none" | "occasional" | "repeated";
  highRiskMonthCount: number;
  labels: string[];
};

export type CoachContext = {
  version: "coach-context-v1";
  builtAtIso: string;
  summary: CoachInputSummary;
  memory: CoachMemoryContext;
  trends: CoachTrendContext;
};

export type AIProviderMode = "mock" | "placeholder" | "live" | "fallback";

export type AIUsageEstimate = {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCostKurus: number;
};

export type AgentFinding = {
  title: string;
  finding: string;
  why: string;
};

export type AgentAction = {
  title: string;
  action: string;
  why: string;
};

export type AgentPriority = {
  title: string;
  priority: string;
  why: string;
};

export type CoachAgentOutputs = {
  financialHealth: AgentFinding;
  debtStrategy: {
    priorities: AgentPriority[];
    insights: AgentFinding[];
  };
  cashFlow: {
    finding: AgentFinding;
    actions: AgentAction[];
    scenarios: CoachInsight["sections"]["decisionSimulatorPreview"];
  };
  risk: {
    findings: AgentFinding[];
  };
  financialHabits: {
    insights: AgentFinding[];
    coachComment: CoachInsight["sections"]["coachComment"];
  };
};
