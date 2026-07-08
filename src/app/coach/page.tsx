import { AppShell } from "@/components/dashboard/AppShell";
import { CoachPanel } from "@/components/dashboard/CoachPanel";
import { PageHeader } from "@/components/ui/Primitives";
import { buildCoachInputSummary, generateCoachInsight } from "@/features/coach/orchestrator";
import { getMonthlyFinancePlanSnapshot } from "@/features/finance/data-service";
import { getLatestInterestRateSnapshot } from "@/features/rates/service";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const [{ monthlyPlan }, rateSnapshot] = await Promise.all([
    getMonthlyFinancePlanSnapshot(12),
    getLatestInterestRateSnapshot(),
  ]);
  const coachInsight = await generateCoachInsight(buildCoachInputSummary(monthlyPlan, rateSnapshot));

  return (
    <AppShell>
      <PageHeader
        kicker="Koç"
        title="Bu ay ne yapman gerektiğini kısa, net ve güvenli şekilde konuş."
        description="Koç, hesaplama motorunun ürettiği minimize edilmiş finans özetini yorumlar; veriniz lokal cihazınızda kalır."
      />
      <div className="mt-6">
        <CoachPanel insight={coachInsight} />
      </div>
    </AppShell>
  );
}
