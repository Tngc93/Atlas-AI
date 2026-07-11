import { AppShell } from "@/components/dashboard/AppShell";
import { CoachPanel } from "@/components/dashboard/CoachPanel";
import { CoachEvidencePanel } from "@/components/coach/CoachEvidencePanel";
import { PageHeader } from "@/components/ui/Primitives";
import { buildCoachEvidenceSummary } from "@/features/coach/context-evidence";
import { buildCoachContext, generateCoachInsight } from "@/features/coach/orchestrator";
import { getMonthlyFinancePlanSnapshot } from "@/features/finance/data-service";
import { getMemoryReportData } from "@/features/memory/repository";
import { buildFinancialMemoryReport } from "@/features/memory/service";
import type { FinancialMemoryReport } from "@/features/memory/types";
import { getLatestInterestRateSnapshot } from "@/features/rates/service";

export const dynamic = "force-dynamic";

async function getMemoryReportSafely(): Promise<FinancialMemoryReport | null> {
  try {
    return buildFinancialMemoryReport(await getMemoryReportData());
  } catch {
    return null;
  }
}

export default async function CoachPage() {
  const [{ monthlyPlan }, rateSnapshot, memoryReport] = await Promise.all([
    getMonthlyFinancePlanSnapshot(12),
    getLatestInterestRateSnapshot(),
    getMemoryReportSafely(),
  ]);
  const coachContext = buildCoachContext({ monthlyPlan, rateSnapshot, memoryReport });
  const coachInsight = await generateCoachInsight(coachContext);
  const coachEvidence = buildCoachEvidenceSummary(coachContext);

  return (
    <AppShell>
      <PageHeader
        kicker="Koç"
        title="Bu ay ne yapman gerektiğini kısa, net ve güvenli şekilde konuş."
        description="Koç, hesaplama motorunun ürettiği minimize edilmiş finans özetini yorumlar. Canlı sağlayıcı seçiliyse yalnız bu özet gönderilebilir; ham finans kayıtları gönderilmez."
      />
      <div className="mt-6">
        <CoachPanel insight={coachInsight} />
      </div>
      <CoachEvidencePanel evidence={coachEvidence} />
    </AppShell>
  );
}
