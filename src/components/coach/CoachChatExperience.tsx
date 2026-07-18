"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Bot, CircleAlert, Eraser, Languages, MessageSquarePlus, RotateCcw, Send, Sparkles, User } from "lucide-react";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { buildMockCoachChatResponse } from "@/features/coach/mock-chat";
import { formatCoachTry } from "@/features/coach/chat-response";
import type { CoachChatResponse, CoachFinancialSnapshot, CoachLanguage } from "@/features/coach/types";

type ChatMessage =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: CoachChatResponse };

type ProviderPresentation = {
  label: string;
  available: boolean;
  isMock: boolean;
};

const copy = {
  en: {
    greeting: "Good to see you, Alex.",
    ready: "Your financial snapshot is ready.",
    intro: "Ask a focused question and Atlas AI will explain the deterministic result without changing it.",
    income: "Monthly income",
    debt: "Total debt",
    expenses: "Monthly expenses",
    balance: "Available balance",
    risk: "Current risk",
    placeholder: "Ask anything about your finances...",
    send: "Send question",
    newChat: "New Chat",
    clear: "Clear Chat",
    suggestions: "Suggested questions",
    summary: "Summary",
    recommendation: "Decision support",
    riskLabel: "Risk context",
    nextAction: "Next action",
    keyNumbers: "Key numbers",
    followUps: "Related questions",
    error: "The coach response could not be prepared. Your calculations remain available.",
    retry: "Retry",
    unavailable: "No server-side AI provider is configured. Deterministic financial views remain available.",
    safety: "AI explanations do not change the calculations produced by the finance engine.",
    demoSafety: "Fictional data · Simulated AI response · No external AI request · No API key required",
    selfHostSafety: "Provider calls use the configured server-side integration. API credentials are never exposed to the browser.",
    processing: ["Reading your financial snapshot", "Reviewing income and expenses", "Checking debt priorities", "Preparing a recommendation"],
  },
  tr: {
    greeting: "Merhaba.",
    ready: "Finansal özetiniz hazır.",
    intro: "Odaklı bir soru sorun; Atlas AI deterministik sonucu değiştirmeden açıklasın.",
    income: "Aylık gelir",
    debt: "Toplam borç",
    expenses: "Aylık gider",
    balance: "Kullanılabilir bakiye",
    risk: "Mevcut risk",
    placeholder: "Finansınız hakkında bir soru sorun...",
    send: "Soruyu gönder",
    newChat: "Yeni sohbet",
    clear: "Sohbeti temizle",
    suggestions: "Örnek sorular",
    summary: "Özet",
    recommendation: "Karar desteği",
    riskLabel: "Risk bağlamı",
    nextAction: "Sıradaki adım",
    keyNumbers: "Önemli sayılar",
    followUps: "İlgili sorular",
    error: "Koç yanıtı hazırlanamadı. Hesaplama sonuçlarınız kullanılmaya devam eder.",
    retry: "Tekrar dene",
    unavailable: "Sunucu tarafında bir AI sağlayıcısı yapılandırılmamış. Deterministik finans ekranları kullanılabilir.",
    safety: "AI açıklamaları finans motorunun ürettiği hesaplamaları değiştirmez.",
    demoSafety: "Kurgusal veri · Simüle AI yanıtı · Dış AI isteği yok · API anahtarı gerekmez",
    selfHostSafety: "Sağlayıcı çağrıları yalnız sunucuda yapılandırılmış entegrasyondan yapılır. API anahtarları tarayıcıya gösterilmez.",
    processing: ["Finansal özet okunuyor", "Gelir ve giderler inceleniyor", "Borç öncelikleri kontrol ediliyor", "Açıklama hazırlanıyor"],
  },
} as const;

const suggestions: Record<CoachLanguage, string[]> = {
  en: [
    "Which debt should I pay first?",
    "Can I save ₺20,000 per month?",
    "What happens if my income drops by 20%?",
    "How can I reduce my monthly expenses?",
    "Explain my financial health.",
    "Can I afford a major purchase?",
  ],
  tr: [
    "Önce hangi borcu ödemeliyim?",
    "Ayda ₺20.000 biriktirebilir miyim?",
    "Gelirim %20 azalırsa ne olur?",
    "Aylık giderlerimi nasıl azaltabilirim?",
    "Finansal durumumu açıklar mısın?",
    "Büyük bir satın almayı karşılayabilir miyim?",
  ],
};

function riskText(level: CoachFinancialSnapshot["riskLevel"], language: CoachLanguage) {
  if (language === "en") return level === "high" ? "High" : level === "medium" ? "Medium" : "Low";
  return level === "high" ? "Yüksek" : level === "medium" ? "Orta" : "Düşük";
}

