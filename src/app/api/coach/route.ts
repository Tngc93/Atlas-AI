import { NextResponse } from "next/server";
import { buildCoachInputSummary, generateCoachInsight } from "@/features/coach/orchestrator";
import { getMonthlyFinancePlanSnapshot } from "@/features/finance/data-service";
import { getLatestInterestRateSnapshot } from "@/features/rates/service";
import { trCopy } from "@/lib/copy/tr";

export async function POST() {
  try {
    const [{ monthlyPlan }, rateSnapshot] = await Promise.all([
      getMonthlyFinancePlanSnapshot(12),
      getLatestInterestRateSnapshot(),
    ]);
    const summary = buildCoachInputSummary(monthlyPlan, rateSnapshot);
    const insight = await generateCoachInsight(summary);

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
