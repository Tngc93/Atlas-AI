-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "monthlySalaryKurus" INTEGER NOT NULL DEFAULT 0,
    "survivalThresholdKurus" INTEGER NOT NULL DEFAULT 0,
    "salaryDay" INTEGER,
    "monthlyLivingReserveKurus" INTEGER,
    "riskTolerance" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SalaryRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amountKurus" INTEGER NOT NULL,
    "salaryDay" INTEGER,
    "effectiveDate" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DebtAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lender" TEXT NOT NULL,
    "totalDebtKurus" INTEGER NOT NULL DEFAULT 0,
    "balanceKurus" INTEGER NOT NULL,
    "creditLimitKurus" INTEGER,
    "interestRateMonthly" DECIMAL NOT NULL,
    "interestRateAnnual" DECIMAL,
    "minimumPaymentKurus" INTEGER NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "statementDay" INTEGER,
    "lastPaymentDate" DATETIME,
    "isMinimumPaymentPaidThisMonth" BOOLEAN NOT NULL DEFAULT false,
    "priorityOverride" INTEGER,
    "graceDays" INTEGER,
    "paymentStatus" TEXT,
    "installmentCount" INTEGER,
    "remainingInstallments" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MandatoryExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amountKurus" INTEGER NOT NULL,
    "dueDay" INTEGER,
    "isFixed" BOOLEAN NOT NULL DEFAULT true,
    "isPaidThisMonth" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentPlanMonth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "month" TEXT NOT NULL,
    "salaryKurus" INTEGER NOT NULL,
    "mandatoryExpenseTotalKurus" INTEGER NOT NULL,
    "minimumDebtPaymentsKurus" INTEGER NOT NULL,
    "extraDebtPaymentKurus" INTEGER NOT NULL,
    "survivalBudgetKurus" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DebtProjection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planMonthId" TEXT NOT NULL,
    "debtAccountId" TEXT NOT NULL,
    "startingBalanceKurus" INTEGER NOT NULL,
    "interestChargedKurus" INTEGER NOT NULL,
    "minimumPaymentKurus" INTEGER NOT NULL,
    "extraPaymentKurus" INTEGER NOT NULL,
    "endingBalanceKurus" INTEGER NOT NULL,
    "projectedPayoffMonth" TEXT,
    CONSTRAINT "DebtProjection_planMonthId_fkey" FOREIGN KEY ("planMonthId") REFERENCES "PaymentPlanMonth" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterestRateSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'TR',
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "effectiveDate" TEXT NOT NULL,
    "referenceRate" DECIMAL,
    "maxContractualRate" DECIMAL,
    "maxOverdueRate" DECIMAL,
    "rawSourceUrl" TEXT NOT NULL,
    "retrievedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CoachInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "month" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "actionsJson" TEXT NOT NULL,
    "caveats" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachInsight_inputHash_key" ON "CoachInsight"("inputHash");
