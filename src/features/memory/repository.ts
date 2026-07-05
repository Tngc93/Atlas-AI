import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db/prisma";
import type {
  FinancialMemoryCategoryTotalInput,
  FinancialMemorySnapshotInput,
  FinancialMemorySnapshotRecord,
} from "./types";

type SnapshotWithCategories = Prisma.FinancialMemorySnapshotGetPayload<{ include: { categoryTotals: true } }>;

function mapSnapshot(record: SnapshotWithCategories): FinancialMemorySnapshotRecord {
  return {
    id: record.id,
    periodMonth: record.periodMonth,
    capturedAt: record.capturedAt,
    trigger: record.trigger as FinancialMemorySnapshotRecord["trigger"],
    salaryKurus: record.salaryKurus,
    mandatoryExpenseTotalKurus: record.mandatoryExpenseTotalKurus,
    minimumDebtPaymentsKurus: record.minimumDebtPaymentsKurus,
    survivalBudgetKurus: record.survivalBudgetKurus,
    dailyLimitKurus: record.dailyLimitKurus,
    weeklyLimitKurus: record.weeklyLimitKurus,
    extraDebtPaymentCapacityKurus: record.extraDebtPaymentCapacityKurus,
    totalDebtKurus: record.totalDebtKurus,
    activeDebtKurus: record.activeDebtKurus,
    creditCardDebtKurus: record.creditCardDebtKurus,
    activeDebtCount: record.activeDebtCount,
    paidOffDebtCount: record.paidOffDebtCount,
    riskLevel: record.riskLevel as FinancialMemorySnapshotRecord["riskLevel"],
    criticalReasonCount: record.criticalReasonCount,
    warningCount: record.warningCount,
    fallbackRateDebtCount: record.fallbackRateDebtCount,
    missingRateDebtCount: record.missingRateDebtCount,
    manualRateDebtCount: record.manualRateDebtCount,
    providerRateDebtCount: record.providerRateDebtCount,
    planExtraDebtPaymentKurus: record.planExtraDebtPaymentKurus,
    planMinimumPaymentsCovered: record.planMinimumPaymentsCovered,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    categoryTotals: record.categoryTotals.map((category) => ({
      category: category.category,
      amountKurus: category.amountKurus,
      itemCount: category.itemCount,
    })),
  };
}

export async function listMemorySnapshots(limit = 24): Promise<FinancialMemorySnapshotRecord[]> {
  const records = await getPrisma().financialMemorySnapshot.findMany({
    include: { categoryTotals: true },
    orderBy: { periodMonth: "desc" },
    take: limit,
  });

  return records.map(mapSnapshot);
}

export async function getMemorySnapshotByMonth(periodMonth: string): Promise<FinancialMemorySnapshotRecord | null> {
  const record = await getPrisma().financialMemorySnapshot.findUnique({
    where: { periodMonth },
    include: { categoryTotals: true },
  });

  return record ? mapSnapshot(record) : null;
}

export async function replaceMemoryCategoryTotals(snapshotId: string, categoryTotals: FinancialMemoryCategoryTotalInput[]) {
  const prisma = getPrisma();

  await prisma.financialMemoryCategoryTotal.deleteMany({ where: { snapshotId } });

  if (categoryTotals.length === 0) {
    return;
  }

  await prisma.financialMemoryCategoryTotal.createMany({
    data: categoryTotals.map((category) => ({
      snapshotId,
      ...category,
    })),
  });
}

export async function upsertMemorySnapshot(input: FinancialMemorySnapshotInput): Promise<FinancialMemorySnapshotRecord> {
  const { categoryTotals, ...snapshotInput } = input;
  const prisma = getPrisma();

  const snapshot = await prisma.financialMemorySnapshot.upsert({
    where: { periodMonth: snapshotInput.periodMonth },
    create: snapshotInput,
    update: snapshotInput,
  });

  await replaceMemoryCategoryTotals(snapshot.id, categoryTotals);

  const record = await getMemorySnapshotByMonth(snapshot.periodMonth);
  if (!record) {
    throw new Error("Financial memory snapshot could not be read after upsert.");
  }

  return record;
}

export async function getMemoryReportData(): Promise<FinancialMemorySnapshotRecord[]> {
  return listMemorySnapshots(24);
}
