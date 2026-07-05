import type { CoachAgentOutputs, CoachInsight } from "./types";

export function composeCoachSections(agentOutputs: CoachAgentOutputs): CoachInsight["sections"] {
  return {
    financialStatus: {
      title: "Finansal Durum",
      finding: agentOutputs.financialHealth.finding,
      why: agentOutputs.financialHealth.why,
    },
    risks: agentOutputs.risk.findings.map((finding) => ({
      title: finding.title,
      finding: finding.finding,
      why: finding.why,
    })),
    insights: [...agentOutputs.debtStrategy.insights, ...agentOutputs.financialHabits.insights].map((finding) => ({
      title: finding.title,
      finding: finding.finding,
      why: finding.why,
    })),
    monthlyActions: agentOutputs.cashFlow.actions,
    priorities: agentOutputs.debtStrategy.priorities,
    expectedOutcome: {
      title: "Beklenen Sonuç",
      outcome: "Plan, önce nakit akışı güvenliğini korumayı; uygun alan varsa borç azaltmayı hedefler.",
      why:
        "Çünkü hesaplamaların kaynak gerçekliği finans motorudur; AI yalnızca bu motorun ürettiği ödeme, risk ve bütçe sinyallerini açıklar.",
    },
    coachComment: agentOutputs.financialHabits.coachComment,
    decisionSimulatorPreview: agentOutputs.cashFlow.scenarios,
  };
}
