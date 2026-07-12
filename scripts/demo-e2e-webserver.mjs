import { spawn } from "node:child_process";
import { once } from "node:events";

const env = {
  ...process.env,
  NODE_ENV: "development",
  PUBLIC_DEMO_MODE: "true",
  AI_PROVIDER: "mock",
  DATABASE_URL: "",
  DIRECT_URL: "",
  NEXT_PUBLIC_AI_BROWSER_BYOK_ENABLED: "false",
  NEXT_PUBLIC_AI_BROWSER_LOCAL_ENABLED: "false",
  NEXT_PUBLIC_AI_BROWSER_GEMINI_ENABLED: "false",
  NEXT_PUBLIC_AI_BROWSER_OPENROUTER_ENABLED: "false",
  AI_PUBLIC_DEMO_DATA_CONFIRMED: "false",
};

const server = spawn("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", "3200"], {
  cwd: process.cwd(),
  env,
  stdio: "inherit",
});

let requestedSignal;
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    requestedSignal = signal;
    server.kill(signal);
  });
}

const [code] = await once(server, "exit");
process.exit(requestedSignal ? 0 : (code ?? 0));
