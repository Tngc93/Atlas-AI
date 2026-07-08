# DESIGN_SYSTEM.md

Version: 1.0  
Status: Accepted

## 1. Purpose of This Document

This document defines the constitutional design doctrine of the product.

Its purpose is to answer a durable question:

> How should this product feel?

The answer must remain grounded in `PRODUCT_MANIFESTO.md`, `PRODUCT_PRINCIPLES.md`, `PRODUCT_STRATEGY.md`, and `ROADMAP.md`. This document does not replace, summarize, or rewrite those documents. It translates their constitutional ideas into design judgment.

Every major doctrine in this document must be traceable to the higher constitutional layer: the manifesto's purpose, the principles' operating constraints, the strategy's positioning, and the roadmap's intended capability sequence. Traceability does not require repeating those documents. It requires that each design belief can explain where it comes from and why it exists.

This document governs how future product experiences should express agency, clarity, trust, dignity, restraint, responsibility, evidence, privacy, consent, inclusion, explainability, recoverability, continuity, and uncertainty.

This document does not define:

- UI kits
- Component libraries
- Figma specifications
- Design tokens
- Typography tokens
- Color systems
- Spacing scales
- CSS
- Tailwind classes
- Layout grids
- Implementation details

Design decisions may evolve. The constitutional expectations in this document should remain stable unless amended through explicit review.

## 2. Constitutional Lineage

This design doctrine derives from the product's higher constitutional documents:

- `PRODUCT_MANIFESTO.md`
- `PRODUCT_PRINCIPLES.md`
- `PRODUCT_STRATEGY.md`
- `ROADMAP.md`

The design system exists below those documents and above downstream copy, UX, visual design, interaction design, AI experience, and implementation work.

Its role is not to create new product beliefs. Its role is to make accepted product beliefs visible through design.

The lineage is directional:

- The manifesto defines why the product deserves to exist.
- The principles define what the product must protect.
- The strategy defines how the product should create durable value.
- The roadmap defines how capabilities should mature over time.
- This document defines how those commitments should feel through design.

When a design choice conflicts with a higher constitutional document, the higher document takes precedence. When a design choice is technically elegant but weakens user agency, dignity, privacy, consent, evidence, restraint, inclusion, recoverability, continuity, or deterministic truth, the design choice must be rejected.

## 3. Design North Star

The product should feel calm, clear, protective, honest, respectful, evidence-based, and practical.

It should feel like a trustworthy financial mirror and decision companion. It should not feel like a judge, salesperson, debt collector, gambling interface, productivity game, or automated financial authority.

The product should help users see what is true, understand what matters, protect what must be protected, and make the next responsible decision with confidence.

Its design should reduce panic without hiding seriousness. It should create orientation without pretending uncertainty does not exist. It should make hard financial situations easier to face without minimizing their consequences.

The product should remain understandable not only in a single session, but across repeated use over months and years. It should help users recognize change over time without creating dependence on the product as the only way to understand their financial life.

## 4. Core Design Commitments

Each commitment in this section governs future design decisions across information architecture, interaction, AI experience, communication, visual direction, and product behavior.

### 4.1 Agency Over Automation

**Constitutional Source**

This commitment derives from the higher constitutional commitment to protect user control, responsibility, and financial self-understanding. It connects the manifesto's user agency, the principles' human-in-control posture, the strategy's trust-based positioning, and roadmap capabilities such as coaching, simulations, and forecasts.

**Principle**

The product helps users decide. It does not take financial agency away from them.

**What this means**

Design must make the user's choices visible, understandable, and intentional. The product may calculate, organize, explain, compare, and warn, but it must not create the feeling that the system has already decided what the user must do.

Automation may reduce effort only when it does not weaken understanding or control. Important financial actions should preserve the user's ability to review context, understand consequences, and choose deliberately.

AI must support agency by explaining deterministic outputs, surfacing tradeoffs, and inviting reflection. It must not present itself as the source of financial authority.

**What this rejects**

- Overconfident automation
- AI as financial authority
- One-click irreversible financial actions
- Hidden assumptions
- Designs that pressure users into a single path
- Recommendations that obscure user choice

### 4.2 Clarity Over Sophistication

**Constitutional Source**

This commitment derives from the higher constitutional commitment to make personal finance legible before it becomes advisory, automated, or optimized. It supports the strategy's differentiation through trustworthy understanding and the roadmap's sequence from core financial clarity toward more advanced capabilities.

