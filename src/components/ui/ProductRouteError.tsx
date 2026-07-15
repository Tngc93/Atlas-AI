"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";

export function ProductRouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <AppShell>
      <section role="alert" className="ui-card mx-auto max-w-3xl">
        <span className="grid h-12 w-12 place-items-center rounded-xl border border-coral/30 bg-coral/10 text-coral">
          <AlertTriangle size={22} aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-coral">Güvenli hata durumu</p>
        <h1 className="product-page-title mt-2">Bu çalışma alanı şu anda yüklenemedi</h1>
        <p className="product-body-copy mt-4">
          Kayıtlarınıza veya sağlayıcı yanıtlarına ait ham ayrıntılar gösterilmedi. Bağlantıyı kontrol edip güvenli biçimde tekrar deneyebilirsiniz.
        </p>
        <button type="button" onClick={reset} className="ui-primary-button mt-6">
          <RotateCcw size={19} aria-hidden="true" />
          Tekrar dene
        </button>
      </section>
    </AppShell>
  );
}
