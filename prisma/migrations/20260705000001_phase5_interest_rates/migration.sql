-- AlterTable
ALTER TABLE "DebtAccount" ADD COLUMN "manualInterestRateMonthly" DECIMAL;
ALTER TABLE "DebtAccount" ADD COLUMN "resolvedInterestRateMonthly" DECIMAL NOT NULL DEFAULT 0;
ALTER TABLE "DebtAccount" ADD COLUMN "interestRateSource" TEXT NOT NULL DEFAULT 'missing';
ALTER TABLE "DebtAccount" ADD COLUMN "interestRateResolvedAt" DATETIME;
ALTER TABLE "DebtAccount" ADD COLUMN "interestRateNote" TEXT;

-- Backfill existing manual rates as explicit manual overrides.
UPDATE "DebtAccount"
SET
  "manualInterestRateMonthly" = "interestRateMonthly",
  "resolvedInterestRateMonthly" = "interestRateMonthly",
  "interestRateSource" = 'manual',
  "interestRateResolvedAt" = CURRENT_TIMESTAMP
WHERE "interestRateMonthly" IS NOT NULL;

-- AlterTable
ALTER TABLE "InterestRateSnapshot" ADD COLUMN "providerStatus" TEXT NOT NULL DEFAULT 'fallback';
ALTER TABLE "InterestRateSnapshot" ADD COLUMN "rateType" TEXT NOT NULL DEFAULT 'credit_card';
ALTER TABLE "InterestRateSnapshot" ADD COLUMN "note" TEXT;
