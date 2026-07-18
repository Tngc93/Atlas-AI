import { AppShell } from "@/components/dashboard/AppShell";
import { CoachExperience } from "@/components/coach/CoachExperience";
import { PageHeader } from "@/components/ui/Primitives";
import { buildCoachFinancialSnapshot } from "@/features/coach/chat-context";
import { buildCoachEvidenceSummary } from "@/features/coach/context-evidence";
import { buildCoachContext, getCoachProviderPresentation } from "@/features/coach/orchestrator";
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
  const [planSnapshot, rateSnapshot, memoryReport] = await Promise.all([
    getMonthlyFinancePlanSnapshot(12),
    getLatestInterestRateSnapshot(),
    getMemoryReportSafely(),
  ]);
  const { monthlyPlan } = planSnapshot;
  const coachContext = buildCoachContext({ monthlyPlan, rateSnapshot, memoryReport });
  const coachEvidence = buildCoachEvidenceSummary(coachContext);
  const financialSnapshot = buildCoachFinancialSnapshot(planSnapshot);
  const provider = getCoachProviderPresentation();

  return (
    <AppShell>
      <PageHeader
        kicker="Koç"
        title="Finansal durumunu netleştir, seçeneklerini konuş."
        description="Koç, hesaplama motorunun ürettiği minimize edilmiş finans özetini açıklar. Yapılandırılmış sağlayıcı yalnız bu özeti ve sorunuzu alır; ham finans kayıtları ve API anahtarları tarayıcıya taşınmaz."
      />
      <div className="mt-6">
        <CoachExperience
          evidence={coachEvidence}
          financialSnapshot={financialSnapshot}
          provider={provider}
        />
      </div>
    </AppShell>
  );
}
