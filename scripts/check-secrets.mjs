import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const repositoryFiles = [
  ...execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n"),
  ...execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { encoding: "utf8" }).split("\n"),
]
  .map((file) => file.trim())
  .filter(Boolean);

const forbiddenTrackedFiles = [
  /^\.env$/,
  /^\.env\.local$/,
  /^\.env\..+\.local$/,
  /(^|\/).+\.db$/,
  /(^|\/).+\.db-journal$/,
  /(^|\/).+\.sqlite$/,
  /(^|\/).+\.sqlite3$/,
  /^prisma\/.+\.db/,
  /^node_modules\//,
  /^\.next\//,
  /^test-results\//,
  /^playwright-report\//,
  /^coverage\//,
];

const secretPatterns = [
  {
    name: "OpenAI API key",
    pattern: /sk-[A-Za-z0-9_-]{20,}/,
  },
  {
    name: "Gemini API key",
    pattern: /AIza[0-9A-Za-z_-]{25,}/,
  },
  {
    name: "private key block",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/,
  },
  {
    name: "client-side AI API key assignment",
    pattern: /NEXT_PUBLIC_(?:OPENAI|GEMINI|AI)[A-Z0-9_]*\s*=/,
  },
  {
    name: "non-empty AI API key env value",
    pattern: /^(?:OPENAI_API_KEY|GEMINI_API_KEY)[^\S\r\n]*=[^\S\r\n]*["']?[^"'\s\r\n]+/m,
  },
];

const findings = [];

for (const file of repositoryFiles) {
  for (const pattern of forbiddenTrackedFiles) {
    if (pattern.test(file)) {
      findings.push(`${file}: git'e girmemesi gereken dosya izleniyor`);
    }
  }

  if (file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".webp")) {
    continue;
  }

  let content = "";
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  for (const { name, pattern } of secretPatterns) {
    if (pattern.test(content)) {
      findings.push(`${file}: ${name} riski bulundu`);
    }
  }
}

if (findings.length > 0) {
  console.error("Secret scan başarısız:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("Secret scan temiz.");
