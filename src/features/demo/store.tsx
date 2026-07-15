"use client";

import { createContext, useCallback, useContext, useMemo, useReducer, useState, type ReactNode } from "react";
import { buildMonthlyFinancePlan } from "@/features/finance/calculations";
import type { FinancePlanSnapshot, FinanceSnapshot } from "@/features/finance/data-service";
import { buildFinancialMemoryReport } from "@/features/memory/service";
import { buildReminderInbox } from "@/features/reminders/service";
import { createDemoSeed } from "./seed";
import type { DemoFinanceAction, DemoFinanceState } from "./types";

export function demoFinanceReducer(state: DemoFinanceState, action: DemoFinanceAction): DemoFinanceState {
  switch (action.type) {
    case "reset":
      return createDemoSeed();
    case "set_salary":
      return {
        ...state,
        profile: { ...state.profile, monthlySalaryKurus: action.amountKurus },
        salaryRecords: [
          { id: crypto.randomUUID(), amountKurus: action.amountKurus, salaryDay: state.profile.salaryDay, effectiveDateIso: new Date().toISOString() },
          ...state.salaryRecords,
        ],
        revision: state.revision + 1,
      };
    case "add_debt":
      return { ...state, debts: [...state.debts, action.debt], revision: state.revision + 1 };
    case "update_debt":
      return { ...state, debts: state.debts.map((debt) => (debt.id === action.debt.id ? action.debt : debt)), revision: state.revision + 1 };
    case "delete_debt":
      return { ...state, debts: state.debts.filter((debt) => debt.id !== action.id), revision: state.revision + 1 };
    case "add_expense":
      return { ...state, expenses: [...state.expenses, action.expense], revision: state.revision + 1 };
    case "update_expense":
      return { ...state, expenses: state.expenses.map((expense) => (expense.id === action.expense.id ? action.expense : expense)), revision: state.revision + 1 };
    case "delete_expense":
      return { ...state, expenses: state.expenses.filter((expense) => expense.id !== action.id), revision: state.revision + 1 };
    case "set_reminder_state":
      return {
        ...state,
        reminderStates: [...state.reminderStates.filter((item) => item.reminderKey !== action.state.reminderKey), action.state],
        revision: state.revision + 1,
      };
    case "refresh_memory":
      return {
        ...state,
        memorySnapshots: [...state.memorySnapshots.filter((item) => item.periodMonth !== action.snapshot.periodMonth), action.snapshot],
        revision: state.revision + 1,
      };
  }
}

type DemoContextValue = {
  state: DemoFinanceState;
  dispatch: React.Dispatch<DemoFinanceAction>;
  snapshot: FinanceSnapshot;
  planSnapshot: FinancePlanSnapshot;
  memoryReport: ReturnType<typeof buildFinancialMemoryReport>;
  reminderInbox: ReturnType<typeof buildReminderInbox>;
  resetDemo: () => void;
  resetGeneration: number;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoFinanceReducer, undefined, createDemoSeed);
  const [resetGeneration, setResetGeneration] = useState(0);
  const resetDemo = useCallback(() => {
    dispatch({ type: "reset" });
    setResetGeneration((generation) => generation + 1);
  }, []);
  const value = useMemo<DemoContextValue>(() => {
    const snapshot: FinanceSnapshot = { hasProfile: true, profile: state.profile, debts: state.debts, expenses: state.expenses };
    const monthlyPlan = buildMonthlyFinancePlan(snapshot.profile, snapshot.debts, snapshot.expenses, { horizonMonths: 24 });
    const planSnapshot = { ...snapshot, monthlyPlan };
    return {
      state,
      dispatch,
      snapshot,
      planSnapshot,
      memoryReport: buildFinancialMemoryReport(state.memorySnapshots),
      reminderInbox: buildReminderInbox(planSnapshot, state.reminderStates),
      resetDemo,
      resetGeneration,
    };
  }, [resetDemo, resetGeneration, state]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoFinance(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemoFinance must be used within DemoStateProvider.");
  return context;
}
