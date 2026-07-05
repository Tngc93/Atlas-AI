import type { AIProviderMode, AIProviderName, AIUsageEstimate, CoachInputSummary, CoachInsight } from "../types";

export type AIProvider = {
  name: AIProviderName;
  mode: AIProviderMode;
  isConfigured: () => boolean;
  estimateUsage: (input: CoachInputSummary) => AIUsageEstimate;
  generateCoachInsight: (input: CoachInputSummary) => Promise<CoachInsight>;
};
