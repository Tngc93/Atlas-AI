import { AppShell } from "@/components/dashboard/AppShell";
import { ReminderPanel } from "@/components/reminders/ReminderPanel";
import { getReminderInboxData } from "@/features/reminders/data-service";
import { PageHeader } from "@/components/ui/Primitives";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const { inbox } = await getReminderInboxData();

  return (
    <AppShell>
      <PageHeader kicker="Uygulama içi hatırlatma" title="Hatırlatmalar" description="Yaklaşan ödeme tarihleri, maaş günü, yüksek risk ve eksik kayıt sinyalleri yalnızca uygulama içinde görünür. Dış bildirim, e-posta veya SMS gönderilmez." />

      <div className="mt-6">
        <ReminderPanel reminders={inbox.items} totalCount={inbox.totalGenerated} />
      </div>
    </AppShell>
  );
}
