"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpenText, CodeXml, Menu, X } from "lucide-react";

const GITHUB_URL = "https://github.com/Tngc93/personal-finance-coach-dashboard";

const navigation = [
  ["Product", "/product"],
  ["Architecture", "/architecture"],
  ["Demo", "/demo"],
  ["Documentation", "/docs"],
] as const;

const footerGroups = [
  { title: "Product", links: [["Dashboard", "/product/dashboard"], ["Forecast", "/product/forecast"], ["Decision Simulator", "/product/decision-simulator"], ["Financial Memory", "/product/financial-memory"], ["Demo", "/demo"]] },
  { title: "Architecture", links: [["Finance Engine", "/architecture/finance-engine"], ["Repository", "/architecture/repository"], ["Database", "/architecture/database"], ["AI Provider Registry", "/architecture/ai-provider-registry"], ["Self Hosting", "/architecture/self-hosting"]] },
  { title: "Resources", links: [["Documentation", "/docs"], ["Getting Started", "/docs/getting-started"], ["FAQ", "/docs/faq"], ["API Overview", "/docs/api-overview"]] },
  { title: "Open Source", links: [["GitHub", "/github"], ["Security", "/security"], ["Contributing", "/contributing"], ["Roadmap", "/roadmap"], ["Repository", GITHUB_URL]] },
  { title: "Legal", links: [["MIT License", "/license"]] },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader({ landing = false }: { landing?: boolean }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setIsMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const menu = menuRef.current;
    const trigger = triggerRef.current;
    const focusable = menu
      ?.querySelector<HTMLElement>("#public-mobile-navigation")
      ?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
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

    function handlePointerDown(event: PointerEvent) {
      if (!menu?.contains(event.target as Node) && event.target !== trigger) setIsMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      trigger?.focus();
    };
  }, [isMobileOpen]);

  return (
    <header className={`landing-header atlas-glass${landing ? " hero-nav-reveal" : " public-header"}`}>
      <Link href="/" className="landing-logo" aria-label="Atlas AI home"><span>A</span> Atlas AI</Link>
      <nav aria-label="Primary navigation" className="landing-nav">
        {navigation.map(([label, href]) => <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined}>{label}</Link>)}
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
      </nav>
      <Link href="/demo" className="landing-header-cta" aria-current={pathname.startsWith("/demo") ? "page" : undefined}>Try Demo <ArrowRight aria-hidden size={20} /></Link>
      <div className="landing-mobile-menu" ref={menuRef}>
        <button
          ref={triggerRef}
          type="button"
          className="landing-mobile-trigger"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
          aria-controls="public-mobile-navigation"
          onClick={() => setIsMobileOpen((open) => !open)}
        >
          {isMobileOpen ? <X aria-hidden size={21} /> : <Menu aria-hidden size={21} />}
        </button>
        {isMobileOpen ? (
          <nav id="public-mobile-navigation" aria-label="Mobile navigation" className="atlas-glass-strong">
            {navigation.map(([label, href]) => <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined}>{label}</Link>)}
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        ) : null}
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="landing-footer" data-landing-reveal>
      <div className="landing-footer-grid">
        <div className="landing-footer-brand">
          <Link href="/" className="landing-logo" aria-label="Atlas AI home"><span>A</span> Atlas AI</Link>
          <p>Open-source financial intelligence with deterministic reasoning and infrastructure you control.</p>
          <span>Open source. Self-hostable. Provider-independent.</span>
        </div>
        {footerGroups.map((group) => (
          <nav className="landing-footer-group" aria-label={`${group.title} links`} key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map(([label, href]) => href.startsWith("http")
              ? <a href={href} target="_blank" rel="noreferrer" key={label}>{label}</a>
              : <Link href={href} key={label}>{label}</Link>)}
          </nav>
        ))}
      </div>
      <div className="landing-footer-bottom">
        <div><span>© 2026 Atlas AI</span><span>MIT Licensed</span></div>
        <div className="landing-footer-icons">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Atlas AI on GitHub"><CodeXml aria-hidden /></a>
          <Link href="/docs" aria-label="Atlas AI documentation"><BookOpenText aria-hidden /></Link>
        </div>
      </div>
    </footer>
  );
}
