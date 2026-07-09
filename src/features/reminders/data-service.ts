import { getMonthlyFinancePlanSnapshot } from "@/features/finance/data-service";
import { applyReminderStates, buildReminderItems } from "./service";
import { listReminderStates } from "./repository";

export async function getReminderInboxData(limit?: number) {
  const snapshot = await getMonthlyFinancePlanSnapshot(12);
  const generatedReminders = buildReminderItems(snapshot);
  const states = await listReminderStates(generatedReminders.map((reminder) => reminder.key));
  const asOfDate = new Date(`${snapshot.monthlyPlan.asOfDateIso}T12:00:00.000Z`);
  const inbox = applyReminderStates(generatedReminders, states, asOfDate);

  return {
    snapshot,
    inbox: {
      ...inbox,
      items: typeof limit === "number" ? inbox.items.slice(0, limit) : inbox.items,
    },
  };
}
