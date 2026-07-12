import { describe, expect, it } from "vitest";
import { isPublicDemoMode, resolveExecutionMode } from "./execution-mode";

describe("execution mode", () => {
  it("uses self-host unless demo mode is explicitly enabled", () => {
    expect(resolveExecutionMode({})).toBe("self-host");
    expect(resolveExecutionMode({ PUBLIC_DEMO_MODE: "false" })).toBe("self-host");
    expect(resolveExecutionMode({ PUBLIC_DEMO_MODE: "TRUE" })).toBe("self-host");
  });

  it("enables public demo only for the explicit true value", () => {
    expect(resolveExecutionMode({ PUBLIC_DEMO_MODE: "true" })).toBe("demo");
    expect(isPublicDemoMode({ PUBLIC_DEMO_MODE: "true" })).toBe(true);
  });
});
