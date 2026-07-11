-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DebtType" AS ENUM ('credit_card', 'personal_loan', 'overdraft_account', 'friend_debt', 'other');

-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('active', 'paused', 'paid_off');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('active', 'seen', 'snoozed', 'dismissed');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "monthlySalaryKurus" INTEGER NOT NULL DEFAULT 0,
    "survivalThresholdKurus" INTEGER NOT NULL DEFAULT 0,
    "salaryDay" INTEGER,
    "monthlyLivingReserveKurus" INTEGER,
    "riskTolerance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryRecord" (
    "id" TEXT NOT NULL,
    "amountKurus" INTEGER NOT NULL,
    "salaryDay" INTEGER,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtAccount" (
    "id" TEXT NOT NULL,
    "type" "DebtType" NOT NULL,
    "name" TEXT NOT NULL,
    "lender" TEXT NOT NULL,
    "totalDebtKurus" INTEGER NOT NULL DEFAULT 0,
    "balanceKurus" INTEGER NOT NULL,
    "creditLimitKurus" INTEGER,
    "interestRateMonthly" DECIMAL(65,30) NOT NULL,
    "interestRateAnnual" DECIMAL(65,30),
    "manualInterestRateMonthly" DECIMAL(65,30),
    "resolvedInterestRateMonthly" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "interestRateSource" TEXT NOT NULL DEFAULT 'missing',
    "interestRateResolvedAt" TIMESTAMP(3),
    "interestRateNote" TEXT,
    "minimumPaymentKurus" INTEGER NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "statementDay" INTEGER,
    "lastPaymentDate" TIMESTAMP(3),
    "isMinimumPaymentPaidThisMonth" BOOLEAN NOT NULL DEFAULT false,
    "priorityOverride" INTEGER,
    "graceDays" INTEGER,
    "paymentStatus" TEXT,
    "installmentCount" INTEGER,
    "remainingInstallments" INTEGER,
    "status" "DebtStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebtAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MandatoryExpense" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amountKurus" INTEGER NOT NULL,
    "dueDay" INTEGER,
    "isFixed" BOOLEAN NOT NULL DEFAULT true,
    "isPaidThisMonth" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MandatoryExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentPlanMonth" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "salaryKurus" INTEGER NOT NULL,
    "mandatoryExpenseTotalKurus" INTEGER NOT NULL,
    "minimumDebtPaymentsKurus" INTEGER NOT NULL,
    "extraDebtPaymentKurus" INTEGER NOT NULL,
    "survivalBudgetKurus" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentPlanMonth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtProjection" (
    "id" TEXT NOT NULL,
    "planMonthId" TEXT NOT NULL,
    "debtAccountId" TEXT NOT NULL,
    "startingBalanceKurus" INTEGER NOT NULL,
    "interestChargedKurus" INTEGER NOT NULL,
    "minimumPaymentKurus" INTEGER NOT NULL,
    "extraPaymentKurus" INTEGER NOT NULL,
    "endingBalanceKurus" INTEGER NOT NULL,
    "projectedPayoffMonth" TEXT,

    CONSTRAINT "DebtProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterestRateSnapshot" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "providerStatus" TEXT NOT NULL DEFAULT 'fallback',
    "country" TEXT NOT NULL DEFAULT 'TR',
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "effectiveDate" TEXT NOT NULL,
    "rateType" TEXT NOT NULL DEFAULT 'credit_card',
    "referenceRate" DECIMAL(65,30),
    "maxContractualRate" DECIMAL(65,30),
    "maxOverdueRate" DECIMAL(65,30),
    "rawSourceUrl" TEXT NOT NULL,
    "note" TEXT,
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterestRateSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachInsight" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "providerMode" TEXT NOT NULL DEFAULT 'mock',
    "inputSummaryHash" TEXT,
    "estimatedInputTokens" INTEGER,
    "estimatedOutputTokens" INTEGER,
    "estimatedCostKurus" INTEGER,
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT true,
    "riskLevel" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "actionsJson" TEXT NOT NULL,
    "caveats" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialMemorySnapshot" (
    "id" TEXT NOT NULL,
    "periodMonth" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialMemorySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialMemoryCategoryTotal" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amountKurus" INTEGER NOT NULL,
    "itemCount" INTEGER NOT NULL,

    CONSTRAINT "FinancialMemoryCategoryTotal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderState" (
    "id" TEXT NOT NULL,
    "reminderKey" TEXT NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'active',
    "snoozedUntil" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReminderState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachInsight_inputHash_key" ON "CoachInsight"("inputHash");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialMemorySnapshot_periodMonth_key" ON "FinancialMemorySnapshot"("periodMonth");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialMemoryCategoryTotal_snapshotId_category_key" ON "FinancialMemoryCategoryTotal"("snapshotId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "ReminderState_reminderKey_key" ON "ReminderState"("reminderKey");

-- AddForeignKey
ALTER TABLE "DebtProjection" ADD CONSTRAINT "DebtProjection_planMonthId_fkey" FOREIGN KEY ("planMonthId") REFERENCES "PaymentPlanMonth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialMemoryCategoryTotal" ADD CONSTRAINT "FinancialMemoryCategoryTotal_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "FinancialMemorySnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
