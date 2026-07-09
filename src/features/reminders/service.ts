import type { FinancePlanSnapshot } from "@/features/finance/data-service";
import type { DueDateRisk, MandatoryExpense, MonthlyFinancePlan } from "@/features/finance/types";
import type { ReminderInbox, ReminderItem, ReminderSeverity, ReminderStateRecord } from "./types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DUE_SOON_WINDOW_DAYS = 7;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function dueDateForDay(day: number, asOfDate: Date): Date {
  const safeDay = Math.min(Math.max(1, day), getDaysInMonth(asOfDate));
  return new Date(asOfDate.getFullYear(), asOfDate.getMonth(), safeDay);
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_IN_MS);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function periodMonth(asOfDate: Date): string {
  return toIsoDate(asOfDate).slice(0, 7);
}

function parseAsOfDate(plan: MonthlyFinancePlan): Date {
  return new Date(`${plan.asOfDateIso}T12:00:00.000Z`);
}

function buildDebtDueReminder(risk: DueDateRisk): ReminderItem | null {
  if (risk.status === "overdue") {
    return {
      key: `debt_overdue:${risk.debtAccountId}:${risk.dueDateIso}`,
      kind: "debt_overdue",
      severity: "high",
      title: "Gecikmiş borç tarihi var",
      reason: "Bir aktif borç için son ödeme tarihi geçmiş görünüyor.",
      suggestedReview: "Asgari ödeme ve yaşam bütçesi etkisini kontrol edin; karar yine sizindir.",
      dueDateIso: risk.dueDateIso,
      source: "finance_engine",
    };
  }

  if (risk.status === "due_today") {
    return {
      key: `debt_due_today:${risk.debtAccountId}:${risk.dueDateIso}`,
      kind: "debt_due_today",
      severity: "high",
      title: "Bugün borç son ödeme günü",
      reason: "Bir aktif borç için son ödeme tarihi bugün görünüyor.",
      suggestedReview: "Asgari ödeme kapsamını ve bu ayın nakit akışını gözden geçirin.",
      dueDateIso: risk.dueDateIso,
      source: "finance_engine",
    };
  }

  if (risk.status === "due_soon") {
    return {
      key: `debt_due:${risk.debtAccountId}:${risk.dueDateIso}`,
      kind: "debt_due",
      severity: "medium",
      title: "Yaklaşan borç son ödeme tarihi",
      reason: `Bir aktif borç için son ödeme tarihine ${risk.daysUntilDue} gün kaldı.`,
      suggestedReview: "Ödeme gününü, asgari tutarı ve ay sonuna kalan yaşam bütçesini kontrol edin.",
      dueDateIso: risk.dueDateIso,
      source: "finance_engine",
    };
  }

  return null;
}

function buildSalaryReminder(snapshot: FinancePlanSnapshot, asOfDate: Date): ReminderItem | null {
  const salaryDay = snapshot.profile.salaryDay;

  if (!snapshot.hasProfile || !salaryDay) {
    return null;
  }

  const dueDate = dueDateForDay(salaryDay, asOfDate);
  const daysUntilDue = daysBetween(asOfDate, dueDate);

  if (daysUntilDue < 0 || daysUntilDue > DEFAULT_DUE_SOON_WINDOW_DAYS) {
    return null;
  }

  return {
    key: `salary_day:${periodMonth(asOfDate)}:${salaryDay}`,
    kind: "salary_day",
    severity: daysUntilDue === 0 ? "medium" : "low",
    title: daysUntilDue === 0 ? "Bugün maaş günü olarak görünüyor" : "Maaş günü yaklaşıyor",
    reason:
      daysUntilDue === 0
        ? "Profilinizdeki maaş günü bugün olarak kayıtlı."
        : `Profilinizdeki maaş gününe ${daysUntilDue} gün kaldı.`,
    suggestedReview: "Maaş geldiğinde zorunlu giderleri, asgari ödemeleri ve güvenli yaşam bütçesini yeniden kontrol edin.",
    dueDateIso: toIsoDate(dueDate),
    source: "profile",
  };
}

