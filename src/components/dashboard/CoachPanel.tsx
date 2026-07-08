import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { CoachInsight } from "@/features/coach/types";
import { InsightCard, StatusPill } from "@/components/ui/Primitives";
import { trCopy } from "@/lib/copy/tr";

const providerModeLabels: Record<CoachInsight["providerMode"], string> = {
  mock: "Demo koç",
  placeholder: "Güvenli AI modu",
  live: "Canlı AI",
  fallback: "Güvenli yedek yorum",
};

export function CoachPanel({ insight }: { insight: CoachInsight }) {
  const primaryActions = insight.sections.monthlyActions.slice(0, 3);
  const priorityItems = insight.sections.priorities.slice(0, 3);
  const reviewQuestions = insight.questionsToReview.slice(0, 4);
  const criticalRisk = insight.sections.risks[0];
  const summaryLines = [
    insight.summary,
    insight.sections.financialStatus.finding,
    insight.sections.expectedOutcome.outcome,
  ].filter(Boolean);

  return (
    <section className="ui-card flex min-h-full flex-col overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-5">
        <div className="flex items-center gap-3">
          <AssistantAvatar />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mint">AI Coach</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{trCopy.coach.title}</h2>
          </div>
        </div>
        <StatusPill tone={insight.providerMode === "live" ? "success" : "warning"}>
          {providerModeLabels[insight.providerMode]}
        </StatusPill>
      </div>

      <div className="mt-6 space-y-4">
        <CoachMessage role="user">Bu ay finansal olarak güvende miyim?</CoachMessage>
        <CoachMessage role="assistant">
          <span className="block font-semibold text-ink">Kısa cevap</span>
          <span className="mt-2 block space-y-1">
            {summaryLines.slice(0, 3).map((line, index) => (
              <span key={`${line}-${index}`} className="block">
                {index + 1}. {line}
              </span>
            ))}
          </span>
        </CoachMessage>
        <TypingIndicator />
      </div>

      {criticalRisk ? (
        <article className="mt-6 rounded-xl border border-coral/25 bg-coral/10 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-coral/15 text-coral">
              <AlertTriangle size={17} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">Kritik risk</p>
              <h3 className="mt-1 text-sm font-semibold text-ink">{criticalRisk.title}</h3>
              <p className="mt-2 text-sm leading-6 text-steel">{criticalRisk.finding}</p>
              <p className="mt-2 text-xs leading-5 text-coral">{criticalRisk.why}</p>
            </div>
          </div>
        </article>
      ) : null}

      <div className="mt-6 grid gap-3">
        <InsightCard
          icon={ShieldCheck}
          tone="accent"
          title={insight.sections.financialStatus.title || "Finansal Durum"}
          body={insight.sections.financialStatus.finding}
        />
        <InsightCard
          icon={Sparkles}
          tone="success"
          title={insight.sections.expectedOutcome.title || "Beklenen sonuç"}
          body={insight.sections.expectedOutcome.outcome}
        />
      </div>

      <div className="mt-6 grid gap-4">
        <CoachSection title="Bu Ay Yapılacaklar" eyebrow="3 aksiyon">
          {primaryActions.map((action) => (
            <RecommendationCard
              key={`${action.title}-${action.action}`}
              title={action.title}
              body={action.action}
              why={action.why}
            />
          ))}
        </CoachSection>
        <CoachSection title="Öncelikler" eyebrow="Sıralı karar mantığı">
          {priorityItems.map((priority) => (
            <ReasoningCard key={`${priority.title}-${priority.priority}`} title={priority.title} body={priority.priority} why={priority.why} />
          ))}
        </CoachSection>
      </div>

      <div className="mt-5">
        <CoachSection title="Koç Yorumu" eyebrow="Sonuç beklentisi">
          <article className="rounded-xl border border-line bg-surface p-4">
            <p className="text-sm leading-6 text-steel">{insight.sections.coachComment.comment}</p>
            <p className="mt-3 text-xs leading-5 text-mint">{insight.sections.coachComment.why}</p>
          </article>
        </CoachSection>
      </div>

      <div className="mt-6 rounded-xl border border-line bg-surface-muted p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <MessageSquareText size={17} aria-hidden="true" />
          Hızlı takip soruları
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {reviewQuestions.map((question) => (
            <button
              key={question}
              type="button"
              className="rounded-full border border-line bg-surface px-3 py-2 text-xs font-medium text-steel transition hover:-translate-y-0.5 hover:border-mint/40 hover:text-mint"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-amber/25 bg-amber/10 p-3 text-xs leading-5 text-steel">{insight.caveats}</div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-steel">
        <span>AI modu: {providerModeLabels[insight.providerMode]}. Yorumlar minimize edilmiş finans özetinden üretilir.</span>
        <Link href="/coach" className="inline-flex items-center gap-2 font-semibold text-mint underline-offset-4 hover:underline">
          Tam koç ekranını aç
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function AssistantAvatar() {
  return (
    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-mint/30 bg-gradient-to-b from-mint to-mint/75 text-paper shadow-sm">
      <Bot size={22} aria-hidden="true" />
    </span>
  );
}

function CoachMessage({ children, role }: { children: React.ReactNode; role: "assistant" | "user" }) {
  const isUser = role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? <AssistantAvatar /> : null}
      <p
        className={`max-w-3xl rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser ? "order-1 bg-mint text-paper" : "border border-line bg-surface-muted text-steel"
        }`}
      >
        {children}
      </p>
      {isUser ? (
        <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface-muted text-steel">
          <UserRound size={16} aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 text-xs text-steel" aria-label="Koç yanıtı hazırlanıyor">
      <AssistantAvatar />
      <div className="flex items-center gap-1 rounded-full border border-line bg-surface-muted px-3 py-2">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-mint"
            style={{ animation: `typing-pulse 1.2s ${dot * 0.14}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

function CoachSection({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface-muted p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">{eyebrow}</span>
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function RecommendationCard({ title, body, why }: { title: string; body: string; why: string }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 transition duration-200 hover:-translate-y-0.5 hover:border-mint/30">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mint/10 text-mint">
          <CheckCircle2 size={15} aria-hidden="true" />
        </span>
        <div>
          <h4 className="text-sm font-semibold text-ink">{title}</h4>
          <p className="mt-1 text-sm leading-6 text-steel">{body}</p>
          <p className="mt-2 text-xs leading-5 text-mint">{why}</p>
        </div>
      </div>
    </article>
  );
}

function ReasoningCard({ title, body, why }: { title: string; body: string; why: string }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <h4 className="text-sm font-semibold text-ink">{title}</h4>
      <p className="mt-1 text-sm leading-6 text-steel">{body}</p>
      <p className="mt-2 text-xs leading-5 text-steel">{why}</p>
    </article>
  );
}
