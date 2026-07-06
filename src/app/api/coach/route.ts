import { NextResponse } from "next/server";
import { buildCoachContext, generateCoachInsight } from "@/features/coach/orchestrator";
import { getMonthlyFinancePlanSnapshot } from "@/features/finance/data-service";
import { getMemoryReportData } from "@/features/memory/repository";
import { buildFinancialMemoryReport } from "@/features/memory/service";
import type { FinancialMemoryReport } from "@/features/memory/types";
import { getLatestInterestRateSnapshot } from "@/features/rates/service";
import { trCopy } from "@/lib/copy/tr";

async function getMemoryReportSafely(): Promise<FinancialMemoryReport | null> {
  try {
    return buildFinancialMemoryReport(await getMemoryReportData());
  } catch {
    return null;
  }
}

export async function POST() {
  try {
    const [{ monthlyPlan }, rateSnapshot, memoryReport] = await Promise.all([
      getMonthlyFinancePlanSnapshot(12),
      getLatestInterestRateSnapshot(),
      getMemoryReportSafely(),
    ]);
    const context = buildCoachContext({ monthlyPlan, rateSnapshot, memoryReport });
    const insight = await generateCoachInsight(context);

    return NextResponse.json(insight);
  } catch {
    return NextResponse.json(
      {
        error: trCopy.api.coachError,
      },
      { status: 500 },
    );
  }
}
