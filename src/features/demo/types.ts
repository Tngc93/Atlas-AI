import type { DebtAccount, MandatoryExpense, Profile } from "@/features/finance/types";
import type { FinancialMemorySnapshotRecord } from "@/features/memory/types";
import type { ReminderStateRecord } from "@/features/reminders/types";

export type DemoSalaryRecord = {
  id: string;
  amountKurus: number;
  salaryDay?: number;
  effectiveDateIso: string;
  notes?: string;
};

export type DemoFinanceState = {
  profile: Profile;
  salaryRecords: DemoSalaryRecord[];
  debts: DebtAccount[];
  expenses: MandatoryExpense[];
  memorySnapshots: FinancialMemorySnapshotRecord[];
  reminderStates: ReminderStateRecord[];
  revision: number;
};

export type DemoFinanceAction =
  | { type: "reset" }
  | { type: "set_salary"; amountKurus: number }
  | { type: "add_debt"; debt: DebtAccount }
  | { type: "update_debt"; debt: DebtAccount }
  | { type: "delete_debt"; id: string }
  | { type: "add_expense"; expense: MandatoryExpense }
  | { type: "update_expense"; expense: MandatoryExpense }
  | { type: "delete_expense"; id: string }
  | { type: "set_reminder_state"; state: ReminderStateRecord }
  | { type: "refresh_memory"; snapshot: FinancialMemorySnapshotRecord };
