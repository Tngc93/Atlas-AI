import { AppShell } from "@/components/dashboard/AppShell";
import { DebtCrudPanel } from "@/components/forms/DebtCrudPanel";
import { PageNotice } from "@/components/forms/PageNotice";
import { listDebts } from "@/features/debts/repository";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  debtDeleted: "Borç kaydı silindi.",
};

export default async function DebtsPage({ searchParams }: { searchParams?: Promise<{ notice?: string }> }) {
  const params = await searchParams;
  const debts = await listDebts();
  const debtFormModels = debts.map((debt) => ({
    id: debt.id,
    type: debt.type,
    name: debt.name,
    lender: debt.lender,
    totalDebtKurus: debt.totalDebtKurus,
    balanceKurus: debt.balanceKurus,
    creditLimitKurus: debt.creditLimitKurus,
    interestRateMonthly: debt.manualInterestRateMonthly?.toString() ?? "",
    resolvedInterestRateMonthly: debt.resolvedInterestRateMonthly.toString(),
    interestRateSource: debt.interestRateSource,
    interestRateResolvedAt: debt.interestRateResolvedAt?.toISOString() ?? null,
    interestRateNote: debt.interestRateNote,
    minimumPaymentKurus: debt.minimumPaymentKurus,
    dueDay: debt.dueDay,
    statementDay: debt.statementDay,
    installmentCount: debt.installmentCount,
    remainingInstallments: debt.remainingInstallments,
    status: debt.status,
  }));

  return (
    <AppShell>
      <PageNotice message={params?.notice ? noticeMessages[params.notice] : undefined} />
      <DebtCrudPanel debts={debtFormModels} />
    </AppShell>
  );
}
