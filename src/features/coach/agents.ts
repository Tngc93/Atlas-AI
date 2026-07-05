import type { AgentAction, AgentFinding, CoachAgentOutputs, CoachInputSummary, CoachInsight } from "./types";

function riskLabel(input: CoachInputSummary): string {
  if (input.riskLevel === "high" || input.riskLevel === "critical") {
    return "yüksek";
  }

  if (input.riskLevel === "medium") {
    return "orta";
  }

  return "düşük";
}

function survivalText(input: CoachInputSummary): string {
  if (input.survivalBudgetDirection === "negative") {
    return "yaşam bütçesi negatife dönüyor";
  }

  if (input.survivalBudgetDirection === "thin") {
    return "yaşam bütçesi ince bir tamponla korunuyor";
  }

  return "yaşam bütçesi daha dengeli görünüyor";
}

export function runFinancialHealthAgent(input: CoachInputSummary): AgentFinding {
  return {
    title: "Finansal sağlık",
    finding: `${input.month} için genel finansal durum ${riskLabel(input)} risk sinyali taşıyor; ${survivalText(input)}.`,
    why:
      "Çünkü finans motoru maaş bandını, zorunlu gider payını, asgari ödeme payını ve ay sonu yaşam bütçesi yönünü birlikte değerlendiriyor.",
  };
}

export function runDebtStrategyAgent(input: CoachInputSummary): CoachAgentOutputs["debtStrategy"] {
  const hasDebt = input.activeDebtCount > 0;
  const highInterestText =
    input.highInterestDebtCount > 0
      ? "yüksek faiz baskısı olan aktif borçlar var"
      : "yüksek faiz baskısı belirgin değil veya faiz verisi eksik";

  return {
    priorities: [
      {
        title: "Borç önceliği",
        priority: hasDebt
          ? "Önce asgari ödemeleri koru, sonra avalanche sırasındaki en yüksek faiz baskısı olan aktif borcu hedefle."
          : "Aktif borç yoksa borç kapatma önceliği yerine nakit akışı ve kayıt doğruluğunu izle.",
        why:
          "Çünkü finans motorunun borç stratejisi faiz maliyetini azaltmak için avalanche yaklaşımını kullanıyor; AI bu hesabı değiştirmiyor, yalnızca açıklıyor.",
      },
    ],
    insights: [
      {
        title: "Borç baskısı",
        finding: hasDebt
          ? `${input.activeDebtCount} aktif borç izleniyor; ${highInterestText}.`
          : "Aktif borç kaydı olmadığı için borç stratejisi sınırlı yorumlanabilir.",
        why:
          "Çünkü borç önceliği yalnızca aktif borçlar ve finans motorunun çözdüğü faiz kaynağı üzerinden anlamlıdır.",
      },
    ],
  };
}

export function runCashFlowAgent(input: CoachInputSummary): CoachAgentOutputs["cashFlow"] {
  const isNegative = input.survivalBudgetDirection === "negative";
  const isThin = input.survivalBudgetDirection === "thin";
  const finding: AgentFinding = {
    title: "Nakit akışı",
    finding: isNegative
      ? "Bu ay nakit akışı kırılgan; ekstra borç ödemesi yerine zorunlu gider ve asgari ödeme güvenliği öne çıkmalı."
      : isThin
        ? "Bu ay nakit akışı pozitif olsa bile tampon ince; ek ödeme kararı temkinli verilmeli."
        : "Bu ay nakit akışı daha dengeli; yaşam bütçesi korunduktan sonra öncelikli borca odaklanılabilir.",
    why:
      "Çünkü finans motoru yaşam bütçesi yönünü, günlük limit bandını ve asgari ödeme payını birlikte değerlendiriyor.",
  };

  const actions: AgentAction[] = [
    {
      title: "Yaşam bütçesini koru",
      action: isNegative
        ? "Ekstra borç ödemesi planlama; önce zorunlu giderleri ve asgari ödemeleri güvenceye al."
        : "Ek ödeme yapmadan önce ay sonuna kadar yaşayabileceğin tutarın korunduğunu kontrol et.",
      why:
        "Çünkü yaşam bütçesi korunmadan yapılan ek ödeme sonraki haftalarda yeniden borçlanma riski oluşturabilir.",
    },
  ];

  const scenarios: CoachInsight["sections"]["decisionSimulatorPreview"] = [
    {
      scenario: "Ek ödeme yapılmazsa",
      interpretation: isNegative
        ? "Nakit baskısı azaltılabilir, ancak borç kapanışı gecikebilir."
        : "Yaşam bütçesi daha rahat korunur, fakat faiz maliyeti daha yavaş azalır.",
      why: "Çünkü finans motorunun ek ödeme alanı borç kapanış hızını etkiler; AI burada yalnızca sonucu yorumlar.",
    },
    {
      scenario: "Ek ödeme yalnızca tampon korunduktan sonra yapılırsa",
      interpretation: "Borç azaltma ve günlük yaşam güvenliği arasında daha dengeli bir yol oluşur.",
      why: "Çünkü önce zorunlu giderler ve asgari ödemeler korunur, kalan alan borç stratejisine ayrılır.",
    },
    {
      scenario: "Faiz bilgisi eksik borçlar manuel güncellenirse",
      interpretation: "Öncelik sırası daha güvenilir yorumlanır.",
      why: "Çünkü faiz kaynağı eksik veya fallback ise borç stratejisinin açıklaması daha sınırlı olur.",
    },
  ];

  return { finding, actions, scenarios };
}