**Principle**

The product must make financial reality clear before it tries to look advanced.

**What this means**

Design must prioritize comprehension over complexity. Users should be able to understand their salary allocation, mandatory expenses, debt obligations, minimum payments, survival budget, risk signals, and payoff priorities without decoding an expert system.

Sophistication is valuable only when it improves judgment. A design that looks impressive but makes decisions harder is a constitutional failure.

The product should make the important thing easy to find, the next thing easy to understand, and the dangerous thing difficult to miss.

**What this rejects**

- Decorative complexity
- Dashboard theater
- Ambiguous metrics
- Financial jargon without explanation
- Visual density without decision value
- Showing complexity to signal intelligence

### 4.3 Dignity Under Pressure

**Constitutional Source**

This commitment derives from the higher constitutional commitment to serve people in financially vulnerable moments without exploiting or humiliating them. It links the manifesto's dignity, the principles' no-shame posture, the strategy's trust model, and roadmap capabilities that expose risk, debt pressure, and tradeoffs.

**Principle**

The product must respect users most when their financial situation is difficult.

**What this means**

Design must treat financial pressure as a serious context, not a personal failure. Risk, debt, late payment pressure, negative cash flow, and limited survival budget must be communicated directly but never humiliatingly.

The product should help users face difficult information without adding shame. It should communicate consequences clearly while preserving a sense of possibility and control.

Dignity does not mean softening every warning. It means warnings should be useful, proportionate, and respectful.

**What this rejects**

- Shame-based warnings
- Moralizing debt
- Panic language
- Success/failure framing
- Punitive tone
- Designs that make financial struggle feel like personal weakness

### 4.4 Trust Through Evidence

**Constitutional Source**

This commitment derives from the higher constitutional commitment to earn trust through evidence rather than persuasion. It connects deterministic finance logic, transparent assumptions, privacy-first decision support, and roadmap capabilities such as simulation, forecasting, reporting, and AI explanation.

**Principle**

Important outputs must be grounded in visible reasons, assumptions, or source signals.

**What this means**

Design must help users understand why a risk, recommendation, forecast, simulation result, or coaching statement exists. The interface should make evidence available without overwhelming the user.

Trust should come from traceability, not from confidence theater. Users should be able to distinguish a calculated fact, a derived risk signal, a scenario assumption, and an AI-generated explanation.

The product should make its reasoning inspectable wherever the output could influence a financial decision.

**What this rejects**

- Unsupported recommendations
- Black-box scores
- Vague AI advice
- Hidden calculation logic
- Trust based only on polished presentation
- Important outputs without visible rationale

### 4.5 Restraint as Protection

**Constitutional Source**

This commitment derives from the higher constitutional commitment to avoid exploiting anxiety, urgency, attention, or vulnerability. It protects the strategy's long-term trust position by refusing short-term engagement patterns that would weaken user judgment.

**Principle**

The product should avoid unnecessary urgency, persuasion, stimulation, and emotional pressure.

**What this means**

Design should be calm because the domain is serious. It should not use stress as a conversion mechanism or attention strategy. It should not turn debt repayment, budgeting, or risk review into a game of streaks, shame, or constant stimulation.

Restraint protects judgment. It gives users enough space to understand, compare, and decide without being pushed by the interface.

Urgency is appropriate only when it reflects a real financial deadline, risk, or consequence. Restraint must never become under-warning. Calm design must still surface important evidence, meaningful risk, and time-sensitive obligations clearly.

**What this rejects**

- Gamified finance pressure
- Artificial urgency
- Growth-hacking patterns
- Attention capture
- Persuasive friction designed to steer behavior
- Emotional overstatement

### 4.6 Uncertainty Made Visible

**Constitutional Source**

This commitment derives from the higher constitutional commitment to communicate future-facing financial information honestly. It supports roadmap capabilities such as scenarios, forecasts, reports, and AI coaching by preventing them from becoming false promises.

**Principle**

Forecasts, simulations, AI explanations, and future-facing outputs must not pretend to be guarantees.

**What this means**

Design must communicate assumptions, limits, and uncertainty in any output that depends on future conditions. Interest rates, income stability, expense behavior, payment timing, and scenario inputs may change. The product should not hide this instability.

