import { AppShell } from "@/components/dashboard/AppShell";
import { ReminderPanel } from "@/components/reminders/ReminderPanel";
import { getReminderInboxData } from "@/features/reminders/data-service";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const { inbox } = await getReminderInboxData();

  return (
    <AppShell>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-steel">Uygulama içi hatırlatma</p>
        <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl">Hatırlatmalar</h1>
        <p className="max-w-3xl text-sm leading-6 text-steel">
          Yaklaşan ödeme tarihleri, maaş günü, yüksek risk ve eksik kayıt sinyalleri burada uygulama içi olarak görünür.
          Dış bildirim, e-posta veya SMS gönderilmez.
        </p>
      </div>

      <div className="mt-6">
        <ReminderPanel reminders={inbox.items} totalCount={inbox.totalGenerated} />
      </div>
    </AppShell>
  );
}
