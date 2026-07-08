"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bot,
  CalendarCheck,
  ChevronLeft,
  ChevronsLeftRight,
  CreditCard,
  Landmark,
  Monitor,
  Moon,
  ReceiptText,
  Split,
  Sun,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { trCopy } from "@/lib/copy/tr";

type ThemeMode = "dark" | "light" | "system";

const navGroups = [
  {
    label: "Finansal OS",
    items: [
      { href: "/", label: "Bugün", icon: CalendarCheck },
      { href: "/plan", label: trCopy.nav.plan, icon: BarChart3 },
      { href: "/coach", label: "Koç", icon: Bot, featured: true },
      { href: "/forecast", label: "Gelecek", icon: TrendingUp },
    ],
  },
  {
    label: "Detay",
    items: [
      { href: "/decisions", label: "Kararlar", icon: Split },
    ],
  },
  {
    label: "Kayıtlar",
    items: [
      { href: "/income", label: trCopy.nav.income, icon: WalletCards },
      { href: "/expenses", label: trCopy.nav.expenses, icon: ReceiptText },
      { href: "/debts", label: trCopy.nav.debts, icon: CreditCard },
    ],
  },
];

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;

  if (mode === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.dataset.theme = mode;
  }

  root.dataset.themeMode = mode;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navItems = useMemo(() => navGroups.flatMap((group) => group.items), []);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const saved = window.localStorage.getItem("finance-theme-mode") as ThemeMode | null;
    const nextMode = saved === "dark" || saved === "light" || saved === "system" ? saved : "system";
    setThemeMode(nextMode);
    applyTheme(nextMode);
  }, []);

  function updateTheme(mode: ThemeMode) {
    setThemeMode(mode);
    window.localStorage.setItem("finance-theme-mode", mode);
    applyTheme(mode);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink transition-colors duration-300">
      <aside
        className={`fixed inset-y-0 left-0 z-20 hidden border-r border-line bg-surface/92 px-4 py-5 shadow-soft backdrop-blur-xl transition-all duration-300 lg:block ${
          isCollapsed ? "w-24" : "w-80"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between gap-3"}`}>
            <Link href="/" className="group flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-mint/30 bg-mint/10 text-mint transition group-hover:-translate-y-0.5 group-hover:shadow-panel">
                <Landmark size={22} aria-hidden="true" />
              </span>
              {!isCollapsed ? (
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">Finance OS</span>
                  <span className="block truncate text-lg font-semibold tracking-tight">{trCopy.app.brandName}</span>
                </span>
              ) : null}
            </Link>
            {!isCollapsed ? (
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-lg border border-line text-steel transition hover:border-mint/40 hover:bg-mint/10 hover:text-mint"
                onClick={() => setIsCollapsed(true)}
                aria-label="Menüyü daralt"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          {isCollapsed ? (
            <button
              type="button"
              className="mx-auto mt-5 grid h-9 w-9 place-items-center rounded-lg border border-line text-steel transition hover:border-mint/40 hover:bg-mint/10 hover:text-mint"
              onClick={() => setIsCollapsed(false)}
              aria-label="Menüyü genişlet"
            >
              <ChevronsLeftRight size={16} aria-hidden="true" />
            </button>
          ) : null}

          <nav className="mt-9 flex-1 space-y-7" aria-label={trCopy.nav.mainAria}>
            {navGroups.map((group) => (
              <div key={group.label}>
                {!isCollapsed ? (
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-steel/80">{group.label}</p>
                ) : null}
                <div className="mt-2 space-y-1.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        title={isCollapsed ? item.label : undefined}
                        className={`group relative flex items-center rounded-xl border px-3 py-2.5 text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-mint ${
                          isCollapsed ? "justify-center" : "gap-3"
                        } ${
                          isActive
                            ? "border-mint/40 bg-mint/10 text-mint shadow-panel"
                            : item.featured
                              ? "border-mint/20 bg-mint/10 text-mint hover:border-mint/40 hover:bg-mint/10"
                              : "border-transparent text-steel hover:border-line hover:bg-surface-muted hover:text-ink"
                        }`}
                      >
                        {isActive ? <span className="absolute left-0 top-2 h-6 w-0.5 rounded-full bg-mint" aria-hidden="true" /> : null}
                        <item.icon size={18} aria-hidden="true" className="shrink-0 transition group-hover:scale-105" />
                        {!isCollapsed ? <span className="truncate">{item.label}</span> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="space-y-3">
            {!isCollapsed ? (
              <Link
                href="/coach"
                className="block rounded-xl border border-mint/25 bg-mint/10 p-4 transition hover:-translate-y-0.5 hover:border-mint/45 hover:shadow-panel"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-mint text-paper">
                    <Bot size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">Koça sor</p>
                    <p className="mt-1 text-xs text-steel">Risk, aksiyon ve karar desteği</p>
                  </div>
                </div>
              </Link>
            ) : null}

            <ThemeSwitch mode={themeMode} onChange={updateTheme} collapsed={isCollapsed} />

            {!isCollapsed ? (
              <div className="rounded-xl border border-line bg-surface-muted p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-xs font-semibold text-mint">
                    OS
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Lokal Finans Profili</p>
                    <p className="text-xs text-steel">Veri cihazınızda tutulur</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <div className={`min-w-0 transition-all duration-300 ${isCollapsed ? "lg:pl-24" : "lg:pl-80"}`}>
        <header className="sticky top-0 z-10 border-b border-line bg-surface/90 px-4 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="font-semibold">
              {trCopy.app.mobileBrand}
            </Link>
            <ThemeSwitch mode={themeMode} onChange={updateTheme} compact />
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label={trCopy.nav.mobileAria}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium shadow-sm transition ${
                  pathname === item.href ? "border-mint/30 bg-mint/10 text-mint" : "border-line bg-surface-muted text-steel"
                }`}
              >
                <item.icon size={15} aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="animate-enter mx-auto min-w-0 max-w-[1520px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function ThemeSwitch({
  mode,
  onChange,
  collapsed = false,
  compact = false,
}: {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  collapsed?: boolean;
  compact?: boolean;
}) {
  const options = [
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  if (compact || collapsed) {
    const current = options.find((option) => option.value === mode) ?? options[2];
    const Icon = current.icon;
    const nextMode: Record<ThemeMode, ThemeMode> = { dark: "light", light: "system", system: "dark" };

    return (
      <button
        type="button"
        onClick={() => onChange(nextMode[mode])}
        className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface-muted text-steel transition hover:border-mint/40 hover:text-mint"
        aria-label={`Tema modu: ${current.label}`}
      >
        <Icon size={16} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface-muted p-1" aria-label="Tema seçimi">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
              isActive ? "bg-surface text-mint shadow-sm" : "text-steel hover:text-ink"
            }`}
          >
            <Icon size={14} aria-hidden="true" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
