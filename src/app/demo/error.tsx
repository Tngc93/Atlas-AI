"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDemoFinance } from "@/features/demo/store";

export default function DemoError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { resetDemo } = useDemoFinance();
  const router = useRouter();

  function restoreDemo() {
    resetDemo();
    router.replace("/demo");
    reset();
  }

  return (
    <section className="ui-card mx-auto max-w-3xl py-12 text-center" role="alert">
      <AlertCircle aria-hidden className="mx-auto text-mint" size={40} />
      <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-mint">Public demo recovery</p>
      <h1 className="mt-2 text-3xl font-bold">The temporary demo could not be rendered.</h1>
      <p className="mx-auto mt-4 max-w-xl leading-7 text-steel">No personal information or persistent record was created. Restore the original fictional seed and continue from a safe route.</p>
      <button type="button" onClick={restoreDemo} className="ui-button-primary mt-6"><RotateCcw aria-hidden size={17} /> Reset Demo</button>
    </section>
  );
}
