import type { MonthlyActionItem, MonthlyFinancePlan } from "@/features/finance/types";
import type { ReminderItem } from "@/features/reminders/types";

export function formatDemoTry(kurus: number): string {
  const sign = kurus < 0 ? "-" : "";
  const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.abs(kurus) / 100);
  return `${sign}₺${amount}`;
}

export function formatDemoPeriodMonth(periodMonth: string): string {
  const date = new Date(`${periodMonth}-01T12:00:00.000Z`);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatDemoMonthFromIso(dateIso: string): string {
  const date = new Date(`${dateIso}T12:00:00.000Z`);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function buildDemoDecisionBrief(plan: MonthlyFinancePlan) {
  const protectedThing =
    plan.cashFlow.salaryKurus <= 0
      ? "A clear monthly income baseline"
      : !plan.cashFlow.minimumPaymentsCovered
        ? "Mandatory expenses and minimum payments"
        : plan.debtPriorities.length === 0
          ? "Essential living expenses"
          : "Living costs, minimum payments and the protected budget";

  const primaryRisk =
    plan.criticalReasons.length > 0
      ? "Required commitments place the current cash-flow boundary under pressure."
      : plan.warnings.length > 0
        ? "The current plan contains a payment-timing or budget signal worth reviewing."
        : "No material cash-flow warning is visible for this month.";

  const nextSafeStep =
    plan.cashFlow.salaryKurus <= 0
      ? "Complete the fictional income, expense and debt baseline before comparing options."
      : !plan.cashFlow.minimumPaymentsCovered
        ? "Review minimum-payment coverage before considering any optional payment."
        : plan.livingBudget.remainingForMonthKurus <= 0 || plan.cashFlow.extraDebtPaymentKurus <= 0
          ? "Keep the protected living budget visible before exploring additional debt payments."
          : "Keep the protected budget intact while reviewing the modeled extra-payment allocation.";

  const why =
    !plan.cashFlow.minimumPaymentsCovered
      ? "Minimum-payment coverage is a prerequisite for a stable monthly plan."
      : plan.livingBudget.remainingForMonthKurus <= 0 || plan.cashFlow.extraDebtPaymentKurus <= 0
        ? "Cash-flow resilience takes priority when the protected living budget is constrained."
        : plan.riskLevel === "low"
          ? "The deterministic engine shows required commitments covered within the current assumptions."
          : "The deterministic engine detected a timing, payment or budget signal that deserves review.";

  return { protectedThing, primaryRisk, nextSafeStep, why };
}

function actionDebtName(plan: MonthlyFinancePlan, action: MonthlyActionItem): string {
  return plan.debtPriorities.find((debt) => debt.id === action.debtAccountId)?.name ?? "the selected fictional debt";
}

export function buildDemoActionItems(plan: MonthlyFinancePlan) {
  return plan.actionPlan.map((action) => {
    if (action.id === "critical-cash-flow") {
      return {
        id: action.id,
        title: "Protect cash flow first",
        description: "Review mandatory commitments before exploring optional spending or extra payments.",
      };
    }

    if (action.id.startsWith("due-")) {
      return {
        id: action.id,
        title: "Review the approaching due date",
        description: `Check the modeled payment timing for ${actionDebtName(plan, action)}.`,
      };
    }

    if (action.id.startsWith("extra-")) {
      return {
        id: action.id,
        title: "Review the highest-rate debt allocation",
        description: `${formatDemoTry(action.amountKurus ?? 0)} is modeled as an optional extra payment toward ${actionDebtName(plan, action)}.`,
      };
    }

    if (action.id === "daily-limit") {
      return {
        id: action.id,
        title: "Track the daily spending boundary",
        description: `The current deterministic daily boundary is ${formatDemoTry(action.amountKurus ?? 0)}.`,
      };
    }

    return {
      id: action.id,
      title: "Review the current risk signals",
      description: "Revisit the modeled cash-flow and payment assumptions before changing the plan.",
    };
  });
}

function formatDemoDueDate(dueDateIso?: string): string {
  if (!dueDateIso) return "the modeled date";
  return new Date(`${dueDateIso}T12:00:00.000Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function buildDemoReminderCopy(item: ReminderItem): { title: string; reason: string } {
  switch (item.kind) {
    case "debt_overdue":
      return {
        title: "A fictional debt date has passed",
        reason: `The modeled due date was ${formatDemoDueDate(item.dueDateIso)}. Review the minimum-payment and safe-budget impact.`,
      };
    case "debt_due_today":
      return {
        title: "A fictional debt is due today",
        reason: "Review minimum-payment coverage and the current monthly cash-flow boundary.",
      };
    case "debt_due":
      return {
        title: "A fictional debt due date is approaching",
        reason: `The modeled due date is ${formatDemoDueDate(item.dueDateIso)}. Review the payment timing before changing the plan.`,
      };
    case "salary_day":
      return {
        title: "The fictional salary date is approaching",
        reason: `The modeled salary date is ${formatDemoDueDate(item.dueDateIso)}. Review required commitments when comparing the monthly plan.`,
      };
    case "expense_due":
      return {
        title: "A fictional mandatory expense date is approaching",
        reason: `The modeled expense date is ${formatDemoDueDate(item.dueDateIso)}. Review its effect on the protected budget.`,
      };
    case "cash_flow_risk":
      return {
        title: "Cash-flow pressure is modeled as high",
        reason: "Review mandatory commitments and minimum-payment coverage before exploring optional actions.",
      };
    case "missing_interest":
      return {
        title: "A fictional interest rate may be missing",
        reason: "Review the modeled debt rate before interpreting repayment projections.",
      };
    case "missing_data":
      return {
        title: "A fictional planning input is missing",
        reason: "Complete the temporary income, expense or debt baseline to improve the illustrative plan.",
      };
  }
}
