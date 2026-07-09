"use server";

import { revalidateFinancePages } from "@/lib/actions/revalidate-finance";
import { upsertReminderState } from "./repository";

type ReminderActionIntent = "seen" | "snooze" | "dismiss";

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseIntent(value: string): ReminderActionIntent | null {
  if (value === "seen" || value === "snooze" || value === "dismiss") {
    return value;
  }

  return null;
}

export async function updateReminderStateAction(formData: FormData): Promise<void> {
  const reminderKey = getString(formData, "reminderKey");
  const intent = parseIntent(getString(formData, "intent"));

  if (!reminderKey || !intent) {
    return;
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  if (intent === "seen") {
    await upsertReminderState({ reminderKey, status: "seen", lastSeenAt: now });
  }

  if (intent === "snooze") {
    await upsertReminderState({ reminderKey, status: "snoozed", snoozedUntil: tomorrow });
  }

  if (intent === "dismiss") {
    await upsertReminderState({ reminderKey, status: "dismissed", dismissedAt: now });
  }

  revalidateFinancePages();
}
