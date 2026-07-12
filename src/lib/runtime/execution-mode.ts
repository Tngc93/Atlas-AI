export type ExecutionMode = "demo" | "self-host";

type DemoEnvironment = { PUBLIC_DEMO_MODE?: string };

export function resolveExecutionMode(env: DemoEnvironment = process.env as DemoEnvironment): ExecutionMode {
  return env.PUBLIC_DEMO_MODE === "true" ? "demo" : "self-host";
}

export function isPublicDemoMode(env: DemoEnvironment = process.env as DemoEnvironment): boolean {
  return resolveExecutionMode(env) === "demo";
}