Uncertainty should not paralyze the user. It should help the user understand what is known, what is assumed, what may change, and what decision remains responsible despite uncertainty.

**What this rejects**

- False precision
- Guaranteed outcomes
- Confident predictions from unstable assumptions
- AI-generated certainty
- Forecasts presented as promises
- Scenarios without visible assumptions

### 4.7 Deterministic Truth Before Interpretation

**Constitutional Source**

This commitment derives from the higher constitutional rule that deterministic calculations are the source of truth for budgets, minimum payments, interest pressure, risk signals, and payoff projections. It protects the product from drifting into advice-led or AI-led financial authority.

**Principle**

Calculations, rules, and finance logic come before coaching, narrative, and AI interpretation.

**What this means**

Design must preserve a clear hierarchy between computed financial outputs and explanatory language. The product may explain, contextualize, and teach, but it must not allow interpretation to override deterministic truth.

If a calculated output and a narrative output diverge, design must favor the calculated output and make the conflict visible for correction.

AI belongs downstream from deterministic finance logic. It may explain what the calculation means; it may not become the source of calculation.

**What this rejects**

- AI-led financial conclusions
- Interpretations that contradict calculations
- Decorative insight cards without source
- Advice detached from deterministic data
- Narrative confidence replacing mathematical correctness

### 4.8 Local-First Privacy as a Design Feeling

**Constitutional Source**

This commitment derives from the higher constitutional privacy-first and local-first foundation, and from the sensitivity of salary, debts, expenses, credit limits, due dates, household pressure, and notes. It connects the manifesto's trust promise, the principles' data-minimization posture, the strategy's privacy position, and roadmap capabilities that may introduce AI, reports, memory, or integrations.

**Principle**

Privacy, consent, and data movement should be felt by the user, not only implemented technically.

**What this means**

Design must communicate careful handling of sensitive financial data through product behavior, information boundaries, and user expectations. Users should not feel that the product is casual with their financial life.

The product should avoid unnecessary data exposure, unnecessary sharing prompts, and unclear external processing. Where AI or external providers are involved, the experience should make the boundary understandable.

Privacy is not only a compliance property. It is part of the emotional contract between the product and the user.

Consent should be understandable and continuous rather than treated as a one-time event. Users should clearly understand when financial information stays local, when it is summarized, when it may move between systems, and why that movement matters. Meaningful data movement should be visible rather than implicit.

**What this rejects**

- Casual data exposure
- Unclear external calls
- Overcollection
- Designs that normalize sharing sensitive financial details
- Treating privacy as fine print
- Surprise movement of financial data
- One-time consent that hides future data movement
- Technically correct privacy that users cannot understand emotionally

### 4.9 Inclusive Design

**Constitutional Source**

This commitment derives from the higher constitutional responsibility to protect dignity and agency for users across different levels of financial literacy, stress, age, language confidence, and cognitive load. It reinforces the strategy's trust position by making the product useful before the user feels financially confident.

**Principle**

The product must remain understandable and usable regardless of age, financial literacy, stress level, temporary cognitive overload, or language proficiency.

**What this means**

Inclusive design is not an accessibility feature. It is a constitutional design commitment.

The product should assume that users may arrive tired, anxious, distracted, embarrassed, or unfamiliar with financial terminology. Design must help them understand without making them feel inadequate.

The product should make important information perceivable, language understandable, paths recoverable, and decisions approachable. It should not require users to already feel confident with finance before they can benefit from the product.

Inclusion must prioritize comprehension under pressure, not compliance alone.

**What this rejects**

- Designing only for expert users
- Interfaces that assume financial confidence
- Cognitive overload
- Accessibility as an afterthought
- Jargon as a gatekeeping mechanism
- Experiences that punish low financial literacy

### 4.10 Progressive Disclosure

**Constitutional Source**

This commitment derives from the higher constitutional responsibility to help users move from financial recognition to responsible action without overwhelming attention or judgment. It supports the roadmap's progression from basic clarity toward scenarios, reports, memory, and coaching without exposing all capability at once.

**Principle**

The product should reveal only the information necessary for the user's next responsible decision.

**What this means**

Information should appear as understanding grows, rather than all at once. The product should organize financial reality in a sequence that supports comprehension: first what must be protected, then what must be paid, then what creates risk, then what can be optimized.

Progressive disclosure is not hiding information. It is sequencing information responsibly. It must never conceal meaningful risk, important evidence, or constraints that affect responsible judgment.