function buildExpenseReminders(expenses: MandatoryExpense[], asOfDate: Date): ReminderItem[] {
  return expenses
    .filter((expense) => typeof expense.dueDay === "number")
    .map((expense) => {
      const dueDate = dueDateForDay(expense.dueDay as number, asOfDate);
      return { expense, dueDate, daysUntilDue: daysBetween(asOfDate, dueDate) };
    })
    .filter(({ daysUntilDue }) => daysUntilDue >= 0 && daysUntilDue <= DEFAULT_DUE_SOON_WINDOW_DAYS)
    .map(({ expense, dueDate, daysUntilDue }) => ({
      key: `expense_due:${expense.id}:${toIsoDate(dueDate)}`,
      kind: "expense_due" as const,
      severity: daysUntilDue === 0 ? "medium" : "low",
      title: daysUntilDue === 0 ? "Bugün zorunlu gider günü" : "Yaklaşan zorunlu gider tarihi",
      reason:
        daysUntilDue === 0
          ? "Bir zorunlu gider için kayıtlı ödeme günü bugün."
          : `Bir zorunlu gider için kayıtlı ödeme gününe ${daysUntilDue} gün kaldı.`,
      suggestedReview: "Bu giderin ay sonu yaşam bütçesine etkisini kontrol edin.",
      dueDateIso: toIsoDate(dueDate),
      source: "expense" as const,
    }));
}

function buildCashFlowRiskReminder(plan: MonthlyFinancePlan, asOfDate: Date): ReminderItem | null {
  if (plan.riskLevel !== "high") {
    return null;
  }

  const reason =
    plan.criticalReasons[0] ??
    plan.warnings[0] ??
    "Nakit akışı baskısı bu ay yüksek risk çizgisinde görünüyor.";

  return {
    key: `cash_flow_risk:${periodMonth(asOfDate)}`,
    kind: "cash_flow_risk",
    severity: "high",
    title: "Nakit akışı baskısı yüksek görünüyor",
    reason,
    suggestedReview: "Ek ödeme veya yeni harcama kararı almadan önce zorunlu gider ve asgari ödeme kapsamını gözden geçirin.",
    source: "finance_engine",
  };
}

function buildMissingDataReminders(snapshot: FinancePlanSnapshot, asOfDate: Date): ReminderItem[] {
  const month = periodMonth(asOfDate);
  const items: ReminderItem[] = [];

  if (!snapshot.hasProfile || snapshot.profile.monthlySalaryKurus <= 0) {
    items.push({
      key: `missing_data:income:${month}`,
      kind: "missing_data",
      severity: "medium",
      title: "Gelir kaydı eksik görünüyor",
      reason: "Aylık planın güvenilir olması için güncel maaş kaydı gerekir.",
      suggestedReview: "Gelir sayfasında maaş ve maaş günü bilgisini kontrol edin.",
      source: "profile",
    });
  }

  if (snapshot.expenses.length === 0) {
    items.push({
      key: `missing_data:expenses:${month}`,
      kind: "missing_data",
      severity: "medium",
      title: "Zorunlu gider kaydı eksik görünüyor",
      reason: "Yaşam bütçesi hesaplaması için temel giderlerin görünür olması gerekir.",
      suggestedReview: "Giderler sayfasında kira, fatura ve temel yaşam giderlerini kontrol edin.",
      source: "expense",
    });
  }

  if (!snapshot.debts.some((debt) => debt.status === "active" && debt.balanceKurus > 0)) {
    items.push({
      key: `missing_data:debts:${month}`,
      kind: "missing_data",
      severity: "low",
      title: "Aktif borç kaydı yok",
      reason: "Borç ödeme planı ancak aktif borç varsa üretilebilir.",
      suggestedReview: "Aktif borcunuz varsa borçlar sayfasında kayıtları kontrol edin.",
      source: "debt",
    });
  }

  return items;
}

