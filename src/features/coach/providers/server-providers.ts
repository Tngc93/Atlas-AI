import "server-only";

import { createServerProvider } from "./server-provider-factory";

export const anthropicProvider = createServerProvider({
  id: "anthropic",
  apiKeyEnv: "ANTHROPIC_API_KEY",
  modelEnv: "ANTHROPIC_MODEL",
  baseUrlEnv: "ANTHROPIC_BASE_URL",
  protocol: "anthropic",
});

export const openRouterProvider = createServerProvider({
  id: "openrouter",
  apiKeyEnv: "OPENROUTER_API_KEY",
  modelEnv: "OPENROUTER_MODEL",
  baseUrlEnv: "OPENROUTER_BASE_URL",
  protocol: "openai-compatible",
});

export const ollamaProvider = createServerProvider({
  id: "ollama",
  modelEnv: "OLLAMA_MODEL",
  baseUrlEnv: "OLLAMA_BASE_URL",
  protocol: "openai-compatible",
});

export const lmStudioProvider = createServerProvider({
  id: "lm-studio",
  apiKeyEnv: "LM_STUDIO_API_KEY",
  modelEnv: "LM_STUDIO_MODEL",
  baseUrlEnv: "LM_STUDIO_BASE_URL",
  protocol: "openai-compatible",
});

export const customOpenAICompatibleProvider = createServerProvider({
  id: "custom-openai-compatible",
  apiKeyEnv: "CUSTOM_AI_API_KEY",
  modelEnv: "CUSTOM_AI_MODEL",
  baseUrlEnv: "CUSTOM_AI_BASE_URL",
  protocol: "openai-compatible",
});