Users should be able to go deeper when they need evidence, assumptions, details, or alternatives. The default experience should not require them to process every available metric before making a useful decision.

**What this rejects**

- Dashboard overload
- Feature-first interfaces
- Showing every metric simply because it exists
- Consuming attention without improving judgment
- Treating all information as equally urgent
- Depth without orientation

## 5. Emotional Design Model

The product should support a humane emotional arc. This arc describes how the experience should help a user move through financial understanding, not how screens should be arranged.

1. Recognition: "I can see my situation clearly."
2. Stabilization: "I know what must be protected first."
3. Prioritization: "I know what matters next."
4. Reflection: "I understand the tradeoffs."
5. Action: "I can make a small, safe decision."
6. Recovery: "If I make a mistake, I can understand and correct it."

The product should not try to make users feel artificially successful. It should help them feel oriented, respected, and capable.

Financial stress often narrows attention. The design should widen usable attention by reducing ambiguity, sequencing decisions, and separating facts from interpretation.

The product should preserve continuity across months and years of use. Users should not have to rediscover their financial situation from the beginning every time they return. The experience should help them understand what changed, what stayed stable, what assumptions shifted, and what decisions remain open.

Continuity should not become dependence. The product should strengthen the user's own financial understanding over time, not make the user feel unable to reason without it.

## 6. Explainability Doctrine

Explainability is a design-wide doctrine. It does not belong only to AI.

Every important financial output should be understandable. This includes:

- Calculations
- Risks
- Recommendations
- Simulations
- Forecasts
- AI explanations

The interface should always make it possible for users to understand why an output exists.

Explainability should reveal the relationship between inputs, assumptions, rules, and outputs. It should help users answer questions such as:

- What created this number?
- What rule or threshold affected this risk?
- What assumption shaped this forecast?
- What changed between two scenarios?
- What part is calculated, and what part is explanation?

Explainability should be available without becoming clutter. The product should disclose reasons at the level needed for responsible judgment, with deeper detail available when the user needs it.

The product rejects any important financial output that asks for trust while hiding its basis.

Explainability also applies to change over time. When a risk level, recommendation, forecast, or priority changes, the product should help the user understand why it changed rather than presenting the new state as disconnected from the past.

## 7. Decision Experience Doctrine

The product exists to support responsible financial decisions, not to maximize interaction.

Decision experiences should show constraints before options. Mandatory living expenses, minimum payments, due dates, negative cash flow, and survival budget pressure must be understood before optimization, acceleration, or coaching.

The product should separate:

- Facts
- Calculations
- Risks
- Assumptions
- Options
- Tradeoffs
- AI explanations
- User decisions

This separation protects agency and reduces confusion. Users should know when they are seeing a fact, when they are seeing a risk interpretation, when they are exploring a scenario, and when they are being invited to decide.

Every meaningful financial action should remain understandable and recoverable whenever reasonably possible. The product should help users recover from mistakes rather than punish them.

Recoverability also applies to misunderstandings, stale assumptions, and changed circumstances. When the user's situation changes, the product should help them reorient without treating the previous state as failure.

Decision design should reject:

- Recommendation-first design
- Hidden ranking logic
- Irreversible interactions without clear confirmation
- Punitive error states
- Designs that make users afraid to explore
- Optimization before survival protection
- Treating all choices as equally important

The best decision experience is not the one that produces the fastest click. It is the one that helps the user understand what is at stake and act with informed confidence.

## 8. AI Experience Doctrine

AI in this product should feel like an educational explainer, not an authority.

AI may help users understand financial outputs, compare tradeoffs, ask better questions, and reflect on next steps. It must remain grounded in deterministic summaries and must not replace calculation logic.

AI experiences should be:

- Turkish-first
- Educational
- Humble about uncertainty
- Clear about assumptions
- Downstream from deterministic outputs
- Recoverable when provider calls fail
- Safe when API keys are missing
- Minimal with sensitive data

AI should not create the feeling that the product has a hidden intelligence superior to the user's judgment. It should help the user understand what the system has calculated and what options may be worth reviewing.

AI explanation must never become AI authority. Even as AI capabilities mature, design must preserve the visible boundary between deterministic outputs, user decisions, and AI-generated interpretation.

The AI experience rejects:

