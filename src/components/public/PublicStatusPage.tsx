"use client";

import Link from "next/link";
import { ArrowLeft, BookOpenText, GitFork, RefreshCcw, Search, WifiOff } from "lucide-react";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { PublicFooter, PublicHeader } from "@/components/public/PublicChrome";

const GITHUB_URL = "https://github.com/Tngc93/personal-finance-coach-dashboard";

type PublicStatusPageProps = {
  kind: "not-found" | "error" | "offline";
  onRetry?: () => void;
};

const content = {
  "not-found": {
    code: "404",
    eyebrow: "Route not found",
    title: "This path is outside the Atlas.",
    description: "Check the address or continue through one of the verified public destinations below.",
  },
  error: {
    code: "500",
    eyebrow: "Public route unavailable",
    title: "This page could not be rendered safely.",
    description: "No sensitive details were exposed. Retry the request or continue to a stable public destination.",
  },
  offline: {
    code: "OFFLINE",
    eyebrow: "Network unavailable",
    title: "Atlas AI needs a connection for this route.",
    description: "Reconnect, then retry. No form data or credentials are collected by this public status page.",
  },
} as const;

export function PublicStatusPage({ kind, onRetry }: PublicStatusPageProps) {
  const state = content[kind];
  return (
    <div lang="en" className="landing-root public-site public-status-page overflow-x-clip text-white">
      <a className="landing-skip" href="#public-status-content">Skip to main content</a>
      <LandingMotion />
      <PublicHeader />
      <main id="public-status-content" className="public-status-main">
      <section className="public-status-card atlas-glass-strong" aria-labelledby="public-status-title">
        <span className="public-status-code">{state.code}</span>
        {kind === "offline" ? <WifiOff aria-hidden /> : <Search aria-hidden />}
        <p>{state.eyebrow}</p>
        <h1 id="public-status-title">{state.title}</h1>
        <p>{state.description}</p>
        <div className="public-status-actions">
          {onRetry ? <button type="button" className="landing-button landing-button-primary atlas-glass-strong" onClick={onRetry}><RefreshCcw aria-hidden /> Retry</button> : null}
          <Link href="/" className="landing-button landing-button-primary atlas-glass-strong"><ArrowLeft aria-hidden /> Back to Home</Link>
          <Link href="/docs" className="landing-button landing-button-secondary atlas-glass"><BookOpenText aria-hidden /> Documentation</Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="landing-button landing-button-secondary atlas-glass"><GitFork aria-hidden /> GitHub</a>
        </div>
        <nav aria-label="Suggested destinations" className="public-status-suggestions">
          <span>Looking for:</span>
          <Link href="/product">Product</Link>
          <Link href="/architecture">Architecture</Link>
          <Link href="/docs/getting-started">Getting Started</Link>
        </nav>
      </section>
      </main>
      <PublicFooter />
    </div>
  );
}
