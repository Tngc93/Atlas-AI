import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createPostgresTestContext, type PostgresTestContext } from "@/test/postgres-test-context";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function makeFormData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

describe("reminder repository and actions", () => {
  let postgresContext: PostgresTestContext;
  let disconnectPrismaForTests: () => Promise<void>;
  let listReminderStates: typeof import("./repository").listReminderStates;
  let upsertReminderState: typeof import("./repository").upsertReminderState;
  let updateReminderStateAction: typeof import("./actions").updateReminderStateAction;

  beforeAll(async () => {
    postgresContext = await createPostgresTestContext("reminders");

    ({ disconnectPrismaForTests } = await import("@/lib/db/prisma"));
    ({ listReminderStates, upsertReminderState } = await import("./repository"));
    ({ updateReminderStateAction } = await import("./actions"));
  });

  afterAll(async () => {
    await disconnectPrismaForTests?.();
    await postgresContext?.cleanup();
  });

  it("upserts one state per reminder key without storing reminder content", async () => {
    const first = await upsertReminderState({
      reminderKey: "debt_due:qa-card:2026-07-16",
      status: "seen",
      lastSeenAt: new Date("2026-07-09T12:00:00.000Z"),
    });
    const second = await upsertReminderState({
      reminderKey: "debt_due:qa-card:2026-07-16",
      status: "dismissed",
      dismissedAt: new Date("2026-07-09T13:00:00.000Z"),
    });
    const states = await listReminderStates(["debt_due:qa-card:2026-07-16"]);

    expect(second.id).toBe(first.id);
    expect(states).toHaveLength(1);
    expect(states[0].status).toBe("dismissed");
    expect(Object.keys(states[0])).not.toContain("title");
    expect(Object.keys(states[0])).not.toContain("reason");
  });

  it("updates reminder state through server action intents", async () => {
    await updateReminderStateAction(
      makeFormData({
        reminderKey: "salary_day:2026-07:12",
        intent: "snooze",
      }),
    );
    const [state] = await listReminderStates(["salary_day:2026-07:12"]);

    expect(state.status).toBe("snoozed");
    expect(state.snoozedUntil).toBeInstanceOf(Date);
  });
});
