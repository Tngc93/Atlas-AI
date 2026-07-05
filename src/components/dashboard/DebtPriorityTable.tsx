import { formatPercent, formatTry } from "@/features/finance/money";
import type { DebtPriority } from "@/features/finance/types";
import { trCopy } from "@/lib/copy/tr";

const interestSourceLabels: Record<string, string> = {
  manual: "Manuel",
  tcmb_contractual: "TCMB akdi",
  tcmb_overdue: "TCMB gecikme",
  cached_contractual: "Önbellek akdi",
  cached_overdue: "Önbellek gecikme",
  fallback_contractual: "Fallback/örnek",
  fallback_overdue: "Fallback gecikme",
  missing: "Faiz eksik",
};

export function DebtPriorityTable({ debts }: { debts: DebtPriority[] }) {
  if (debts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/15 bg-white p-5 text-sm text-ink/60">
        Henüz aktif borç kaydı yok. Borç eklediğinizde öncelik sırası burada görünecek.
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-lg border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-[0.12em] text-ink/55">
          <tr>
            <th className="px-4 py-3">{trCopy.table.rank}</th>
            <th className="px-4 py-3">{trCopy.table.debt}</th>
            <th className="px-4 py-3">{trCopy.table.balance}</th>
            <th className="px-4 py-3">{trCopy.table.monthlyRate}</th>
            <th className="px-4 py-3">{trCopy.table.interestSource}</th>
            <th className="px-4 py-3">{trCopy.table.minimum}</th>
            <th className="px-4 py-3">{trCopy.table.recommendedPayment}</th>
            <th className="px-4 py-3">{trCopy.table.endingBalance}</th>
            <th className="px-4 py-3">{trCopy.table.due}</th>
            <th className="px-4 py-3">{trCopy.table.dueStatus}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {debts.map((debt) => (
            <tr key={debt.id}>
              <td className="px-4 py-3 font-semibold text-mint">#{debt.priorityRank}</td>
              <td className="px-4 py-3">
                <span className="block font-medium text-ink">{debt.name}</span>
                <span className="block text-xs text-ink/55">{debt.lender}</span>
              </td>
              <td className="px-4 py-3">{formatTry(debt.balanceKurus)}</td>
              <td className="px-4 py-3">{formatPercent(debt.interestRateMonthly)}</td>
              <td className="px-4 py-3">
                <span className="block text-xs font-semibold text-steel">
                  {interestSourceLabels[debt.interestRateSource ?? "missing"] ?? "Bilinmiyor"}
                </span>
                {debt.interestRateNote ? <span className="mt-1 block max-w-44 text-xs text-ink/50">{debt.interestRateNote}</span> : null}
              </td>
              <td className="px-4 py-3">{formatTry(debt.minimumPaymentKurus)}</td>
              <td className="px-4 py-3 font-medium text-mint">{formatTry(debt.recommendedPaymentKurus ?? 0)}</td>
              <td className="px-4 py-3">{formatTry(debt.projectedEndingBalanceKurus ?? debt.balanceKurus)}</td>
              <td className="px-4 py-3">{trCopy.table.day} {debt.dueDay}</td>
              <td className="px-4 py-3">
                {debt.dueDateStatus ? trCopy.dueStatus[debt.dueDateStatus] : trCopy.dueStatus.safe}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
