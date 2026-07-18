"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BellRing,
  Bot,
  CalendarCheck,
  ChevronLeft,
  ChevronsLeftRight,
  CreditCard,
  History,
  Landmark,
  Menu,
  Monitor,
  Moon,
  ReceiptText,
  Split,
  Sun,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { trCopy } from "@/lib/copy/tr";
import { isNavigationItemActive } from "./navigation-state";

type ThemeMode = "dark" | "light" | "system";

const navGroups = [
  {
    label: "Finansal OS",
    items: [
      { href: "/dashboard", label: "Bugün", icon: CalendarCheck },
      { href: "/plan", label: trCopy.nav.plan, icon: BarChart3 },
      { href: "/coach", label: "Koç", icon: Bot },
      { href: "/forecast", label: "Gelecek", icon: TrendingUp },
    ],
  },
  {
    label: "Detay",
    items: [
      { href: "/decisions", label: "Kararlar", icon: Split },
      { href: "/memory", label: trCopy.nav.memory, icon: History },
      { href: "/reminders", label: trCopy.nav.reminders, icon: BellRing },
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

const demoNavGroups = [
  {
    label: "Financial OS",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: CalendarCheck },
      { href: "/plan", label: "Plan", icon: BarChart3 },
      { href: "/coach", label: "AI Coach", icon: Bot },
      { href: "/forecast", label: "Forecast", icon: TrendingUp },
    ],
  },
  {
    label: "Explore",
    items: [
      { href: "/decisions", label: "Decision Simulator", icon: Split },
      { href: "/memory", label: "Financial Memory", icon: History },
      { href: "/reminders", label: "Reminders", icon: BellRing },
    ],
  },
  {
    label: "Fictional Records",
    items: [
      { href: "/income", label: "Income", icon: WalletCards },
      { href: "/expenses", label: "Expenses", icon: ReceiptText },
      { href: "/debts", label: "Debts", icon: CreditCard },
    ],
  },
] satisfies typeof navGroups;

function shellHref(href: string, publicDemo: boolean) {
  if (!publicDemo) return href;
  return href === "/dashboard" ? "/demo" : `/demo${href}`;
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;

  if (mode === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.dataset.theme = mode;
  }

  root.dataset.themeMode = mode;
}

export function AppShell({ children, publicDemo = false }: { children: React.ReactNode; publicDemo?: boolean }) {
  const pathname = usePathname();
  const shellGroups = publicDemo ? demoNavGroups : navGroups;
  const routeTitles = new Map(shellGroups.flatMap((group) => group.items.map((item) => [shellHref(item.href, publicDemo), item.label])));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("finance-theme-mode") as ThemeMode | null;
    const nextMode = saved === "dark" || saved === "light" || saved === "system" ? saved : "system";
    setThemeMode(nextMode);
    applyTheme(nextMode);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
        return;
      }

      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [isMobileOpen]);

  function updateTheme(mode: ThemeMode) {
    setThemeMode(mode);
    window.localStorage.setItem("finance-theme-mode", mode);
    applyTheme(mode);
  }

  return (
    <div lang={publicDemo ? "en" : "tr"} className="product-shell overflow-x-hidden transition-colors duration-300">
      <a href="#product-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-3 focus:text-ink focus:shadow-panel">
        {publicDemo ? "Skip to main content" : "Ana içeriğe geç"}
      </a>
      <aside
        className={`product-sidebar fixed inset-y-0 left-0 z-20 hidden border-r border-line px-4 py-5 transition-all duration-300 lg:block ${
          isCollapsed ? "w-24" : "w-80"
        }`}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={isCollapsed}
          onCollapseChange={setIsCollapsed}
          themeMode={themeMode}
          onThemeChange={updateTheme}
          publicDemo={publicDemo}
          groups={shellGroups}
        />
      </aside>

      {isMobileOpen ? (
        <>
          <button
            type="button"
            className="product-drawer-backdrop"
            onClick={() => setIsMobileOpen(false)}
            aria-label={publicDemo ? "Close menu" : "Menüyü kapat"}
            tabIndex={-1}
          />
          <aside ref={drawerRef} className="product-drawer p-5 lg:hidden" aria-label={publicDemo ? "Mobile menu" : "Mobil menü"}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-lg font-bold tracking-tight">Atlas AI</p>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-line text-steel hover:text-ink" onClick={() => setIsMobileOpen(false)} aria-label={publicDemo ? "Close menu" : "Menüyü kapat"}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              collapsed={false}
              mobile
              onCollapseChange={setIsCollapsed}
              themeMode={themeMode}
              onThemeChange={updateTheme}
              publicDemo={publicDemo}
              groups={shellGroups}
            />
          </aside>
        </>
      ) : null}

      <div className={`min-w-0 transition-all duration-300 ${isCollapsed ? "lg:pl-24" : "lg:pl-80"}`}>
        <header className="sticky top-0 z-30 border-b border-line bg-surface/95 px-4 py-3 shadow-sm backdrop-blur-xl lg:hidden">
          <div className="flex min-h-12 items-center gap-3">
            <button ref={menuButtonRef} type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-surface-muted text-ink" onClick={() => setIsMobileOpen(true)} aria-label={publicDemo ? "Open menu" : "Menüyü aç"} aria-expanded={isMobileOpen} aria-controls="product-mobile-navigation">
              <Menu size={20} aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1">
              <Link href={publicDemo ? "/demo" : "/dashboard"} className="block truncate text-sm font-bold tracking-tight">Atlas AI</Link>
              <p className="truncate text-xs font-medium text-steel">{routeTitles.get(pathname) ?? (publicDemo ? "Public demo workspace" : "Finansal çalışma alanı")}</p>
            </div>
            <ThemeSwitch mode={themeMode} onChange={updateTheme} compact english={publicDemo} />
          </div>
        </header>
        <main id="product-main" className="product-main animate-enter">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  collapsed,
  mobile = false,
  onCollapseChange,
  themeMode,
  onThemeChange,
  publicDemo,
  groups,
}: {
  pathname: string;
  collapsed: boolean;
  mobile?: boolean;
  onCollapseChange: (collapsed: boolean) => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  publicDemo: boolean;
  groups: typeof navGroups;
}) {
  return (
    <div id={mobile ? "product-mobile-navigation" : undefined} className="flex h-full flex-col">
          <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between gap-3"}`}>
            <Link href={publicDemo ? "/demo" : "/dashboard"} className="group flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-mint/30 bg-mint/10 text-mint transition group-hover:-translate-y-0.5 group-hover:shadow-panel">
                <Landmark size={22} aria-hidden="true" />
              </span>
              {!collapsed ? (
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">Finance OS</span>
                  <span className="block truncate text-lg font-semibold tracking-tight">
                    {publicDemo ? "Control Center" : trCopy.app.brandName}
                  </span>
                </span>
              ) : null}
            </Link>
            {!collapsed && !mobile ? (
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-xl border border-line text-steel transition hover:border-mint/40 hover:bg-mint/10 hover:text-mint"
                onClick={() => onCollapseChange(true)}
                aria-label={publicDemo ? "Collapse menu" : "Menüyü daralt"}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          {collapsed && !mobile ? (
            <button
              type="button"
              className="mx-auto mt-5 grid h-11 w-11 place-items-center rounded-xl border border-line text-steel transition hover:border-mint/40 hover:bg-mint/10 hover:text-mint"
              onClick={() => onCollapseChange(false)}
              aria-label={publicDemo ? "Expand menu" : "Menüyü genişlet"}
            >
              <ChevronsLeftRight size={16} aria-hidden="true" />
            </button>
          ) : null}

          <nav className="mt-9 flex-1 space-y-7" aria-label={publicDemo ? "Demo navigation" : trCopy.nav.mainAria}>
            {groups.map((group) => (
              <div key={group.label}>
                  {!collapsed ? (
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-steel/80">{group.label}</p>
                ) : null}
                <div className="mt-2 space-y-1.5">
                  {group.items.map((item) => {
                    const href = shellHref(item.href, publicDemo);
                    const isActive = isNavigationItemActive({ pathname, itemHref: item.href, publicDemo });
                    return (
                      <Link
                        key={item.href}
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={`product-nav-link group relative flex items-center rounded-xl border px-3 py-2.5 text-[15px] font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-mint ${
                          collapsed ? "justify-center" : "gap-3"
                        } ${
                          isActive
                            ? "border-mint/40 bg-mint/10 text-mint shadow-panel"
                            : "border-transparent text-steel hover:border-line hover:bg-surface-muted hover:text-ink"
                        }`}
                      >
                        {isActive ? <span className="absolute left-0 top-2 h-6 w-0.5 rounded-full bg-mint" aria-hidden="true" /> : null}
                        <item.icon size={20} aria-hidden="true" className="shrink-0 transition group-hover:scale-105" />
                        {!collapsed ? <span className="truncate">{item.label}</span> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="space-y-3">
            {!collapsed ? (
              <Link
                href={publicDemo ? "/demo/coach" : "/coach"}
                className="block rounded-xl border border-mint/25 bg-mint/10 p-4 transition hover:-translate-y-0.5 hover:border-mint/45 hover:shadow-panel"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-mint text-paper">
                    <Bot size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{publicDemo ? "Generate a Mock AI explanation" : "Koça sor"}</p>
                    <p className="mt-1 text-xs text-steel">{publicDemo ? "No external provider or API cost" : "Risk, aksiyon ve karar desteği"}</p>
                  </div>
                </div>
              </Link>
            ) : null}

            <ThemeSwitch mode={themeMode} onChange={onThemeChange} collapsed={collapsed} english={publicDemo} />

            {!collapsed ? (
              <div className="rounded-xl border border-line bg-surface-muted p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-xs font-semibold text-mint">
                    OS
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{publicDemo ? "Fictional Profile" : "Finans Profili"}</p>
                    <p className="text-xs text-steel">{publicDemo ? "Temporary session" : "Test ve preview sürümü"}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
    </div>
  );
}

function ThemeSwitch({
  mode,
  onChange,
  collapsed = false,
  compact = false,
  english = false,
}: {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  collapsed?: boolean;
  compact?: boolean;
  english?: boolean;
}) {
  const options = [
    { value: "dark" as const, label: english ? "Dark" : "Koyu", icon: Moon },
    { value: "light" as const, label: english ? "Light" : "Açık", icon: Sun },
    { value: "system" as const, label: english ? "System" : "Sistem", icon: Monitor },
  ];

  if (compact || collapsed) {
    const current = options.find((option) => option.value === mode) ?? options[2];
    const Icon = current.icon;
    const nextMode: Record<ThemeMode, ThemeMode> = { dark: "light", light: "system", system: "dark" };

    return (
      <button
        type="button"
        onClick={() => onChange(nextMode[mode])}
        className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface-muted text-steel transition hover:border-mint/40 hover:text-mint"
        aria-label={english ? `Theme mode: ${current.label}` : `Tema modu: ${current.label}`}
      >
        <Icon size={16} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface-muted p-1" aria-label={english ? "Theme selection" : "Tema seçimi"}>
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
