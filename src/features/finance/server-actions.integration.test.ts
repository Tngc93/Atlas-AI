import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { initialFormActionState } from "@/lib/actions/action-state";
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

describe("finance server actions", () => {
  let postgresContext: PostgresTestContext;
  let disconnectPrismaForTests: () => Promise<void>;
  let saveProfileIncomeAction: typeof import("@/features/income/actions").saveProfileIncomeAction;
  let createSalaryRecordAction: typeof import("@/features/income/actions").createSalaryRecordAction;
  let createDebtAction: typeof import("@/features/debts/actions").createDebtAction;
  let updateDebtAction: typeof import("@/features/debts/actions").updateDebtAction;
  let deleteDebtAction: typeof import("@/features/debts/actions").deleteDebtAction;
  let createExpenseAction: typeof import("@/features/expenses/actions").createExpenseAction;
  let updateExpenseAction: typeof import("@/features/expenses/actions").updateExpenseAction;
  let deleteExpenseAction: typeof import("@/features/expenses/actions").deleteExpenseAction;
  let listDebts: typeof import("@/features/debts/repository").listDebts;
  let listExpenses: typeof import("@/features/expenses/repository").listExpenses;

  beforeAll(async () => {
    postgresContext = await createPostgresTestContext("server-actions");

    ({ disconnectPrismaForTests } = await import("@/lib/db/prisma"));
    ({ saveProfileIncomeAction, createSalaryRecordAction } = await import("@/features/income/actions"));
    ({ createDebtAction, updateDebtAction, deleteDebtAction } = await import("@/features/debts/actions"));
    ({ createExpenseAction, updateExpenseAction, deleteExpenseAction } = await import("@/features/expenses/actions"));
    ({ listDebts } = await import("@/features/debts/repository"));
    ({ listExpenses } = await import("@/features/expenses/repository"));
  });

  afterAll(async () => {
    await disconnectPrismaForTests?.();
    await postgresContext?.cleanup();
  });

  it("returns Turkish validation errors for invalid income form data", async () => {
    const result = await saveProfileIncomeAction(
      initialFormActionState,
      makeFormData({
        monthlySalaryKurus: "-1",
        survivalThresholdKurus: "0",
        salaryDay: "40",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe("Gelir bilgileri kaydedilemedi. Lütfen alanları kontrol edin.");
    expect(result.fieldErrors?.monthlySalaryKurus?.[0]).toBe("Aylık maaş 0.01 TL veya üzerinde olmalı.");
    expect(result.fieldErrors?.salaryDay?.[0]).toBe("Maaş günü 1 ile 31 arasında olmalı.");
  });

  it("creates income and salary history records through server actions", async () => {
  const incomeResult = await saveProfileIncomeAction(
    initialFormActionState,
    makeFormData({
      monthlySalaryKurus: "100000",
      survivalThresholdKurus: "10000",
      salaryDay: "1",
    }),
  );

  const salaryResult = await createSalaryRecordAction(
    initialFormActionState,
    makeFormData({
      amountKurus: "100000",
      salaryDay: "1",
      effectiveDate: "2026-07-01",
      notes: "QA örnek server action maaş",
    }),
  );

  expect(incomeResult.status).toBe("success");
  expect(salaryResult.status).toBe("success");
}, 15_000);

  it("creates, updates and deletes debt records through server actions", async () => {
    const createResult = await createDebtAction(
      initialFormActionState,
      makeFormData({
        type: "credit_card",
        lender: "QA Örnek Banka",
        name: "QA Örnek Server Action Kart",
        totalDebtKurus: "20000",
        balanceKurus: "15000",
        creditLimitKurus: "50000",
        interestRateMonthly: "4.25",
        minimumPaymentKurus: "1500",
        dueDay: "15",
        statementDay: "5",
        installmentCount: "",
        remainingInstallments: "",
        status: "active",
      }),
    );
    const [createdDebt] = await listDebts();
    const updateResult = await updateDebtAction(
      initialFormActionState,
      makeFormData({
        id: createdDebt.id,
        type: "credit_card",
        lender: "QA Örnek Banka",
        name: "QA Örnek Güncel Kart",
        totalDebtKurus: "20000",
        balanceKurus: "15000",
        creditLimitKurus: "50000",
        interestRateMonthly: "4.25",
        minimumPaymentKurus: "1500",
        dueDay: "16",
        statementDay: "5",
        installmentCount: "",
        remainingInstallments: "",
        status: "paused",
      }),
    );
    expect(createResult.status).toBe("success");
    expect(updateResult.status).toBe("success");
    await expect(deleteDebtAction(initialFormActionState, makeFormData({ id: createdDebt.id }))).rejects.toThrow(
      "NEXT_REDIRECT",
    );
    expect(await listDebts()).toHaveLength(0);
  });

  it("creates, updates and deletes expense records through server actions", async () => {
    const createResult = await createExpenseAction(
      initialFormActionState,
      makeFormData({
        name: "QA Örnek Server Action İnternet",
        category: "internet",
        amountKurus: "1000",
        dueDay: "10",
        isFixed: "on",
        notes: "QA örnek gider",
      }),
    );
    const [createdExpense] = await listExpenses();
    const updateResult = await updateExpenseAction(
      initialFormActionState,
      makeFormData({
        id: createdExpense.id,
        name: "QA Örnek Güncel İnternet",
        category: "internet",
        amountKurus: "1250",
        dueDay: "11",
        isFixed: "on",
        notes: "QA örnek güncel gider",
      }),
    );
    expect(createResult.status).toBe("success");
    expect(updateResult.status).toBe("success");
    await expect(deleteExpenseAction(initialFormActionState, makeFormData({ id: createdExpense.id }))).rejects.toThrow(
      "NEXT_REDIRECT",
    );
    expect(await listExpenses()).toHaveLength(0);
  });
});
