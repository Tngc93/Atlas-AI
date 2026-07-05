import { AppShell } from "@/components/dashboard/AppShell";
import { IncomeCrudPanels } from "@/components/forms/IncomeCrudPanels";
import { PageNotice } from "@/components/forms/PageNotice";
import { getProfile, listSalaryRecords } from "@/features/income/repository";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  salaryRecordDeleted: "Maaş geçmişi kaydı silindi.",
};

export default async function IncomePage({ searchParams }: { searchParams?: Promise<{ notice?: string }> }) {
  const params = await searchParams;
  const [profile, salaryRecords] = await Promise.all([getProfile(), listSalaryRecords()]);
  const profileFormModel = profile
    ? {
        id: profile.id,
        monthlySalaryKurus: profile.monthlySalaryKurus,
        survivalThresholdKurus: profile.survivalThresholdKurus,
        salaryDay: profile.salaryDay,
      }
    : null;
  const salaryRecordFormModels = salaryRecords.map((record) => ({
    id: record.id,
    amountKurus: record.amountKurus,
    salaryDay: record.salaryDay,
    effectiveDateIso: record.effectiveDate.toISOString(),
    notes: record.notes,
  }));

  return (
    <AppShell>
      <PageNotice message={params?.notice ? noticeMessages[params.notice] : undefined} />
      <IncomeCrudPanels profile={profileFormModel} salaryRecords={salaryRecordFormModels} />
    </AppShell>
  );
}
