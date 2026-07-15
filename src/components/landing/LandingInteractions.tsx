"use client";

import { useState } from "react";
import { ArrowRight, BrainCircuit, Database, HardDrive, LineChart, Network } from "lucide-react";

const scenarios = [
  { id: "extra", label: "Extra Debt Payment", cash: "₺12,600", debt: "−4 mo", risk: "Medium → Low", detail: "After protecting the safe-budget threshold, additional funds target the highest-interest debt." },
  { id: "salary", label: "Salary Increase", cash: "₺19,850", debt: "−7 mo", risk: "Medium → Low", detail: "Sixty percent of the income increase strengthens the safe budget; the remainder follows the avalanche strategy." },
  { id: "expense", label: "Mandatory Expense Increase", cash: "₺7,240", debt: "+3 mo", risk: "Medium → High", detail: "Extra payments stop while minimum payments and the safe-budget threshold remain protected." },
] as const;

export function DecisionSimulatorStory() {
  const [activeId, setActiveId] = useState<(typeof scenarios)[number]["id"]>("extra");
  const active = scenarios.find((scenario) => scenario.id === activeId) ?? scenarios[0];
  return <div className="simulator-shell atlas-surface-3">
    <div className="simulator-kicker">DETERMINISTIC ENGINE · LOCAL PREVIEW</div>
    <div className="simulator-tabs" role="tablist" aria-label="Decision scenarios">
      {scenarios.map((scenario) => <button key={scenario.id} role="tab" aria-selected={activeId === scenario.id} onClick={() => setActiveId(scenario.id)}>{scenario.label}</button>)}
    </div>
    <div className="simulator-result" role="tabpanel" key={active.id}>
      <div><span>Safe budget</span><strong>{active.cash}</strong></div>
      <div><span>Debt payoff</span><strong>{active.debt}</strong></div>
      <div><span>Risk change</span><strong>{active.risk}</strong></div>
      <p>{active.detail}</p>
    </div>
  </div>;
}

const nodes = [
  { title: "User", detail: "Decision authority and final control remain with the user.", icon: BrainCircuit },
  { title: "Finance Engine", detail: "Produces budgets, risks and debt calculations deterministically.", icon: LineChart },
  { title: "Repository", detail: "Provides a controlled, testable boundary for financial data access.", icon: HardDrive },
  { title: "Database", detail: "Stores records on the PostgreSQL infrastructure you choose.", icon: Database },
  { title: "AI Provider Registry", detail: "Optional explanation layer. Never the source of financial calculations.", icon: Network },
] as const;

export function ArchitectureExplorer() {
  const [active, setActive] = useState(0);
  return <div className="architecture-explorer">
    <div className="architecture-flow" role="list" aria-label="Atlas AI architecture flow">
      {nodes.map(({ title, icon: Icon }, index) => <div className="architecture-item" role="listitem" key={title}>
        <button className={`atlas-surface-1 ${active === index ? "is-active" : ""}`} onClick={() => setActive(index)} onFocus={() => setActive(index)} aria-pressed={active === index}>
          <Icon aria-hidden /><span>{title}</span>
        </button>{index < nodes.length - 1 ? <ArrowRight className="architecture-arrow" aria-hidden /> : null}
      </div>)}
    </div>
    <div className="architecture-detail atlas-surface-2" aria-live="polite"><span>0{active + 1}</span><strong>{nodes[active].title}</strong><p>{nodes[active].detail}</p></div>
  </div>;
}