function buildMissingInterestReminders(snapshot: FinancePlanSnapshot, asOfDate: Date): ReminderItem[] {
  return snapshot.debts
    .filter((debt) => debt.status === "active" && debt.balanceKurus > 0)
    .filter((debt) => debt.interestRateSource === "missing" || debt.interestRateMonthly <= 0)
    .map((debt) => ({
      key: `missing_interest:${debt.id}:${periodMonth(asOfDate)}`,
      kind: "missing_interest" as const,
      severity: "low" as const,
      title: "Faiz bilgisi eksik olabilir",
      reason: "Bir aktif borç için faiz oranı eksik veya sıfır görünüyor.",
      suggestedReview: "Borçlar sayfasında gerçek kart veya kredi faiz oranını kontrol edin.",
      source: "rate_context" as const,
    }));
}

function severityRank(severity: ReminderSeverity): number {
  return { high: 3, medium: 2, low: 1 }[severity];
}

function kindRank(item: ReminderItem): number {
  return {
    debt_overdue: 1,
    debt_due_today: 2,
    cash_flow_risk: 3,
    debt_due: 4,
    salary_day: 5,
    expense_due: 6,
    missing_interest: 7,
    missing_data: 8,
  }[item.kind];
}

export function buildReminderItems(snapshot: FinancePlanSnapshot): ReminderItem[] {
  const asOfDate = parseAsOfDate(snapshot.monthlyPlan);
  const reminders = [
    ...snapshot.monthlyPlan.dueDateRisks.map(buildDebtDueReminder).filter((item): item is ReminderItem => Boolean(item)),
    buildCashFlowRiskReminder(snapshot.monthlyPlan, asOfDate),
    buildSalaryReminder(snapshot, asOfDate),
    ...buildExpenseReminders(snapshot.expenses, asOfDate),
    ...buildMissingDataReminders(snapshot, asOfDate),
    ...buildMissingInterestReminders(snapshot, asOfDate),
  ].filter((item): item is ReminderItem => Boolean(item));
  const unique = new Map(reminders.map((item) => [item.key, item]));

  return [...unique.values()].sort((a, b) => {
    const kindDifference = kindRank(a) - kindRank(b);
    if (kindDifference !== 0) {
      return kindDifference;
    }

    const severityDifference = severityRank(b.severity) - severityRank(a.severity);
    if (severityDifference !== 0) {
      return severityDifference;
    }

    return (a.dueDateIso ?? "9999-12-31").localeCompare(b.dueDateIso ?? "9999-12-31");
  });
}

function isSameDay(first: Date, second: Date): boolean {
  return toIsoDate(first) === toIsoDate(second);
}

function isVisibleByState(item: ReminderItem, state: ReminderStateRecord | undefined, asOfDate: Date): boolean {
  if (!state) {
    return true;
  }

  if (state.status === "dismissed") {
    return false;
  }

  if (state.status === "seen" && state.lastSeenAt && isSameDay(state.lastSeenAt, asOfDate)) {
    return false;
  }

  if (state.status === "snoozed" && state.snoozedUntil && state.snoozedUntil > asOfDate) {
    return false;
  }

  return true;
}

export function applyReminderStates(
  reminders: ReminderItem[],
  states: ReminderStateRecord[],
  asOfDate = new Date(),
): ReminderInbox {
  const stateByKey = new Map(states.map((state) => [state.reminderKey, state]));
  const items = reminders.filter((item) => isVisibleByState(item, stateByKey.get(item.key), asOfDate));

  return {
    items,
    totalGenerated: reminders.length,
    hiddenCount: reminders.length - items.length,
  };
}

export function buildReminderInbox(
  snapshot: FinancePlanSnapshot,
  states: ReminderStateRecord[] = [],
): ReminderInbox {
  return applyReminderStates(buildReminderItems(snapshot), states, parseAsOfDate(snapshot.monthlyPlan));
}