function AssistantResponse({ response, language, onFollowUp }: { response: CoachChatResponse; language: CoachLanguage; onFollowUp: (question: string) => void }) {
  const labels = copy[language];
  return (
    <article className="max-w-3xl rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6" aria-label={language === "en" ? "AI Coach response" : "AI Koç yanıtı"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink"><span className="grid h-8 w-8 place-items-center rounded-lg bg-mint/10 text-mint"><Sparkles size={16} aria-hidden /></span>Atlas AI Coach</div>
        <span className="rounded-full border border-mint/25 bg-mint/10 px-2.5 py-1 text-xs font-semibold text-mint">{response.providerLabel}</span>
      </div>
      <div className="mt-5 space-y-5">
        <ResponseSection title={labels.summary} text={response.summary} />
        <div className="rounded-xl border border-mint/25 bg-mint/10 p-4"><ResponseSection title={labels.recommendation} text={response.recommendation} /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-amber/25 bg-amber/10 p-4"><ResponseSection title={labels.riskLabel} text={response.risk} /></div>
          <div className="rounded-xl border border-line bg-surface-muted p-4"><ResponseSection title={labels.nextAction} text={response.nextAction} /></div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">{labels.keyNumbers}</h3>
          <dl className="mt-3 grid gap-2 sm:grid-cols-3">{response.keyNumbers.map((item) => <div key={item.label} className="rounded-lg border border-line bg-surface-muted px-3 py-3"><dt className="text-xs text-steel">{item.label}</dt><dd className="mt-1 font-semibold text-ink">{item.value}</dd></div>)}</dl>
        </div>
        {response.followUps.length ? <div><h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">{labels.followUps}</h3><div className="mt-3 flex flex-wrap gap-2">{response.followUps.map((question) => <button key={question} type="button" onClick={() => onFollowUp(question)} className="rounded-full border border-line bg-surface-muted px-3 py-2 text-left text-xs font-semibold text-steel transition hover:border-mint/40 hover:text-ink">{question}</button>)}</div></div> : null}
      </div>
    </article>
  );
}

function ResponseSection({ title, text }: { title: string; text: string }) {
  return <div><h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">{title}</h3><p className="mt-2 text-sm font-medium leading-6 text-ink">{text}</p></div>;
}

export function CoachChatExperience({
  mode,
  financialSnapshot,
  provider,
  defaultLanguage,
}: {
  mode: "demo" | "self-host";
  financialSnapshot: CoachFinancialSnapshot;
  provider: ProviderPresentation;
  defaultLanguage: CoachLanguage;
}) {
  const [language, setLanguage] = useState<CoachLanguage>(defaultLanguage);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [processingStage, setProcessingStage] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reducedMotion = useReducedMotion();
  const labels = copy[language];
  const isProcessing = processingStage !== null;
  const canSubmit = mode === "demo" || provider.available;
  const snapshotCards = useMemo(() => [
    [labels.income, formatCoachTry(financialSnapshot.monthlyIncomeKurus, language)],
    [labels.debt, formatCoachTry(financialSnapshot.totalDebtKurus, language)],
    [labels.expenses, formatCoachTry(financialSnapshot.monthlyExpensesKurus, language)],
    [labels.balance, formatCoachTry(financialSnapshot.availableMonthlyBalanceKurus, language)],
    [labels.risk, riskText(financialSnapshot.riskLevel, language)],
  ], [financialSnapshot, labels, language]);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" }); }, [messages, processingStage, reducedMotion]);

  function resetChat(focus = true) {
    abortRef.current?.abort();
    setMessages([]);
    setDraft("");
    setError(false);
    setProcessingStage(null);
    setLastQuestion("");
    if (focus) requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function submitQuestion(question: string, appendUser = true) {
    const cleanQuestion = question.trim().slice(0, 500);
    if (!cleanQuestion || isProcessing || !canSubmit) return;
    setError(false);
    setLastQuestion(cleanQuestion);
    setDraft("");
    if (appendUser) setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", content: cleanQuestion }]);
    setProcessingStage(0);

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    try {
      await Promise.resolve();
      setProcessingStage(1);
      if (mode === "demo" && !reducedMotion) await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      setProcessingStage(2);

      let response: CoachChatResponse;
      if (mode === "demo") {
        response = buildMockCoachChatResponse(cleanQuestion, financialSnapshot, language);
      } else {
        setProcessingStage(3);
        const request = await fetch("/api/coach", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ question: cleanQuestion, language }),
          signal: controller.signal,
        });
        if (!request.ok) throw new Error("coach_request_failed");
        response = (await request.json()) as CoachChatResponse;
      }

      if (!controller.signal.aborted) setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: response }]);
    } catch (requestError) {
      if (!(requestError instanceof DOMException && requestError.name === "AbortError")) setError(true);
    } finally {
      if (!controller.signal.aborted) setProcessingStage(null);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(draft);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitQuestion(draft);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm" data-testid="coach-chat-experience">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-mint/25 bg-mint/10 px-2.5 py-1 text-xs font-semibold text-mint">{mode === "demo" ? (language === "en" ? "Mock AI · Demo Mode" : "Mock AI · Demo Modu") : provider.label}</span>{mode === "self-host" && !provider.available ? <span className="text-xs font-semibold text-coral">{labels.unavailable}</span> : null}</div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="coach-language">{language === "en" ? "Response language" : "Yanıt dili"}</label>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-muted px-2"><Languages size={15} aria-hidden className="text-steel" /><select id="coach-language" value={language} onChange={(event) => setLanguage(event.target.value as CoachLanguage)} className="h-10 bg-transparent text-sm font-semibold text-ink outline-none"><option value="en">English</option><option value="tr">Türkçe</option></select></div>
          <button type="button" onClick={() => resetChat()} className="ui-secondary-button min-h-10 px-3 py-2 text-sm"><MessageSquarePlus size={16} aria-hidden />{labels.newChat}</button>
          <button type="button" onClick={() => resetChat(false)} disabled={messages.length === 0} className="ui-secondary-button min-h-10 px-3 py-2 text-sm"><Eraser size={16} aria-hidden />{labels.clear}</button>
        </div>
      </header>

      <div className="max-h-[680px] min-h-[430px] overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-5xl py-2 sm:py-6">
            <div className="text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-mint/25 bg-mint/10 text-mint"><Bot size={24} aria-hidden /></span><p className="mt-4 text-sm font-semibold text-mint">{labels.greeting}</p><h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{labels.ready}</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-steel sm:text-base">{labels.intro}</p></div>
            <dl className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-5">{snapshotCards.map(([label, value]) => <div key={label} className="min-w-0 rounded-xl border border-line bg-surface-muted p-3"><dt className="text-xs font-medium text-steel">{label}</dt><dd className="mt-2 truncate text-base font-semibold text-ink" title={value}>{value}</dd></div>)}</dl>
            <div className="mt-7"><p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-steel">{labels.suggestions}</p><div className="mt-3 flex flex-wrap justify-center gap-2">{suggestions[language].map((question) => <button key={question} type="button" onClick={() => void submitQuestion(question)} disabled={!canSubmit} className="rounded-full border border-line bg-surface-muted px-3.5 py-2.5 text-sm font-semibold text-steel transition hover:border-mint/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50">{question}</button>)}</div></div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-5xl flex-col gap-5">{messages.map((message) => message.role === "user" ? <div key={message.id} className="ml-auto flex max-w-2xl items-start gap-2"><div className="rounded-2xl rounded-tr-md bg-mint px-4 py-3 text-sm font-medium leading-6 text-paper">{message.content}</div><span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-surface-muted text-steel"><User size={15} aria-hidden /></span></div> : <AssistantResponse key={message.id} response={message.content} language={language} onFollowUp={(question) => void submitQuestion(question)} />)}
            {isProcessing ? <div className="flex items-center gap-3 text-sm font-semibold text-steel" role="status"><span className={`h-4 w-4 rounded-full border-2 border-line border-t-mint ${reducedMotion ? "" : "animate-spin"}`} aria-hidden />{labels.processing[processingStage ?? 0]}</div> : null}
            {error ? <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-ink"><span className="flex items-center gap-2"><CircleAlert size={17} aria-hidden className="text-coral" />{labels.error}</span><button type="button" onClick={() => void submitQuestion(lastQuestion, false)} className="ui-secondary-button min-h-10 px-3 py-2 text-sm"><RotateCcw size={15} aria-hidden />{labels.retry}</button></div> : null}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-line bg-surface-muted/40 p-4 sm:p-5">
        <form onSubmit={submit} className="mx-auto flex max-w-5xl items-end gap-2">
          <label htmlFor="coach-question" className="sr-only">{labels.placeholder}</label>
          <textarea ref={inputRef} id="coach-question" rows={2} maxLength={500} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} disabled={!canSubmit || isProcessing} placeholder={labels.placeholder} className="ui-input min-h-[56px] flex-1 resize-none" />
          <button type="submit" disabled={!draft.trim() || !canSubmit || isProcessing} className="ui-primary-button h-14 w-14 shrink-0 px-0" aria-label={labels.send}><Send size={19} aria-hidden /></button>
        </form>
        <div className="mx-auto mt-3 flex max-w-5xl flex-col gap-1 text-xs font-medium leading-5 text-steel"><p>{labels.safety}</p><p>{mode === "demo" ? labels.demoSafety : labels.selfHostSafety}</p></div>
      </div>
    </section>
  );
}
