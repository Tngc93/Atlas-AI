import type { ReminderState as PrismaReminderState } from "@prisma/client";
import { getPrisma } from "@/lib/db/prisma";
import type { ReminderStateRecord, ReminderStatus } from "./types";

function mapReminderState(record: PrismaReminderState): ReminderStateRecord {
  return {
    id: record.id,
    reminderKey: record.reminderKey,
    status: record.status as ReminderStatus,
    snoozedUntil: record.snoozedUntil ?? undefined,
    lastSeenAt: record.lastSeenAt ?? undefined,
    dismissedAt: record.dismissedAt ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function listReminderStates(reminderKeys?: string[]): Promise<ReminderStateRecord[]> {
  if (reminderKeys && reminderKeys.length === 0) {
    return [];
  }

  const records = await getPrisma().reminderState.findMany({
    where: reminderKeys ? { reminderKey: { in: reminderKeys } } : undefined,
    orderBy: { updatedAt: "desc" },
  });

  return records.map(mapReminderState);
}

export async function upsertReminderState(input: {
  reminderKey: string;
  status: ReminderStatus;
  snoozedUntil?: Date;
  lastSeenAt?: Date;
  dismissedAt?: Date;
}): Promise<ReminderStateRecord> {
  const record = await getPrisma().reminderState.upsert({
    where: { reminderKey: input.reminderKey },
    create: {
      reminderKey: input.reminderKey,
      status: input.status,
      snoozedUntil: input.snoozedUntil,
      lastSeenAt: input.lastSeenAt,
      dismissedAt: input.dismissedAt,
    },
    update: {
      status: input.status,
      snoozedUntil: input.snoozedUntil ?? null,
      lastSeenAt: input.lastSeenAt ?? null,
      dismissedAt: input.dismissedAt ?? null,
    },
  });

  return mapReminderState(record);
}
