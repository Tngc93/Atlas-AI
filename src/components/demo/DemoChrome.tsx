"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, RotateCcw, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useDemoFinance } from "@/features/demo/store";

type DemoDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
};

function DemoDialog({ open, title, description, onClose, initialFocusRef, children }: DemoDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
    document.body.style.overflow = "hidden";
    (initialFocusRef?.current ?? focusable?.[0])?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
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
      previousFocus?.focus();
    };
  }, [initialFocusRef, onClose, open]);

  if (!open || typeof document === "undefined") return null;
  const titleId = `demo-dialog-${title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;
  const descriptionId = `${titleId}-description`;

  return createPortal(
    <div className="demo-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="demo-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <button type="button" className="demo-dialog-close" aria-label="Close dialog" onClick={onClose}><X aria-hidden size={20} /></button>
        <p className="demo-dialog-kicker">Atlas AI · Public Demo</p>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId} className="demo-dialog-description">{description}</p>
        {children}
      </div>
    </div>,
    document.body,
  );
}

const safetyBoundaries = [
  ["Synthetic Data", "Every value and financial record is fictional."],
  ["Session Isolated", "Changes exist only in this browser tab's current in-memory session."],
  ["No Persistence", "Refresh, reset or a new browser context restores the original fictional seed."],
  ["Mock AI", "No platform-owned external AI provider or paid API key is called."],
] as const;

export function DemoChrome({ children }: { children: ReactNode }) {
  const { resetDemo, resetGeneration } = useDemoFinance();
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [showSafety, setShowSafety] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);
  const resetConfirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!resetNotice) return;
    const timeout = window.setTimeout(() => setResetNotice(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [resetNotice]);

  function confirmReset() {
    resetDemo();
    setShowReset(false);
    setResetNotice(true);
    router.replace("/demo");
  }

  return (
    <>
      <div className="demo-control-bar" aria-label="Public demo controls">
        <button
          type="button"
          className="demo-mode-indicator"
          onClick={() => setShowSafety(true)}
          aria-haspopup="dialog"
          aria-label="Public Demo. Fictional data. Temporary session. Open demo safety information."
        >
          <ShieldCheck aria-hidden size={18} />
          <span><strong>Public Demo</strong><small>Fictional data · Temporary session</small></span>
          <Info aria-hidden size={17} />
        </button>
        <button type="button" data-testid="reset-demo-data" className="demo-reset-button" onClick={() => setShowReset(true)} aria-haspopup="dialog">
          <RotateCcw size={17} aria-hidden /> Reset Demo
        </button>
      </div>

      {resetNotice ? <p className="demo-status" role="status"><CheckCircle2 aria-hidden size={18} /> Original fictional data restored. All temporary demo changes were cleared. <span className="sr-only">Reset number {resetGeneration}.</span></p> : null}

      {showIntro ? (
        <section className="demo-onboarding" data-testid="demo-onboarding" aria-labelledby="demo-onboarding-title">
          <div>
            <p>Public Demo · Safe exploration</p>
            <h1 id="demo-onboarding-title">Explore Atlas AI safely.</h1>
            <p>This public demo uses fictional financial data and temporary in-memory state. Nothing is connected to a bank, stored in a database or retained after the session ends.</p>
          </div>
          <div className="demo-onboarding-actions">
            <button type="button" onClick={() => setShowIntro(false)} className="demo-primary-action">Start Exploring</button>
            <button type="button" onClick={() => setShowSafety(true)} className="demo-secondary-action">How the Demo Works</button>
          </div>
          <p className="demo-onboarding-note">No real AI API key · No persistence · Not financial advice</p>
        </section>
      ) : null}

      {children}

      <DemoDialog
        open={showSafety}
        onClose={() => setShowSafety(false)}
        title="How the public demo works"
        description="A controlled environment for understanding Atlas AI without submitting personal financial information."
      >
        <div className="demo-safety-grid">
          {safetyBoundaries.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><strong>{title}</strong><p>{copy}</p></article>)}
        </div>
        <div className="demo-safety-limits">
          <strong>Also outside this demo</strong>
          <p>No bank or financial account connection, personal-data processing, investment execution, email, SMS or push notification. Illustrative results are educational and carry no advice guarantee.</p>
        </div>
        <div className="demo-dialog-actions">
          <button type="button" className="demo-primary-action" onClick={() => setShowSafety(false)}>Continue Exploring</button>
          <Link href="/docs/demo-mode" className="demo-secondary-action">Read Demo Documentation</Link>
        </div>
      </DemoDialog>

      <DemoDialog
        open={showReset}
        onClose={() => setShowReset(false)}
        title="Reset the public demo?"
        description="This will remove all temporary changes and restore the original fictional data. Nothing outside this browser session is affected."
        initialFocusRef={resetConfirmRef}
      >
        <div className="demo-dialog-actions demo-reset-actions">
          <button type="button" className="demo-secondary-action" onClick={() => setShowReset(false)}>Cancel</button>
          <button ref={resetConfirmRef} type="button" className="demo-danger-action" onClick={confirmReset}>Reset Demo</button>
        </div>
      </DemoDialog>
    </>
  );
}
