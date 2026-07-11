import { spawn } from "node:child_process";
import { once } from "node:events";
import { createPostgresTestContext } from "./postgres-test-context.mjs";

const postgresContext = await createPostgresTestContext("playwright", "e2e");
const env = {
  ...process.env,
  NODE_ENV: "development",
  DATABASE_URL: postgresContext.databaseUrl,
  DIRECT_URL: postgresContext.directUrl,
  AI_PROVIDER: "mock",
};

const server = spawn("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", "3100"], {
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

let code = 1;

try {
  [code] = await once(server, "exit");
} finally {
  await postgresContext.cleanup();
}

process.exit(requestedSignal ? 0 : (code ?? 0));
