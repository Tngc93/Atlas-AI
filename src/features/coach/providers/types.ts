import type { AIProviderMode, AIProviderName, AIUsageEstimate, CoachContext, CoachInsight } from "../types";

export type AIProvider = {
  name: AIProviderName;
  mode: AIProviderMode;
  isConfigured: () => boolean;
  estimateUsage: (input: CoachContext) => AIUsageEstimate;
  generateCoachInsight: (input: CoachContext) => Promise<CoachInsight>;
};
