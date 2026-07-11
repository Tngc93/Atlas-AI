-- CreateTable
CREATE TABLE "FinancialMemorySnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodMonth" TEXT NOT NULL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trigger" TEXT NOT NULL,
    "salaryKurus" INTEGER NOT NULL,
    "mandatoryExpenseTotalKurus" INTEGER NOT NULL,
    "minimumDebtPaymentsKurus" INTEGER NOT NULL,
    "survivalBudgetKurus" INTEGER NOT NULL,
    "dailyLimitKurus" INTEGER NOT NULL,
    "weeklyLimitKurus" INTEGER NOT NULL,
    "extraDebtPaymentCapacityKurus" INTEGER NOT NULL,
    "totalDebtKurus" INTEGER NOT NULL,
    "activeDebtKurus" INTEGER NOT NULL,
    "creditCardDebtKurus" INTEGER NOT NULL,
    "activeDebtCount" INTEGER NOT NULL,
    "paidOffDebtCount" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "criticalReasonCount" INTEGER NOT NULL,
    "warningCount" INTEGER NOT NULL,
    "fallbackRateDebtCount" INTEGER NOT NULL,
    "missingRateDebtCount" INTEGER NOT NULL,
    "manualRateDebtCount" INTEGER NOT NULL,
    "providerRateDebtCount" INTEGER NOT NULL,
    "planExtraDebtPaymentKurus" INTEGER NOT NULL,
    "planMinimumPaymentsCovered" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FinancialMemoryCategoryTotal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snapshotId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amountKurus" INTEGER NOT NULL,
    "itemCount" INTEGER NOT NULL,
    CONSTRAINT "FinancialMemoryCategoryTotal_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "FinancialMemorySnapshot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialMemorySnapshot_periodMonth_key" ON "FinancialMemorySnapshot"("periodMonth");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialMemoryCategoryTotal_snapshotId_category_key" ON "FinancialMemoryCategoryTotal"("snapshotId", "category");
