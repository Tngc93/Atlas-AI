import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPostgresTestContext, type PostgresTestContext } from "@/test/postgres-test-context";

describe("PostgreSQL-backed finance data flow", () => {
  let postgresContext: PostgresTestContext;
  let disconnectPrismaForTests: () => Promise<void>;
  let createDebt: typeof import("@/features/debts/repository").createDebt;
  let updateDebt: typeof import("@/features/debts/repository").updateDebt;
  let deleteDebt: typeof import("@/features/debts/repository").deleteDebt;
  let createExpense: typeof import("@/features/expenses/repository").createExpense;
  let updateExpense: typeof import("@/features/expenses/repository").updateExpense;
  let deleteExpense: typeof import("@/features/expenses/repository").deleteExpense;
  let createSalaryRecord: typeof import("@/features/income/repository").createSalaryRecord;
  let updateSalaryRecord: typeof import("@/features/income/repository").updateSalaryRecord;
  let deleteSalaryRecord: typeof import("@/features/income/repository").deleteSalaryRecord;
  let listSalaryRecords: typeof import("@/features/income/repository").listSalaryRecords;
  let upsertProfileIncome: typeof import("@/features/income/repository").upsertProfileIncome;
  let getMonthlyFinancePlanSnapshot: typeof import("./data-service").getMonthlyFinancePlanSnapshot;
  let getFinanceSnapshot: typeof import("./data-service").getFinanceSnapshot;
  let buildForecastReport: typeof import("@/features/forecast/service").buildForecastReport;

  beforeAll(async () => {
    postgresContext = await createPostgresTestContext("finance-data");

    ({ disconnectPrismaForTests } = await import("@/lib/db/prisma"));
    ({ createDebt, updateDebt, deleteDebt } = await import("@/features/debts/repository"));
    ({ createExpense, updateExpense, deleteExpense } = await import("@/features/expenses/repository"));
    ({ createSalaryRecord, updateSalaryRecord, deleteSalaryRecord, listSalaryRecords, upsertProfileIncome } =
      await import("@/features/income/repository"));
    ({ getFinanceSnapshot, getMonthlyFinancePlanSnapshot } = await import("./data-service"));
    ({ buildForecastReport } = await import("@/features/forecast/service"));
  });

  afterAll(async () => {
    await disconnectPrismaForTests?.();
    await postgresContext?.cleanup();
  });

  it("creates, updates and deletes salary history records", async () => {
    const salaryRecord = await createSalaryRecord({
      amountKurus: 85_000_00,
      salaryDay: 1,
      effectiveDate: "2026-07-01",
      notes: "QA örnek maaş kaydı",
    });
    const updatedRecord = await updateSalaryRecord({
      id: salaryRecord.id,
      amountKurus: 90_000_00,
      salaryDay: 2,
      effectiveDate: "2026-08-01",
      notes: "QA örnek güncel maaş kaydı",
    });

    expect(updatedRecord.amountKurus).toBe(90_000_00);
    expect(await listSalaryRecords()).toHaveLength(1);

    await deleteSalaryRecord(salaryRecord.id);

    expect(await listSalaryRecords()).toHaveLength(0);
  });

  it("uses only active debts in dashboard calculations", async () => {
    await upsertProfileIncome({
      monthlySalaryKurus: 100_000_00,
      survivalThresholdKurus: 10_000_00,
      salaryDay: 1,
    });
    await createExpense({
      name: "QA Örnek Kira",
      category: "rent",
      amountKurus: 30_000_00,
      dueDay: 1,
      isFixed: true,
      notes: undefined,
    });
    await createExpense({
      name: "QA Örnek Market",
      category: "groceries",
      amountKurus: 5_000_00,
      dueDay: undefined,
      isFixed: true,
      notes: undefined,
    });
    const activeDebt = await createDebt({
      type: "credit_card",
      lender: "QA Örnek Banka",
      name: "QA Örnek Aktif Kart",
      totalDebtKurus: 20_000_00,
      balanceKurus: 20_000_00,
      creditLimitKurus: 50_000_00,
      interestRateMonthly: 4,
      minimumPaymentKurus: 2_000_00,
      dueDay: 15,
      statementDay: 5,
      installmentCount: undefined,
      remainingInstallments: undefined,
      status: "active",
    });
    const pausedDebt = await createDebt({
      type: "personal_loan",
      lender: "QA Örnek Banka",
      name: "QA Örnek Pasif Kredi",
      totalDebtKurus: 50_000_00,
      balanceKurus: 50_000_00,
      creditLimitKurus: undefined,
      interestRateMonthly: 3,
      minimumPaymentKurus: 9_000_00,
      dueDay: 16,
      statementDay: undefined,
      installmentCount: 12,
      remainingInstallments: 8,
      status: "paused",
    });
    await createDebt({
      type: "other",
      lender: "QA Örnek Alacaklı",
      name: "QA Örnek Kapanmış Borç",
      totalDebtKurus: 30_000_00,
      balanceKurus: 30_000_00,
      creditLimitKurus: undefined,
      interestRateMonthly: 1,
      minimumPaymentKurus: 8_000_00,
      dueDay: 17,
      statementDay: undefined,
      installmentCount: undefined,
      remainingInstallments: undefined,
      status: "paid_off",
    });

    const snapshot = await getMonthlyFinancePlanSnapshot(3);

    expect(snapshot.monthlyPlan.cashFlow.salaryKurus).toBe(100_000_00);
    expect(snapshot.monthlyPlan.cashFlow.mandatoryExpenseTotalKurus).toBe(35_000_00);
    expect(snapshot.monthlyPlan.cashFlow.minimumDebtPaymentsKurus).toBe(2_000_00);
    expect(snapshot.monthlyPlan.debtPriorities.map((debt) => debt.id)).toEqual([activeDebt.id]);

    await updateDebt({
      id: activeDebt.id,
      type: "credit_card",
      lender: "QA Örnek Banka",
      name: "QA Örnek Pasife Alınan Kart",
      totalDebtKurus: 20_000_00,
      balanceKurus: 20_000_00,
      creditLimitKurus: 50_000_00,
      interestRateMonthly: 4,
      minimumPaymentKurus: 2_000_00,
      dueDay: 15,
      statementDay: 5,
      installmentCount: undefined,
      remainingInstallments: undefined,
      status: "paused",
    });
    await deleteDebt(pausedDebt.id);
    const updatedSnapshot = await getMonthlyFinancePlanSnapshot(3);

    expect(updatedSnapshot.monthlyPlan.cashFlow.minimumDebtPaymentsKurus).toBe(0);
    expect(updatedSnapshot.monthlyPlan.debtPriorities).toHaveLength(0);
  });

  it("builds a deterministic forecast report from the PostgreSQL finance snapshot", async () => {
    await upsertProfileIncome({
      monthlySalaryKurus: 120_000_00,
      survivalThresholdKurus: 12_000_00,
      salaryDay: 1,
    });
    await createDebt({
      type: "credit_card",
      lender: "QA Örnek Forecast Banka",
      name: "QA Örnek Forecast Kart",
      totalDebtKurus: 12_000_00,
      balanceKurus: 12_000_00,
      creditLimitKurus: 30_000_00,
      interestRateMonthly: 4,
      minimumPaymentKurus: 1_500_00,
      dueDay: 15,
      statementDay: 5,
      installmentCount: undefined,
      remainingInstallments: undefined,
      status: "active",
    });

    const snapshot = await getFinanceSnapshot();
    const forecast = buildForecastReport(snapshot, new Date(2026, 6, 4));

    expect(forecast.checkpoints.map((checkpoint) => checkpoint.horizonMonths)).toEqual([3, 6, 12, 24]);
    expect(forecast.monthlyTrend.length).toBeGreaterThan(0);
    expect(forecast.assumptions.some((assumption) => assumption.value.includes("mock"))).toBe(false);
  });

  it("creates, updates and deletes mandatory expenses", async () => {
    const expense = await createExpense({
      name: "QA Örnek İnternet",
      category: "internet",
      amountKurus: 1_000_00,
      dueDay: 10,
      isFixed: true,
      notes: "QA örnek gider",
    });
    const updatedExpense = await updateExpense({
      id: expense.id,
      name: "QA Örnek Güncel İnternet",
      category: "internet",
      amountKurus: 1_250_00,
      dueDay: 11,
      isFixed: true,
      notes: "QA örnek güncel gider",
    });

    expect(updatedExpense.amountKurus).toBe(1_250_00);

    await deleteExpense(expense.id);
  });
});
