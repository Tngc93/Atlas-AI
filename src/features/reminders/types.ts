export type ReminderSeverity = "low" | "medium" | "high";

export type ReminderKind =
  | "debt_due"
  | "debt_due_today"
  | "debt_overdue"
  | "salary_day"
  | "expense_due"
  | "cash_flow_risk"
  | "missing_data"
  | "missing_interest";

export type ReminderSource = "finance_engine" | "profile" | "debt" | "expense" | "rate_context";

export type ReminderStatus = "active" | "seen" | "snoozed" | "dismissed";

export type ReminderItem = {
  key: string;
  kind: ReminderKind;
  severity: ReminderSeverity;
  title: string;
  reason: string;
  suggestedReview: string;
  dueDateIso?: string;
  source: ReminderSource;
};

export type ReminderStateRecord = {
  id: string;
  reminderKey: string;
  status: ReminderStatus;
  snoozedUntil?: Date;
  lastSeenAt?: Date;
  dismissedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ReminderInbox = {
  items: ReminderItem[];
  totalGenerated: number;
  hiddenCount: number;
};
