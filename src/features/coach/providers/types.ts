import type { AIProviderName, CoachContext, CoachInsight } from "../types";
import type { AIProviderAdapter } from "./contracts";

export type AIProvider = AIProviderAdapter & {
  name: AIProviderName;
  generateCoachInsight: (input: CoachContext) => Promise<CoachInsight>;
};
