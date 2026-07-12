"use client";

import Link from "next/link";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useDemoFinance } from "@/features/demo/store";

const repositoryUrl = "https://github.com/Tngc93/personal-finance-coach-dashboard";

export function DemoChrome({ children }: { children: ReactNode }) {
  const { dispatch } = useDemoFinance();
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-mint/30 bg-mint/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-mint px-2.5 py-1 text-xs font-semibold text-white">
            <ShieldCheck size={14} aria-hidden="true" /> Demo Mode
          </span>
          <p className="text-sm text-steel">Kurgusal veriler kullanılır. Değişiklikler kalıcı değildir.</p>
        </div>
        <button
          type="button"
          data-testid="reset-demo-data"
          onClick={() => dispatch({ type: "reset" })}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink transition hover:border-mint/40"
        >
          <RotateCcw size={15} aria-hidden="true" /> Demo verisini sıfırla
        </button>
      </div>

      {showIntro ? (
        <section className="mb-6 rounded-lg border border-line bg-surface p-5 shadow-sm" data-testid="demo-onboarding">
          <p className="text-xs font-semibold uppercase text-mint">Open-source AI Financial Intelligence Platform</p>
          <h1 className="mt-2 text-xl font-semibold">Bring your own AI. Bring your own Database. Deploy anywhere.</h1>
          <div className="mt-3 space-y-1 text-sm leading-6 text-steel">
            <p>Bu demo yalnız kurgusal veriler kullanır. Girdiğiniz değişiklikler kalıcı değildir.</p>
            <p>Gerçek finansal bilgi girmeyin. AI yorumları örnek çıktılardır ve finansal tavsiye değildir.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowIntro(false)} className="rounded-md bg-mint px-3 py-2 text-sm font-semibold text-white">
              Demo’yu keşfet
            </button>
            <a href={repositoryUrl} target="_blank" rel="noreferrer" className="rounded-md border border-line px-3 py-2 text-sm font-semibold">
              GitHub’da görüntüle
            </a>
            <Link href="/demo#self-host" className="rounded-md border border-line px-3 py-2 text-sm font-semibold">
              Kendi ortamında kur
            </Link>
          </div>
        </section>
      ) : null}

      {children}
    </>
  );
}
