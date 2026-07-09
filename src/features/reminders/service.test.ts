import { describe, expect, it } from "vitest";
import { buildMonthlyFinancePlan } from "@/features/finance/calculations";
import type { FinancePlanSnapshot } from "@/features/finance/data-service";
import type { DebtAccount, MandatoryExpense, Profile } from "@/features/finance/types";
import { applyReminderStates, buildReminderInbox, buildReminderItems } from "./service";

const asOfDate = new Date("2026-07-09T12:00:00.000Z");

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "profile-qa",
    currency: "TRY",
    monthlySalaryKurus: 80_000_00,
    survivalThresholdKurus: 10_000_00,
    salaryDay: 12,
    ...overrides,
  };
}

function makeDebt(overrides: Partial<DebtAccount> = {}): DebtAccount {
  return {
    id: "debt-qa-card",
    type: "credit_card",
    name: "QA Örnek Kart",
    lender: "QA Örnek Banka",
    balanceKurus: 20_000_00,
    interestRateMonthly: 4.25,
    minimumPaymentKurus: 2_000_00,
    dueDay: 16,
    status: "active",
    interestRateSource: "manual",
    ...overrides,
  };
}

function makeExpense(overrides: Partial<MandatoryExpense> = {}): MandatoryExpense {
  return {
    id: "expense-qa-rent",
    name: "QA Örnek Kira",
    category: "rent",
    amountKurus: 20_000_00,
    dueDay: 15,
    isFixed: true,
    ...overrides,
  };
}

function makeSnapshot(args: {
  profile?: Profile;
  debts?: DebtAccount[];
  expenses?: MandatoryExpense[];
  hasProfile?: boolean;
} = {}): FinancePlanSnapshot {
  const profile = args.profile ?? makeProfile();
  const debts = args.debts ?? [makeDebt()];
  const expenses = args.expenses ?? [makeExpense()];
  const monthlyPlan = buildMonthlyFinancePlan(profile, debts, expenses, { asOfDate, horizonMonths: 12 });

  return {
    hasProfile: args.hasProfile ?? true,
    profile,
    debts,
    expenses,
    monthlyPlan,
  };
}

describe("Reminder Engine", () => {
  it("creates medium due reminder for an active debt due within seven days", () => {
    const reminders = buildReminderItems(makeSnapshot());
    const dueReminder = reminders.find((reminder) => reminder.kind === "debt_due");

    expect(dueReminder?.severity).toBe("medium");
    expect(dueReminder?.title).toBe("Yaklaşan borç son ödeme tarihi");
    expect(dueReminder?.reason).toContain("7 gün kaldı");
  });

  it("creates high reminders for debt due today or overdue and ignores inactive debts", () => {
    const reminders = buildReminderItems(
      makeSnapshot({
        debts: [
          makeDebt({ id: "debt-due-today", dueDay: 9 }),
          makeDebt({ id: "debt-overdue", dueDay: 8 }),
          makeDebt({ id: "debt-paused", dueDay: 9, status: "paused" }),
          makeDebt({ id: "debt-paid-off", dueDay: 9, status: "paid_off" }),
        ],
      }),
    );

    expect(reminders.find((reminder) => reminder.kind === "debt_due_today")?.severity).toBe("high");
    expect(reminders.find((reminder) => reminder.kind === "debt_overdue")?.severity).toBe("high");
    expect(reminders.some((reminder) => reminder.key.includes("debt-paused"))).toBe(false);
    expect(reminders.some((reminder) => reminder.key.includes("debt-paid-off"))).toBe(false);
  });

  it("creates setup, salary day, expense day, high risk and missing interest reminders", () => {
    const reminders = buildReminderItems(
      makeSnapshot({
        hasProfile: false,
        profile: makeProfile({ monthlySalaryKurus: 0, salaryDay: undefined }),
        debts: [makeDebt({ interestRateMonthly: 0, interestRateSource: "missing" })],
        expenses: [],
      }),
    );
    const kinds = reminders.map((reminder) => reminder.kind);

    expect(kinds).toContain("missing_data");
    expect(kinds).toContain("missing_interest");
    expect(kinds).toContain("cash_flow_risk");

    const completeReminders = buildReminderItems(makeSnapshot());
    expect(completeReminders.map((reminder) => reminder.kind)).toContain("salary_day");
    expect(completeReminders.map((reminder) => reminder.kind)).toContain("expense_due");
  });

  it("keeps reminder keys stable, deduped and free from pressure language", () => {
    const reminders = buildReminderItems(makeSnapshot());
    const keys = reminders.map((reminder) => reminder.key);
    const copy = reminders.flatMap((reminder) => [reminder.title, reminder.reason, reminder.suggestedReview]).join(" ");

    expect(new Set(keys).size).toBe(keys.length);
    expect(copy).not.toMatch(/hemen öde|zorundasın|kesin/i);
  });

  it("filters seen, snoozed and dismissed reminder states without mutating generated items", () => {
    const reminders = buildReminderItems(makeSnapshot());
    const firstReminder = reminders[0];
    const inbox = applyReminderStates(
      reminders,
      [
        {
          id: "state-1",
          reminderKey: firstReminder.key,
          status: "seen",
          lastSeenAt: asOfDate,
          createdAt: asOfDate,
          updatedAt: asOfDate,
        },
      ],
      asOfDate,
    );

    expect(inbox.items.some((reminder) => reminder.key === firstReminder.key)).toBe(false);
    expect(reminders.some((reminder) => reminder.key === firstReminder.key)).toBe(true);
    expect(buildReminderInbox(makeSnapshot()).totalGenerated).toBeGreaterThan(0);
  });
});
