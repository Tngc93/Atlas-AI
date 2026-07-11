-- CreateTable
CREATE TABLE "ReminderState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reminderKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "snoozedUntil" DATETIME,
    "lastSeenAt" DATETIME,
    "dismissedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ReminderState_reminderKey_key" ON "ReminderState"("reminderKey");
