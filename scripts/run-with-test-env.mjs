import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.test.local");

const [command, ...args] = process.argv.slice(2);
if (!command) {
  throw new Error("Çalıştırılacak test komutu belirtilmedi.");
}

const requiredVariables = [
  "TEST_DATABASE_URL",
  "TEST_DIRECT_URL",
  "TEST_NEON_ENDPOINT_ID",
  "TEST_DATABASE_RESET_CONFIRM",
];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  console.error(`PostgreSQL test ortamı eksik: ${missingVariables.join(", ")}`);
  process.exit(1);
}

const child = spawn(command, args, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: "test",
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Test komutu beklenmedik biçimde ${signal} sinyaliyle kapandı.`);
    process.exit(1);
    return;
  }

  process.exit(code ?? 1);
});