export function runRiskAgent(input: CoachInputSummary): CoachAgentOutputs["risk"] {
  const findings: AgentFinding[] = [];

  findings.push({
    title: "Risk seviyesi",
    finding: `Görünen risk seviyesi ${riskLabel(input)}.`,
    why:
      input.criticalReasonCount > 0
        ? "Çünkü finans motoru kritik nedenleri Yüksek Risk altında topluyor; AI ayrı bir risk hesabı yapmıyor."
        : "Çünkü finans motoru nakit akışı, borç yükü, faiz ve ödeme takvimini birlikte sınıflandırıyor.",
  });

  if (input.rateContext.isFallback) {
    findings.push({
      title: "Faiz verisi riski",
      finding: "Faiz bağlamında fallback/örnek veri kullanılıyor olabilir.",
      why:
        "Çünkü fallback oran gerçek banka oranı değildir; manuel faiz doğrulanmadığında borç önceliği açıklaması sınırlı kalır.",
    });
  }

  if (input.warningCount > 0) {
    findings.push({
      title: "Uyarı yoğunluğu",
      finding: `${input.warningCount} uyarı sinyali var.`,
      why: "Çünkü finans motoru nakit akışı, ödeme tarihi veya faiz baskısı gibi risk sinyalleri üretmiş.",
    });
  }

  return { findings };
}

export function runFinancialHabitsAgent(input: CoachInputSummary): CoachAgentOutputs["financialHabits"] {
  const insight: AgentFinding = {
    title: "Finansal alışkanlık",
    finding:
      input.dailyLimitBand === "tight"
        ? "Günlük limit sıkı; küçük plansız harcamalar bile ay sonu dengesini bozabilir."
        : "Günlük limit daha yönetilebilir görünüyor; yine de ödeme tarihleri ve düzenli giderler takip edilmeli.",
    why:
      "Çünkü finansal alışkanlık analizi tek tek harcamaları yargılamaz; ay sonuna kadar sürdürülebilir harcama ritmini yorumlar.",
  };

  return {
    insights: [insight],
    coachComment: {
      title: "Koç yorumu",
      comment:
        "Bu ay hedef, mükemmel bir bütçe değil; zorunlu ödemeleri aksatmadan tekrar edilebilir bir finansal ritim kurmak olmalı.",
      why:
        "Çünkü sürdürülebilir davranış, tek seferlik agresif borç ödemesinden daha kalıcı bir nakit akışı güvenliği yaratır.",
    },
  };
}

export function runCoachAgents(input: CoachInputSummary): CoachAgentOutputs {
  return {
    financialHealth: runFinancialHealthAgent(input),
    debtStrategy: runDebtStrategyAgent(input),
    cashFlow: runCashFlowAgent(input),
    risk: runRiskAgent(input),
    financialHabits: runFinancialHabitsAgent(input),
  };
}
