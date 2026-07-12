import "server-only";

import { createServerProvider } from "./server-provider-factory";

export const openAIProvider = createServerProvider({
  id: "openai",
  apiKeyEnv: "OPENAI_API_KEY",
  modelEnv: "OPENAI_MODEL",
  baseUrlEnv: "OPENAI_BASE_URL",
  protocol: "openai-compatible",
});
