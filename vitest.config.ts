import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    exclude: ["e2e/**", "e2e-demo/**", "**/*.integration.test.ts", "node_modules/**", "dist/**", ".next/**"],
  },
});