- AI oracle framing
- Licensed-advisor tone
- Magical insight presentation
- AI recommendations without deterministic grounding
- AI ownership of calculations
- Over-personalized intimacy around sensitive financial stress
- Failure states that feel broken or alarming

When AI is unavailable, the product should remain useful. The deterministic product must not depend on AI to preserve core financial understanding.

## 9. Information Architecture Philosophy

Information architecture should follow the user's financial decision journey, not the product's internal data model.

The product should organize information from survival to optimization:

1. What money is available?
2. What must be protected?
3. What must be paid?
4. What creates risk?
5. What can be prioritized?
6. What can be simulated?
7. What can be explained or reflected on?

The architecture should move from obligations to choices, from the current month to future scenarios, and from deterministic summary to coach interpretation.

Feature exposure should follow user need. A feature should not be prominent merely because it exists. A metric should not be visible merely because it can be calculated.

The architecture should also support temporal continuity. It should help users understand the current month in relation to previous months, repeated obligations, salary cycles, debt progress, risk history, and changed assumptions without forcing them to reconstruct context manually.

The product should reflect the realities of Turkish personal finance without becoming culturally stereotyped. Design should account for recurring salary cycles, credit card behavior, installment culture, inflation pressure, changing household obligations, and the emotional weight of short-term liquidity. This is not localization decoration. It is recognition of the user's financial reality.

Information architecture should reject:

- Navigation based primarily on internal data structures
- Feature-first organization
- AI-first organization
- Burying risk or mandatory payments
- Treating future optimization as more important than present stability
- Making users assemble meaning from scattered fragments
- Treating Turkish financial context as a translation problem only
- Presenting each session as if the user's financial history did not exist

The product should feel like a guided financial map, not a warehouse of financial widgets.

## 10. Visual Philosophy

The visual philosophy of the product is calm, legible, serious, restrained, and humane.

Visual design should increase orientation. It should help users distinguish importance, risk, sequence, evidence, and action without relying on spectacle.

The product should feel trustworthy without luxury-fintech theater. It should feel protective without becoming paternalistic. It should feel serious without becoming cold.

Visual design should support:

- Calm over dramatic impact
- Legibility over decoration
- Signal over ornament
- Evidence over polish
- Emotional steadiness over stimulation
- Seriousness without intimidation
- Continuity without dependence

Visual design should reject:

- Casino-like dashboards
- Alarmist presentation
- Luxury aesthetics that obscure financial reality
- Cute treatment of serious debt situations
- Decorative visuals that do not improve understanding
- Visual novelty that weakens trust
- Drama where clarity is needed
- Calmness that hides important evidence
- Restraint that makes serious risk too easy to miss

This section does not define colors, spacing, typography, layout, grids, tokens, components, or implementation rules. Those decisions belong downstream and must remain subordinate to this philosophy.

## 11. Communication Philosophy

Product communication should be plain, respectful, educational, and direct.

The product should speak Turkish in a way that is understandable without being simplistic. It should avoid shame, false reassurance, exaggerated confidence, and technical jargon where user language is clearer.

Turkish-first communication should reflect local financial reality without turning users into stereotypes. Salary timing, credit card habits, installment obligations, inflation pressure, and household responsibility may shape what users need to understand. The product should name these realities plainly when they matter and avoid cultural shorthand that reduces user dignity.

Communication should distinguish:

- What is known
- What is calculated
- What is assumed
- What is risky
- What is suggested
- What remains the user's decision

The product should not use motivational cliches to cover financial pressure. It should not soften serious risk into vague positivity. It should not intensify stress to provoke action.

Communication should reject:

- Shame language
- Fear-based nudges
- Sales language
- Overpromising
- False reassurance
- Unexplained jargon
- Advisor-like certainty
- Friendly tone that hides consequences

The desired voice is calm enough to trust, clear enough to act on, and respectful enough to preserve dignity under stress.

## 12. Pattern Rejection List

The product rejects design patterns that weaken agency, dignity, privacy, clarity, inclusion, explainability, restraint, recoverability, or deterministic truth.

The following patterns are constitutionally disallowed unless a future explicit amendment changes this doctrine:

