import Link from "next/link";
import { updateReminderStateAction } from "@/features/reminders/actions";
import type { ReminderItem, ReminderSeverity } from "@/features/reminders/types";
import { EmptyState, StatusPill } from "@/components/ui/Primitives";
import { BellRing } from "lucide-react";

function severityLabel(severity: ReminderSeverity): string {
  return { low: "Düşük", medium: "Orta", high: "Yüksek" }[severity];
}

function severityTone(severity: ReminderSeverity): "success" | "warning" | "danger" {
  if (severity === "high") {
    return "danger";
  }

  if (severity === "medium") {
    return "warning";
  }

  return "success";
}

function formatDueDate(dueDateIso?: string): string | null {
  if (!dueDateIso) {
    return null;
  }

  return new Date(`${dueDateIso}T12:00:00.000Z`).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
}

function ReminderActionButton({
  reminderKey,
  intent,
  children,
}: {
  reminderKey: string;
  intent: "seen" | "snooze" | "dismiss";
  children: string;
}) {
  return (
    <form action={updateReminderStateAction}>
      <input type="hidden" name="reminderKey" value={reminderKey} />
      <input type="hidden" name="intent" value={intent} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-steel transition hover:border-mint/35 hover:text-ink"
      >
        {children}
      </button>
    </form>
  );
}

export function ReminderPanel({
  reminders,
  totalCount,
  compact = false,
}: {
  reminders: ReminderItem[];
  totalCount?: number;
  compact?: boolean;
}) {
  const visibleTotal = totalCount ?? reminders.length;

  return (
    <section className="ui-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Dikkat gerektirenler</p>
          <h2 className="mt-2 text-lg font-semibold">Hatırlatmalar</h2>
          <p className="mt-2 max-w-2xl text-[15px] font-medium leading-7 text-steel">
            Bu liste yalnızca uygulama içinde görünür. Kayıtlı verilerinizi değiştirmez; neyi gözden geçirebileceğinizi
            sakin şekilde öne çıkarır.
          </p>
        </div>
        {compact ? (
          <Link href="/reminders" className="ui-secondary-button shrink-0">
            Tümünü aç
          </Link>
        ) : null}
      </div>

      {reminders.length === 0 ? (
        <div className="mt-6"><EmptyState icon={BellRing} kicker="Hatırlatma kutusu" title="Şu anda öne çıkan hatırlatma yok" description="Yaklaşan ödeme, yüksek risk veya eksik kayıt sinyali oluşursa burada görünür. Atlas AI dış bildirim göndermez." /></div>
      ) : (
        <div className="mt-5 space-y-3">
          {reminders.map((reminder) => {
            const dueDate = formatDueDate(reminder.dueDateIso);

            return (
              <article key={reminder.key} className="rounded-xl border border-line bg-surface-muted p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-ink">{reminder.title}</h3>
                      <StatusPill tone={severityTone(reminder.severity)}>{severityLabel(reminder.severity)}</StatusPill>
                    </div>
                    <p className="mt-3 text-[15px] font-medium leading-6 text-steel">{reminder.reason}</p>
                    <p className="mt-2 text-[15px] font-medium leading-6 text-steel">
                      <span className="font-semibold text-ink">Gözden geçir:</span> {reminder.suggestedReview}
                    </p>
                    {dueDate ? <p className="mt-3 text-sm font-semibold text-ink">Son tarih: {dueDate}</p> : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <ReminderActionButton reminderKey={reminder.key} intent="seen">
                      Görüldü
                    </ReminderActionButton>
                    <ReminderActionButton reminderKey={reminder.key} intent="snooze">
                      Ertele
                    </ReminderActionButton>
                    <ReminderActionButton reminderKey={reminder.key} intent="dismiss">
                      Gizle
                    </ReminderActionButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-5 border-t border-line pt-4 text-sm font-medium leading-6 text-steel">
        Son karar sizindir. Hatırlatmalar ödeme yapmaz, veri değiştirmez ve dış bildirim göndermez.
        {visibleTotal > reminders.length ? ` ${visibleTotal - reminders.length} hatırlatma bu görünümde gösterilmiyor.` : ""}
      </p>
    </section>
  );
}
