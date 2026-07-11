import { readFileSync } from "node:fs";

const baselinePath = "prisma/migrations/20260710000000_postgresql_baseline/migration.sql";
const sql = readFileSync(baselinePath, "utf8");
const requiredFragments = [
  'CREATE TYPE "DebtType" AS ENUM',
  'CREATE TYPE "DebtStatus" AS ENUM',
  'CREATE TYPE "ReminderStatus" AS ENUM',
  '"status" "DebtStatus" NOT NULL DEFAULT \'active\'',
  '"status" "ReminderStatus" NOT NULL DEFAULT \'active\'',
  "DECIMAL(65,30)",
  "TIMESTAMP(3)",
  "FinancialMemorySnapshot_periodMonth_key",
  "ReminderState_reminderKey_key",
  "CoachInsight_inputHash_key",
  "ON DELETE CASCADE ON UPDATE CASCADE",
];
const forbiddenPatterns = [
  /\bDROP\b/i,
  /\bINSERT\b/i,
  /\bUPDATE\s+"/i,
  /\bDELETE\s+FROM\b/i,
  /\bDATETIME\b/i,
  /\bAUTOINCREMENT\b/i,
];
const findings = [];

for (const fragment of requiredFragments) {
  if (!sql.includes(fragment)) {
    findings.push(`Eksik baseline parçası: ${fragment}`);
  }
}

for (const pattern of forbiddenPatterns) {
  if (pattern.test(sql)) {
    findings.push(`Baseline içinde yasaklı SQL deseni bulundu: ${pattern}`);
  }
}

const unsafeAlterStatements = sql
  .split(";")
  .map((statement) => statement.trim())
  .filter((statement) => /^ALTER\s+TABLE/i.test(statement) && !/ADD\s+CONSTRAINT/i.test(statement));

if (unsafeAlterStatements.length > 0) {
  findings.push("Baseline yalnız foreign key ekleyen ALTER TABLE ifadeleri içerebilir.");
}

if (findings.length > 0) {
  console.error("PostgreSQL baseline kontrolü başarısız:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("PostgreSQL baseline kontrolü temiz.");