- Dark patterns
- Shame loops
- Dashboard overload
- Gamified debt pressure
- AI oracle framing
- False precision
- Hidden assumptions
- Punitive error states
- Accessibility as an afterthought
- Feature-first interfaces
- Decorative complexity without decision value
- Recommendation-first financial flows
- Unclear external data processing
- Irreversible actions without clear confirmation
- Panic-based warnings
- Sales-oriented financial coaching
- Metrics without decision purpose
- Forecasts presented as guarantees
- AI explanations detached from deterministic outputs
- Designs that make users afraid to explore
- Calm design that hides evidence
- Progressive disclosure that conceals risk
- Privacy patterns that are technically correct but emotionally opaque
- Inclusion treated as compliance rather than comprehension under pressure
- Restraint that becomes under-warning
- Long-term history that creates dependence instead of understanding

This list is not exhaustive. Any future pattern that produces the same constitutional harms should be rejected even if it is not named here.

## 13. Design Review Questions

Future design work should be reviewed against these questions before it is accepted:

- Does this preserve user agency?
- Does this make the user's financial reality clearer?
- Does this protect dignity under stress?
- Does this remain usable for people with lower financial literacy or temporary cognitive overload?
- Is the evidence behind important outputs visible or available?
- Can users understand why this calculation, risk, recommendation, simulation, forecast, or AI explanation exists?
- Does this protect privacy as both a technical and emotional commitment?
- Is consent understandable and continuous where financial information may move between systems?
- Does this avoid unnecessary urgency, persuasion, or stimulation?
- Does restraint still surface serious risk clearly?
- Can users recover from meaningful mistakes whenever reasonably possible?
- Does this disclose information progressively instead of overwhelming attention?
- Does progressive disclosure avoid concealing meaningful risk or evidence?
- Does this preserve deterministic truth before interpretation?
- Does this communicate uncertainty honestly?
- Does AI explanation remain clearly separate from AI authority?
- Does this help users understand change over time without creating dependence?
- Does this reflect Turkish financial reality where relevant without stereotyping users?
- Does this avoid hiding constraints behind optimism?
- Does this distinguish facts, assumptions, interpretations, suggestions, and decisions?
- Does this reject shame, fear, and false reassurance?

If a design cannot answer these questions well, it should be revised before implementation.

## 14. Relationship to Future Documents

This document governs downstream design work but does not replace it.

`COPY_GUIDELINES.md` should translate this doctrine into product language, tone, Turkish-first communication rules, warning language, AI explanation language, and error-state communication.

`UX_PRINCIPLES.md` should translate this doctrine into interaction principles, journey principles, decision flows, error recovery, disclosure behavior, and user control expectations.

Information architecture should use this doctrine to determine what appears first, what appears later, what remains contextual, and what should not be elevated simply because it exists.

AI experience design should use this doctrine to preserve deterministic grounding, uncertainty, privacy, humility, and educational framing.

Future continuity, memory, reporting, and forecasting work should use this doctrine to help users understand change over time without creating dependence or false certainty.

Future implementation work should treat this document as a constitutional constraint. Components, visual systems, tokens, layouts, copy, routes, and technical patterns may change, but they must not weaken the principles defined here.

## 15. Design Amendment Policy

`DESIGN_SYSTEM.md` derives from `PRODUCT_MANIFESTO.md`, `PRODUCT_PRINCIPLES.md`, `PRODUCT_STRATEGY.md`, and `ROADMAP.md`.

It must never contradict those higher-level constitutional documents.

Design evolution is expected. The product will learn from use, research, implementation, accessibility needs, technical constraints, and future roadmap phases. However, design evolution must happen through explicit versioned review.

No visual, UX, AI, copy, interaction, or communication improvement may weaken:

- Agency
- Dignity
- Privacy
- Consent
- Evidence
- Restraint
- Explainability
- Inclusion
- Recoverability
- Continuity
- Deterministic truth
- Honest uncertainty

Future amendments should also test known drift risks: calmness hiding evidence, progressive disclosure concealing risk, AI explanation becoming AI authority, privacy becoming emotionally opaque, inclusion becoming compliance-only, and restraint becoming under-warning.

Amendments should state:

- What changed
- Why the change is needed
- Which higher constitutional documents support it
- Which downstream documents or product areas are affected
- Whether the change introduces new risks

Future changes require an explicit versioned constitutional review.

No future design evolution may contradict `PRODUCT_MANIFESTO.md`, `PRODUCT_PRINCIPLES.md`, `PRODUCT_STRATEGY.md`, or `ROADMAP.md`.
