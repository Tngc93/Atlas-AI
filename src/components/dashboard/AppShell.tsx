import Link from "next/link";
import { BarChart3, CreditCard, Home, Landmark, ReceiptText, Split, TrendingUp, WalletCards } from "lucide-react";
import { trCopy } from "@/lib/copy/tr";

const navItems = [
  { href: "/", label: trCopy.nav.dashboard, icon: Home },
  { href: "/income", label: trCopy.nav.income, icon: WalletCards },
  { href: "/debts", label: trCopy.nav.debts, icon: CreditCard },
  { href: "/expenses", label: trCopy.nav.expenses, icon: ReceiptText },
  { href: "/plan", label: trCopy.nav.plan, icon: BarChart3 },
  { href: "/decisions", label: trCopy.nav.decisions, icon: Split },
  { href: "/forecast", label: trCopy.nav.forecast, icon: TrendingUp },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-ink/10 bg-white/85 px-5 py-6 shadow-soft backdrop-blur lg:block">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-mint text-white">
            <Landmark size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-steel">{trCopy.app.brandKicker}</span>
            <span className="block text-lg font-semibold">{trCopy.app.brandName}</span>
          </span>
        </Link>
        <nav className="mt-10 space-y-2" aria-label={trCopy.nav.mainAria}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink/75 transition hover:bg-ink/5 hover:text-ink focus:outline-none focus:ring-2 focus:ring-mint"
            >
              <item.icon size={18} aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-10 rounded-md border border-amber/25 bg-amber/10 p-3 text-xs leading-5 text-ink/70">
          {trCopy.app.sidebarNote}
        </p>
      </aside>
      <div className="min-w-0 lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-ink/10 bg-paper/90 px-4 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-semibold">
              {trCopy.app.mobileBrand}
            </Link>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label={trCopy.nav.mobileAria}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-medium shadow-sm"
              >
                <item.icon size={15} aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto min-w-0 max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
