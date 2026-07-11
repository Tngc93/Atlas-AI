-- AlterTable
ALTER TABLE "CoachInsight" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'mock';
ALTER TABLE "CoachInsight" ADD COLUMN "providerMode" TEXT NOT NULL DEFAULT 'mock';
ALTER TABLE "CoachInsight" ADD COLUMN "inputSummaryHash" TEXT;
ALTER TABLE "CoachInsight" ADD COLUMN "estimatedInputTokens" INTEGER;
ALTER TABLE "CoachInsight" ADD COLUMN "estimatedOutputTokens" INTEGER;
ALTER TABLE "CoachInsight" ADD COLUMN "estimatedCostKurus" INTEGER;
ALTER TABLE "CoachInsight" ADD COLUMN "isPlaceholder" BOOLEAN NOT NULL DEFAULT true;
