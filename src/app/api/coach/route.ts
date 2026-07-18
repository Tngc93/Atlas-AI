import { NextResponse } from "next/server";
import { z } from "zod";
import { buildCoachChatResponseFromInsight } from "@/features/coach/chat-response";
import { buildCoachFinancialSnapshot, withCoachChatRequest } from "@/features/coach/chat-context";
import { buildMockCoachChatResponse } from "@/features/coach/mock-chat";
import { buildCoachContext, generateCoachInsight } from "@/features/coach/orchestrator";
import { getMonthlyFinancePlanSnapshot } from "@/features/finance/data-service";
import { getMemoryReportData } from "@/features/memory/repository";
import { buildFinancialMemoryReport } from "@/features/memory/service";
import type { FinancialMemoryReport } from "@/features/memory/types";
import { getLatestInterestRateSnapshot } from "@/features/rates/service";
import { trCopy } from "@/lib/copy/tr";
import { isPublicDemoMode } from "@/lib/runtime/execution-mode";

const chatRequestSchema = z
  .object({
    question: z.string().trim().min(1).max(500),
    language: z.enum(["en", "tr"]),
  })
  .strict();

async function getMemoryReportSafely(): Promise<FinancialMemoryReport | null> {
  try {
    return buildFinancialMemoryReport(await getMemoryReportData());
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    if (isPublicDemoMode()) {
      return NextResponse.json({ error: "Public demo uses in-browser Mock AI only." }, { status: 404 });
    }

    const bodyText = (await request.text()).trim();
    let chatRequest: z.infer<typeof chatRequestSchema> | null = null;
    if (bodyText) {
      let rawBody: unknown;
      try {
        rawBody = JSON.parse(bodyText);
      } catch {
        return NextResponse.json({ error: "Koç isteği geçerli değil." }, { status: 400 });
      }
      const parsed = chatRequestSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: "Koç endpoint'i istemci anahtarı veya finans bağlamı kabul etmez." }, { status: 400 });
      }
      chatRequest = parsed.data;
    }

    const [planSnapshot, rateSnapshot, memoryReport] = await Promise.all([
      getMonthlyFinancePlanSnapshot(12),
      getLatestInterestRateSnapshot(),
      getMemoryReportSafely(),
    ]);
    const context = buildCoachContext({ monthlyPlan: planSnapshot.monthlyPlan, rateSnapshot, memoryReport });
    const financialSnapshot = chatRequest ? buildCoachFinancialSnapshot(planSnapshot) : null;
    const providerContext = chatRequest && financialSnapshot
      ? withCoachChatRequest(context, chatRequest.question, chatRequest.language, financialSnapshot)
      : context;
    const insight = await generateCoachInsight(providerContext);

    return NextResponse.json(
      chatRequest && financialSnapshot
        ? insight.provider === "mock"
          ? buildMockCoachChatResponse(chatRequest.question, financialSnapshot, chatRequest.language)
          : buildCoachChatResponseFromInsight(insight, financialSnapshot, chatRequest.language)
        : insight,
    );
  } catch {
    return NextResponse.json(
      {
        error: trCopy.api.coachError,
      },
      { status: 500 },
    );
  }
}
