import { describe, expect, it } from "vitest";
import { sampleDebts, sampleExpenses, sampleProfile } from "@/lib/sample-data/finance";
import { buildMonthlyFinancePlan } from "./calculations";
import { buildDashboardDecisionBrief } from "./dashboard-brief";

describe("dashboard decision brief", () => {
  const asOfDate = new Date(2026, 6, 4);

  it("prioritizes the main risk when cash flow cannot cover required obligations", () => {
    const plan = buildMonthlyFinancePlan(
      { ...sampleProfile, monthlySalaryKurus: 55_000_00 },
      sampleDebts,
      sampleExpenses,
      { asOfDate, horizonMonths: 3 },
    );
    const brief = buildDashboardDecisionBrief(plan);

    expect(brief.riskLabel).toBe("Yüksek");
    expect(brief.primaryRisk).toBe("Maaş, zorunlu giderler ve asgari borç ödemelerinin tamamına yetmiyor.");
    expect(brief.nextSafeStep).toBe("Ek ödeme düşünmeden önce asgari ödemelerin karşılanma durumunu gözden geçirmek.");
  });

  it("does not suggest extra debt payment when the living budget cannot be protected", () => {
    const plan = buildMonthlyFinancePlan(
      { ...sampleProfile, monthlySalaryKurus: 70_000_00 },
      sampleDebts,
      sampleExpenses,
      { asOfDate, horizonMonths: 3 },
    );
    const brief = buildDashboardDecisionBrief(plan);

    expect(plan.cashFlow.extraDebtPaymentKurus).toBe(0);
    expect(brief.nextSafeStep).toBe("Ek borç ödemesi yerine yaşam bütçesini korumaya odaklanmak.");
    expect(brief.why).toBe("Çünkü yaşam bütçesi korunmadığında borç azaltma hızından önce nakit güvenliği önem kazanır.");
  });

  it("uses safe fallback copy when the action plan is empty", () => {
    const plan = buildMonthlyFinancePlan(sampleProfile, sampleDebts, sampleExpenses, { asOfDate, horizonMonths: 3 });
    const brief = buildDashboardDecisionBrief({
      ...plan,
      actionPlan: [],
    });

    expect(brief.nextSafeStep).toBe("Mevcut günlük ve haftalık harcama limitini koruyarak planı takip etmek.");
  });

  it("keeps risk labels limited to Düşük, Orta and Yüksek", () => {
    const low = buildMonthlyFinancePlan(sampleProfile, [], sampleExpenses, {
      asOfDate,
      horizonMonths: 3,
    });
    const medium = buildMonthlyFinancePlan(sampleProfile, sampleDebts, sampleExpenses, { asOfDate, horizonMonths: 3 });
    const high = buildMonthlyFinancePlan({ ...sampleProfile, monthlySalaryKurus: 55_000_00 }, sampleDebts, sampleExpenses, {
      asOfDate,
      horizonMonths: 3,
    });

    expect([buildDashboardDecisionBrief(low).riskLabel, buildDashboardDecisionBrief(medium).riskLabel, buildDashboardDecisionBrief(high).riskLabel]).toEqual([
      "Düşük",
      "Orta",
      "Yüksek",
    ]);
  });

  it("does not expose raw plan details, debt names, lenders or technical context", () => {
    const plan = buildMonthlyFinancePlan(sampleProfile, sampleDebts, sampleExpenses, { asOfDate, horizonMonths: 3 });
    const serialized = JSON.stringify(buildDashboardDecisionBrief(plan));

    expect(serialized).not.toContain("Örnek Market Kartı");
    expect(serialized).not.toContain("Örnek Seyahat Kartı");
    expect(serialized).not.toContain("Örnek Banka");
    expect(serialized).not.toContain("Demo Finans");
    expect(serialized).not.toContain("paymentAllocations");
    expect(serialized).not.toContain("provider");
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain("cache");
    expect(serialized).not.toContain("85000");
  });
});
