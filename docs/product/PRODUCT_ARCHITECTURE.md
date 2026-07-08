# PRODUCT_ARCHITECTURE.md

Version: 1.0  
Status: Accepted

## 1. Purpose of This Document

This document defines the constitutional product architecture of the personal finance coach dashboard.

Its purpose is to answer a durable question:

> How is the product conceptually organized so that financial reality, protection, risk, decision support, memory, narrative, simulation, forecasting, and AI remain in the correct relationship as the product evolves?

This is not a software architecture document. It does not define systems, services, APIs, databases, frameworks, programming languages, deployment, infrastructure, source code, or implementation details.

This document defines product responsibility before technical design exists. It describes the conceptual layers, boundaries, lifecycle, invariants, and governance rules that future system architecture, AI architecture, UX, copy, reporting, simulation, forecasting, and implementation work must inherit.

The product architecture exists to protect the product from drifting into feature-first complexity, AI authority, hidden assumptions, unsupported advice, shame-based financial pressure, or technical elegance that weakens user agency.

## 2. Constitutional Lineage

This document derives from the accepted constitutional documents:

- `PRODUCT_MANIFESTO.md`
- `PRODUCT_PRINCIPLES.md`
- `PRODUCT_STRATEGY.md`
- `ROADMAP.md`
- `DESIGN_SYSTEM.md`
- `COPY_GUIDELINES.md`
- `UX_PRINCIPLES.md`

The lineage is directional:

- The manifesto defines why the product deserves to exist.
- The principles define what the product must protect.
- The strategy defines how the product should create durable value.
- The roadmap defines how capabilities should mature over time.
- The design system defines how the product should feel.
- The copy guidelines define how the product should speak.
- The UX principles define how the product should behave through interaction.
- This document defines how the product is conceptually organized.

`PRODUCT_ARCHITECTURE.md` must never rewrite or weaken the accepted constitutional layer. It must make that layer architecturally actionable without becoming a technical specification.

When this document conflicts with a higher constitutional document, the higher document takes precedence. When future system, AI, data, technical, or implementation architecture conflicts with this document, this document takes precedence unless it is explicitly amended through constitutional review.

## 3. Product Architecture North Star

The product architecture exists to preserve the correct relationship between financial reality, user agency, interpretation, memory, simulation, forecasting, narrative, and AI as the product evolves.

Its enduring purpose is to ensure that the product remains a calm, evidence-based, privacy-first decision-support system where:

- Deterministic financial truth is established before interpretation.
- Essential needs and obligations are protected before optimization.
- Risk is explainable without shame.
- Exploration remains safe and reversible.
- Forecasts remain assumption-bound.
- Memory compounds understanding without rewriting history.
- AI supports comprehension without becoming authority.
- The user remains the final decision-maker.

The product architecture is therefore not a map of screens, features, systems, or technologies. It is the constitutional organization of product responsibility.

Every future capability should be evaluated by whether it strengthens or weakens this organization. A capability that is useful in isolation but disrupts deterministic truth, privacy, agency, evidence, restraint, dignity, or explainability does not belong in the product as designed.

## 4. Architecture Principles

Architecture principles are timeless rules for how the product should remain organized across future capabilities.

### 4.1 Truth Flows Upward

Financial truth begins in current financial reality and deterministic calculations. Higher layers may explain, organize, compare, contextualize, remember, simulate, or forecast from that truth, but they may not invent or replace it.

This principle owns the direction of architectural authority.

It does not own implementation flow, data transport, storage design, or technical sequencing.

It relates to every upper layer by constraining interpretation. Narrative, AI, memory, simulation, and forecast may add meaning, but they must remain anchored to deterministic understanding.

It must never allow an upper layer to overwrite, obscure, or soften calculated financial reality.

### 4.2 Evidence Precedes Interpretation

Risk labels, recommendations, forecasts, narratives, reports, and AI explanations must be grounded in visible evidence, assumptions, or calculated outputs before interpretation appears.

This principle owns the relationship between claims and reasons.

It does not own exact UI layout, copy strings, chart design, or technical validation mechanisms.

It relates to the Risk, Decision, Narrative, Forecast, Memory, and AI layers by requiring that each important interpretation has an inspectable basis.

It must never allow unsupported conclusions, unexplained severity, or confident narrative without evidence.

### 4.3 Authority Never Bypasses User Agency

No product layer, including AI, narrative, simulation, forecast, memory, or decision support, may make the final financial decision for the user or imply that consent has already been given.

This principle owns the final boundary of decision authority.

It does not own the user's actual financial behavior outside the product.

It relates to Decision Architecture by ensuring that every meaningful product path ends in review, choice, or deferral rather than automated authority.

It must never allow the product to simulate consent, create irreversible action, or present a recommendation as a command.

### 4.4 Layers Compose Rather Than Replace Each Other

Each product layer adds responsibility to the layers below it. A later layer may enrich understanding, but it must not erase, obscure, or weaken the responsibility of an earlier layer.

This principle owns architectural composition.

It does not own feature packaging or implementation modularity.

It relates to cross-layer design by requiring that protection builds on reality, risk builds on protection, decision support builds on risk, and narrative, memory, forecast, simulation, and AI remain additive rather than substitutive.

It must never allow a future capability to skip foundational layers for convenience, persuasion, or sophistication.

### 4.5 AI Remains Downstream From Deterministic Truth

AI may explain, summarize, reflect, ask questions, and clarify tradeoffs. It must not become the source of budgets, risk levels, payoff priority, projections, or financial truth.

This principle owns AI's architectural position.

It does not own model choice, prompts, providers, schemas, or technical integration.

It relates to the Narrative, Decision, Forecast, Simulation, and Memory layers as an interpretive support layer only after deterministic truth exists.

It must never allow AI to override calculations, invent facts, bypass decision review, or become the user's financial authority.

### 4.6 Memory Compounds Understanding

Memory should help users recognize change, continuity, patterns, and prior decisions. It must deepen understanding over time without surveillance, shame, or historical rewriting.

This principle owns the purpose of continuity.

It does not own persistence design, storage duration, data models, or technical retention policy.

It relates to future reflection by preserving context from prior financial states, decisions, reports, and risk patterns in a way that helps the user understand change.

It must never allow the product to rewrite history, punish the user with comparisons, or remember more sensitive detail than the product purpose requires.

### 4.7 Experience Expresses Architecture

UX, copy, visual design, coaching, reports, and flows must express the architecture. They may not compensate for, obscure, or contradict architectural responsibility.

This principle owns the relationship between conceptual architecture and lived product experience.

It does not own component design, interaction mechanics, or visual specifications.

It relates to every product surface by requiring that what the user experiences reflects the same order: reality, evidence, interpretation, options, and user decision.

It must never allow a polished experience to hide missing evidence, false certainty, weak protection, or AI overreach.

### 4.8 Simplicity Serves Understanding

Architectural complexity must justify itself by increasing user understanding, preserving architectural integrity, protecting user agency, or making financial reality safer to interpret.

This principle owns the product's resistance to unnecessary conceptual complexity.

It does not own technical simplicity, engineering implementation, or internal optimization.

It relates to Product Evolution by requiring new layers, capabilities, boundaries, and concepts to earn their place through clearer understanding or stronger protection.

It must never allow complexity to exist only because it is technically possible, intellectually attractive, or useful to internal product organization.

## 5. Architectural Scope

This document defines the conceptual product architecture.

### 5.1 Included

This document includes:

- Product layers
- Capability architecture
- Domain boundaries
- Responsibility boundaries
- Decision architecture
- Information architecture
- Information lifecycle
- Architectural invariants
- Memory architecture
- Narrative architecture
- Simulation architecture
- Forecast architecture
- AI participation boundaries
- Cross-layer rules
- Cross-layer relationships
- Product evolution architecture

### 5.2 Not Included

This document does not include:

- APIs
- Services
- Databases
- Frameworks
- Programming languages
- Deployment
- Infrastructure
- Technologies
- Source code
- Implementation details
- Vendor selection
- Model selection
- Technical architecture
- Operational architecture

These concerns may be defined later only if they inherit from this product architecture.

## 6. Core Product Architecture Model

The product is a layered decision-support system.

Its conceptual order is:

1. Reality
2. Protection
3. Obligation
4. Risk
5. Decision
6. Exploration
7. Forecast
8. Narrative
9. Memory
10. AI participation

This order is not a screen order, implementation order, or roadmap order. It is an order of product responsibility.

Lower layers establish financial truth, constraints, and evidence. Upper layers add context, explanation, continuity, and reflective support. No upper layer may replace the lower layer it depends on.

The model exists to ensure that the product remains understandable before it becomes advisory, protective before it becomes optimizing, evidence-based before it becomes persuasive, and human-controlled before it becomes automated.

## 7. Product Layers

Product layers define the enduring responsibilities of the product. Each layer owns a specific kind of product truth and must respect the layers around it.

### 7.1 Reality Layer

The Reality Layer establishes the user's current financial state.

**Purpose**

Its purpose is to make the user's present financial reality visible before the product interprets, prioritizes, simulates, forecasts, remembers, or explains anything.

**What It Owns**

- Current financial state
- Income
- Mandatory expenses
- Debts
- Credit card obligations
- Minimum payments
- Due dates
- Baseline financial facts
- Distinction between known, missing, stale, uncertain, hypothetical, and user-entered information

**What It Does Not Own**

- Recommendations
- Risk interpretation
- Forecasting
- Coaching
- User decisions
- Narrative conclusions
- Historical comparison

**How It Relates to Adjacent Layers**

The Reality Layer feeds the Protection Layer. Protection cannot decide what must be secured until reality is visible.

It also anchors the Information Lifecycle. Every later context must remain traceable to current financial reality or explicitly declare itself hypothetical, historical, forecasted, or interpreted.

**What It Must Never Violate**

It must never hide missing, stale, uncertain, or hypothetical information as if it were known current reality.

### 7.2 Protection Layer

The Protection Layer establishes what must be secured before optimization or optional action.

**Purpose**

Its purpose is to protect essential living capacity, mandatory expenses, minimum payments, and survival budget before the product suggests acceleration, optimization, or tradeoff exploration.

**What It Owns**

- Survival budget protection
- Mandatory expense coverage
- Minimum payment coverage
- Negative cash-flow recognition
- Constraints that block unsafe optimization
- Recognition that stabilization may take priority over acceleration

**What It Does Not Own**

- Debt acceleration goals
- Motivational framing
- AI coaching
- Long-term forecasting
- User commitment
- Shame or urgency

**How It Relates to Adjacent Layers**

The Protection Layer depends on the Reality Layer and constrains the Obligation and Risk layers. Obligations and priorities must be understood through what the user can responsibly protect.

**What It Must Never Violate**

It must never allow extra payoff, optimization, or encouraging narrative to override survival needs or minimum payment protection.

### 7.3 Obligation Layer

The Obligation Layer organizes mandatory financial commitments and debt pressure.

**Purpose**

Its purpose is to make required payments, due dates, debt balances, credit card pressure, and interest exposure visible and comparable after protection constraints are understood.

**What It Owns**

- Mandatory financial obligations
- Debt and credit card pressure
- Due date pressure
- Interest pressure
- Minimum obligations
- Payoff priority after protection constraints are satisfied
- Payment-after balance understanding

**What It Does Not Own**

- Emotional urgency
- Shame framing
- Forecast guarantees
- Final payment decisions
- AI-generated prioritization

**How It Relates to Adjacent Layers**

The Obligation Layer depends on Protection and informs Risk. It identifies where pressure exists, but Risk determines how that pressure should be communicated and prioritized.

**What It Must Never Violate**

It must never present optional acceleration as mandatory, and it must never frame debt as personal failure.

### 7.4 Risk Layer

The Risk Layer converts financial pressure into explainable attention signals.

**Purpose**

Its purpose is to help users understand what deserves attention, why it matters, and how serious it is without panic, shame, or unsupported scoring.

**What It Owns**

- `Düşük`, `Orta`, and `Yüksek` risk classification
- Risk reasons
- Critical situations as reasons under `Yüksek Risk`
- Evidence-backed severity
- Distinction between informational pressure and high-risk pressure

**What It Does Not Own**

- Panic language
- Unsupported scoring
- AI-generated severity changes
- User action
- Moral judgment

**How It Relates to Adjacent Layers**

The Risk Layer depends on Reality, Protection, and Obligation. It informs the Decision Layer by identifying what requires attention and why.

**What It Must Never Violate**

It must never create a visible risk level outside `Düşük`, `Orta`, and `Yüksek`. It must never raise or lower risk without evidence.

### 7.5 Decision Layer

The Decision Layer organizes responsible choice.

**Purpose**

Its purpose is to help the user understand what can be decided now, what should be reviewed, and what may be responsibly deferred.

**What It Owns**

- Decision sequence
- Tradeoff framing
- Responsible next-step structure
- Deferral as a valid outcome
- User agency boundary
- Distinction between options, recommendations, and decisions

**What It Does Not Own**

- Deterministic calculations
- AI authority
- Automated commitments
- Hidden persuasion
- Simulated consent

**How It Relates to Adjacent Layers**

The Decision Layer receives evidence from Risk and provides structure for Exploration. It also creates the user-agency boundary that AI, Narrative, Memory, Forecast, and Simulation must respect.

**What It Must Never Violate**

It must never imply that the product has already decided for the user.

### 7.6 Exploration Layer

The Exploration Layer supports safe scenario thinking.

**Purpose**

Its purpose is to let users ask "what if?" without accidentally modifying current reality, rewriting history, or committing to a plan.

**What It Owns**

- Scenario thinking
- Hypothetical states
- Reversible comparison
- Safe exploration
- Scenario assumptions
- Scenario deltas

**What It Does Not Own**

- Current reality
- Historical truth
- Forecast certainty
- Automatic plan changes
- User commitment

**How It Relates to Adjacent Layers**

The Exploration Layer depends on Decision because scenarios should answer meaningful decision questions. It may inform Forecast, Narrative, and Memory only when clearly labeled as hypothetical.

**What It Must Never Violate**

It must never modify current reality or present hypothetical outcomes as actual financial state.

### 7.7 Forecast Layer

The Forecast Layer supports future-facing understanding.

**Purpose**

Its purpose is to help the user anticipate possible future outcomes while keeping assumptions, uncertainty, and limits visible.

**What It Owns**

- Future-facing projections
- Assumption visibility
- Uncertainty framing
- Directional future understanding
- Forecast limits

**What It Does Not Own**

- Guaranteed outcomes
- Current-state truth
- User decisions
- AI certainty
- Historical rewriting

**How It Relates to Adjacent Layers**

The Forecast Layer may depend on Reality, Decision, Exploration, and Memory. It informs Narrative and future reflection, but it must remain clearly distinct from current truth and historical fact.

**What It Must Never Violate**

It must never present a projection as certainty or allow forecast output to become the source of current financial truth.

### 7.8 Narrative Layer

The Narrative Layer turns financial understanding into clear communication.

**Purpose**

Its purpose is to make calculated outputs, risk reasons, scenarios, forecasts, reports, and reflections understandable through calm, Turkish-first, non-shaming language.

**What It Owns**

- Explanation
- Turkish-first communication
- Calm interpretation
- Non-shaming framing
- Reports, summaries, and coaching language
- Distinction between fact, assumption, interpretation, and next consideration

**What It Does Not Own**

- New financial facts
- Unsupported conclusions
- Risk overrides
- User consent
- Deterministic calculations

**How It Relates to Adjacent Layers**

The Narrative Layer depends on the layers it explains. It may express Reality, Protection, Risk, Decision, Simulation, Forecast, and Memory, but it cannot change them.

**What It Must Never Violate**

It must never introduce conclusions that are unsupported by evidence or soften serious risk into ambiguity.

### 7.9 Memory Layer

The Memory Layer supports continuity over time.

**Purpose**

Its purpose is to help the user understand change, recurring patterns, prior decisions, and monthly progress without creating surveillance, dependence, or shame.

**What It Owns**

- Continuity
- Historical snapshots
- Monthly reflection
- Risk history
- Decision history
- Pattern recognition over time
- Prior report context

**What It Does Not Own**

- Rewriting past state
- Surveillance
- Shame-based comparison
- Replacing current review
- Hidden profiling

**How It Relates to Adjacent Layers**

The Memory Layer receives information from prior reality, decisions, risk states, reports, scenarios, and reflections. It informs future Reality review and future Decision support without replacing current evidence.

**What It Must Never Violate**

It must never rewrite history, use memory to shame the user, or preserve sensitive detail beyond product purpose and user trust.

### 7.10 AI Participation Layer

The AI Participation Layer provides interpretive support.

**Purpose**

Its purpose is to help users understand deterministic outputs, reflect on tradeoffs, and ask better review questions while keeping AI downstream from financial truth and user agency.

**What It Owns**

- Educational explanation
- Synthesis
- Review questions
- Tradeoff clarification
- Reflection support
- User-safe fallback framing

**What It Does Not Own**

- Source-of-truth calculations
- Risk classification
- Final recommendations as authority
- User decisions
- Irreversible actions
- Licensed-advisor posture

**How It Relates to Adjacent Layers**

AI may assist Narrative, Reflection, Forecast explanation, Scenario explanation, and Decision review only after deterministic truth and evidence exist.

**What It Must Never Violate**

It must never become the source of truth, bypass Decision Architecture, invent facts, override risk, or simulate authority over the user.

## 8. Capability Architecture

Capability architecture defines how product abilities should mature without becoming feature inventory. Capabilities exist to serve user understanding and responsible decision-making.

### 8.1 Foundation Capabilities

**Purpose**

Foundation capabilities make the current month legible.

**What They Own**

- Financial input understanding
- Monthly allocation
- Mandatory expense visibility
- Debt visibility
- Minimum payment visibility
- Survival budget
- Basic cash-flow orientation

**What They Do Not Own**

- Optimization
- AI interpretation
- Forecasting
- Historical analysis

**How They Relate to Adjacent Capabilities**

They feed Protection and Prioritization capabilities. Without foundation capabilities, later interpretation becomes unsupported.

**What They Must Never Violate**

They must never obscure current financial reality in favor of summaries that look helpful but lack evidence.

### 8.2 Protection Capabilities

**Purpose**

Protection capabilities determine whether mandatory needs and minimum obligations are secured.

**What They Own**

- Minimum payment coverage
- Survival threshold checks
- Negative cash-flow handling
- Safe-spending limits
- Constraints against unsafe extra payoff

**What They Do Not Own**

- Motivational pressure
- Debt acceleration narratives
- Forecast certainty

**How They Relate to Adjacent Capabilities**

They constrain Prioritization and Decision Support. If protection fails, acceleration should not be framed as responsible.

**What They Must Never Violate**

They must never be hidden to make a recommendation feel more optimistic.

### 8.3 Prioritization Capabilities

**Purpose**

Prioritization capabilities help the user understand what deserves attention first.

**What They Own**

- Due date awareness
- Interest pressure
- Avalanche payoff logic
- Extra payment eligibility
- Payment-after balance understanding

**What They Do Not Own**

- User consent
- Emotional pressure
- AI-led ordering

**How They Relate to Adjacent Capabilities**

They depend on Protection and inform Risk and Decision Support.

**What They Must Never Violate**

They must never recommend extra repayment when survival protection or minimum payment coverage is not secured.

### 8.4 Risk Capabilities

**Purpose**

Risk capabilities make financial pressure understandable and actionable without shame.

**What They Own**

- Risk level classification
- Risk reason generation
- Critical reason grouping
- Risk explanation

**What They Do Not Own**

- Panic
- Moral judgment
- Unsupported severity

**How They Relate to Adjacent Capabilities**

They use foundation, protection, and prioritization outputs to inform Decision Support.

**What They Must Never Violate**

They must never display risk levels outside `Düşük`, `Orta`, and `Yüksek`.

### 8.5 Decision Support Capabilities

**Purpose**

Decision Support capabilities prepare the user to act, review, compare, or defer.

**What They Own**

- Next-step framing
- Tradeoff comparison
- Review prompts
- Safe deferral
- Choice clarity

**What They Do Not Own**

- Automated commitments
- Hidden persuasion
- Replacing user judgment

**How They Relate to Adjacent Capabilities**

They depend on Risk and may trigger Exploration or Reflection.

**What They Must Never Violate**

They must never present a recommendation as if it were the user's decision.

### 8.6 Simulation Capabilities

**Purpose**

Simulation capabilities let users compare possible choices safely.

**What They Own**

- Scenario assumptions
- Scenario deltas
- Hypothetical comparison
- Reversibility

**What They Do Not Own**

- Current state changes
- Forecast guarantees
- Historical rewriting

**How They Relate to Adjacent Capabilities**

They extend Decision Support and may inform Forecast and Narrative.

**What They Must Never Violate**

They must never silently persist or present hypothetical changes as current reality.

### 8.7 Forecast Capabilities

**Purpose**

Forecast capabilities help users understand possible future paths.

**What They Own**

- Projection horizons
- Assumption visibility
- Uncertainty explanation
- Forecast limits

**What They Do Not Own**

- Certainty
- Guarantees
- Current truth

**How They Relate to Adjacent Capabilities**

They may use current, historical, or simulated context and must feed Narrative with explicit uncertainty.

**What They Must Never Violate**

They must never make future outcomes feel guaranteed.

### 8.8 Memory and Reflection Capabilities

**Purpose**

Memory and Reflection capabilities help users learn from change over time.

**What They Own**

- Monthly summaries
- Historical comparison
- Reports
- Progress reflection
- Risk and decision history

**What They Do Not Own**

- Surveillance
- Shame-based comparison
- Replacing current-state review

**How They Relate to Adjacent Capabilities**

They receive outputs from Narrative, Decision, Risk, Forecast, and Reality and inform future review.

**What They Must Never Violate**

They must never use history to punish or define the user.

### 8.9 AI-Assisted Capabilities

**Purpose**

AI-assisted capabilities improve comprehension and reflection.

**What They Own**

- Explanation
- Synthesis
- Review questions
- Educational coaching
- Fallback support

**What They Do Not Own**

- Financial truth
- Risk levels
- Payoff priority
- User decisions

**How They Relate to Adjacent Capabilities**

They attach to Narrative, Decision Support, Forecast explanation, Simulation explanation, and Reflection after deterministic outputs exist.

**What They Must Never Violate**

They must never act as the product's financial authority.

## 9. Domain Boundaries

Domain boundaries define the conceptual subject areas of the product. They prevent product responsibilities from blending into unsupported advice, automation, or implementation design.

### 9.1 Financial Reality Domain

This domain owns the user's current financial picture.

It does not own interpretation, advice, coaching, or future projection.

It relates to Survival and Protection by providing the facts that protection checks require.

It must never treat unknown or hypothetical information as current reality.

### 9.2 Survival and Protection Domain

This domain owns essential living capacity, minimum obligations, and stability constraints.

It does not own optimization, acceleration, or motivational language.

It relates to Debt and Obligation by setting the conditions under which extra payoff can be considered.

It must never allow optional action to override survival needs.

### 9.3 Debt and Obligation Domain

This domain owns debt pressure, mandatory payments, due dates, and payoff priority after protection is satisfied.

It does not own shame, panic, or final payment decisions.

It relates to Risk Understanding by supplying evidence of pressure.

It must never present debt as a moral failure.

### 9.4 Risk Understanding Domain

This domain owns risk classification and risk reasons.

It does not own unsupported scoring, fear-based motivation, or AI-modified severity.

It relates to Decision Support by clarifying what deserves attention.

It must never create risk without evidence.

### 9.5 Decision Support Domain

This domain owns choice structure, tradeoffs, review, and deferral.

It does not own consent, commitment, or automated financial action.

It relates to Simulation by identifying questions worth exploring.

It must never imply that the product's preferred option is already the user's decision.

### 9.6 Simulation Domain

This domain owns hypothetical comparison.

It does not own current financial truth or automatic persistence.

It relates to Forecast by offering assumption sets that may be projected forward.

It must never blur hypothetical and actual state.

### 9.7 Forecast Domain

This domain owns assumption-bound future-facing understanding.

It does not own certainty, guarantees, or current reality.

It relates to Narrative by requiring uncertainty-aware explanation.

It must never present projected outcomes as promises.

### 9.8 Narrative and Coaching Domain

This domain owns explanation, summary, coaching tone, report language, and reflective framing.

It does not own new financial facts, risk overrides, or user authority.

It relates to AI Participation because AI may assist narrative only within deterministic boundaries.

It must never invent unsupported conclusions.

### 9.9 Memory and Continuity Domain

This domain owns historical continuity, review context, and pattern awareness.

It does not own surveillance, identity judgment, or historical rewriting.

It relates to Future Reflection by helping prior context inform later understanding.

It must never use history to shame the user or replace current evidence.

## 10. Responsibility Boundaries

Responsibility boundaries define what each actor or product layer may own.

### 10.1 Deterministic Product Logic

**Purpose**

Deterministic product logic owns source-of-truth financial outputs.

**What It Owns**

- Budget calculations
- Minimum payment coverage
- Survival budget
- Interest pressure
- Payoff priority
- Risk inputs
- Projection inputs when future-facing outputs are later defined

**What It Does Not Own**

- User consent
- Emotional framing
- AI explanation
- Final financial decisions

**How It Relates to Adjacent Layers**

It supplies evidence to Protection, Risk, Decision, Narrative, Forecast, Simulation, Memory, and AI.

**What It Must Never Violate**

It must never be replaced by narrative confidence or AI-generated interpretation.

### 10.2 Product Copy and Narrative

**Purpose**

Product copy owns how truth is communicated.

**What It Owns**

- Clarity
- Tone
- Turkish-first communication
- Explanation hierarchy
- Non-shaming framing

**What It Does Not Own**

- Financial truth
- Risk overrides
- Hidden persuasion

**How It Relates to Adjacent Layers**

It expresses deterministic outputs, risk reasons, decisions, simulations, forecasts, and memory in understandable language.

**What It Must Never Violate**

It must never make unsupported claims or hide evidence to sound simpler.

### 10.3 AI

**Purpose**

AI owns assisted interpretation and reflection.

**What It Owns**

- Educational explanation
- Synthesis
- Review questions
- Tradeoff language
- Fallback-friendly coaching support

**What It Does Not Own**

- Calculations
- Risk levels
- Source-of-truth outputs
- User decisions
- Irreversible actions

**How It Relates to Adjacent Layers**

AI sits downstream from deterministic truth and adjacent to Narrative, Reflection, and Decision Support.

**What It Must Never Violate**

AI must never become the product's financial authority.

### 10.4 User

**Purpose**

The user owns final decision authority.

**What They Own**

- Financial goals
- Personal judgment
- Final decisions
- Deferral
- Corrections to inputs
- Consent for future approved high-impact actions

**What They Do Not Own**

- Product calculation correctness
- Product explanation accuracy
- Product safety guardrails

**How They Relate to Adjacent Layers**

The product prepares the user to decide by making reality, evidence, options, risks, assumptions, and uncertainty understandable.

**What This Boundary Must Never Violate**

The product must never transfer responsibility to the user by hiding its own uncertainty, errors, missing evidence, or AI limitations.

## 11. Decision Architecture

Decision Architecture defines how the product supports responsible choice without taking control.

### 11.1 Decision Sequence

The product should organize decisions through this sequence:

1. What is true now?
2. What must be protected?
3. What obligations are mandatory?
4. What risks exist?
5. What options are available?
6. What assumptions matter?
7. What can be decided now?
8. What should be deferred?

This sequence owns the order of decision comprehension.

It does not own implementation flow, UI steps, or technical state transitions.

It relates to all layers by ensuring that decisions come after reality, evidence, risk, and assumptions.

It must never allow recommendation-first product behavior.

### 11.2 Decision Types

The product may support these decision types:

- Immediate attention
- Planned action
- Review later
- Scenario exploration
- Deferral

These types own the user's possible response modes.

They do not own financial commitments, payment execution, or external actions.

They relate to Risk, Simulation, Forecast, Narrative, and Memory by giving those layers a responsible decision frame.

They must never pressure the user into immediacy when deferral is responsible.

### 11.3 Decision Guardrails

Decision guardrails protect agency.

They own the boundaries around recommendation and action:

- No pressure without evidence
- No recommendation before protection checks
- No AI decision authority
- No hidden assumptions
- No simulated consent

They do not own technical permission systems or workflow implementation.

They relate to every layer that might influence a user's financial choice.

They must never allow product confidence to substitute for user review.

### 11.4 State Transition Legitimacy

Decision Architecture governs when one conceptual state may influence another.

Legitimate transitions must preserve provenance, evidence, uncertainty, and user agency. A scenario may inform a decision, a forecast may inform review, a narrative may clarify evidence, and memory may support reflection, but none of these transitions may silently change what kind of information the user is seeing.

Hypothetical information never silently becomes current reality. Forecast context never becomes committed intent. Narrative never becomes historical truth. AI interpretation never becomes memory by default. Memory preserves what occurred, not what was suggested.

This section owns the legitimacy of conceptual state changes.

It does not own workflow mechanics, storage mechanics, interface steps, or implementation rules.

It relates to Information Architecture and Information Lifecycle by ensuring that state categories remain visible as information gains context.

It must never allow a transition that weakens provenance, hides uncertainty, or bypasses user review.

## 12. Information Architecture

Information Architecture defines how meaning should be ordered and distinguished.

### 12.1 Information Hierarchy

The product's information hierarchy is:

1. Reality
2. Evidence
3. Interpretation
4. Options
5. Decision

This hierarchy owns the order in which information earns authority.

It does not own visual layout, navigation, screen structure, or technical information storage.

It relates to Narrative, UX, AI, Reports, Simulation, and Forecast by requiring that interpretation and options remain downstream from reality and evidence.

It must never allow advice, persuasion, or coaching to appear before the basis for judgment is clear.

### 12.2 Information States

The product must distinguish these information states:

- Current state
- Hypothetical state
- Forecast state
- Historical state
- AI-interpreted state

These states own the conceptual identity of information.

They do not own technical state management.

They relate to Memory, Simulation, Forecast, and AI by preventing users from confusing what is true now with what is assumed, projected, remembered, or interpreted.

They must never be blurred.

### 12.3 Information Flow

Information should conceptually flow:

1. Inputs to calculations
2. Calculations to protection
3. Protection to risk
4. Risk to decisions
5. Decisions to exploration or reflection
6. Exploration to forecast when relevant
7. Forecast to narrative with uncertainty
8. Narrative to memory when appropriate
9. Memory to future reflection

This flow owns the product's order of meaning.

It does not own software data flow.

It relates to the Information Lifecycle by describing how information gains context.

It must never allow upper-layer meaning to rewrite lower-layer truth.

Information may inform later states, but it may not silently become a different state. A forecast may inform a future review without becoming intent. A simulation may inform a choice without becoming current reality. AI interpretation may inform narrative without becoming fact. Narrative may support memory only when the remembered object is what occurred, not what the product merely suggested.

## 13. Information Lifecycle

Information Lifecycle defines how financial information progresses through the product from current financial reality to future reflection.

The lifecycle is conceptual, not technical. It does not describe data storage, APIs, systems, services, or implementation flow.

Financial information gains context as it moves upward through the product architecture, but it must never lose its deterministic foundation.

The lifecycle must also govern degraded conditions. When information is missing, stale, delayed, partially synchronized, externally unavailable, or uncertain, the architecture should reduce certainty rather than produce invented confidence. Degraded information may still support orientation, but it must not pretend to provide the same authority as complete, current, and deterministic information.

### 13.1 Financial Reality

Information begins as current financial reality.

It owns what the user currently knows or provides about income, mandatory expenses, debts, credit cards, minimum payments, due dates, interest pressure, and survival needs.

It does not own interpretation, risk, recommendation, forecast, or memory.

It relates to Deterministic Understanding as the starting material for calculated truth.

It must never treat missing, uncertain, stale, or hypothetical information as confirmed reality.

### 13.2 Deterministic Understanding

Financial reality becomes deterministic understanding when current-state outputs are calculated.

It owns cash-flow position, mandatory expense coverage, minimum payment coverage, survival budget, spending capacity, interest pressure, payment-after balances, and payoff pressure.

It does not own narrative, coaching, user decisions, or AI interpretation.

It relates to Protective Context by establishing what can be protected.

It must never be replaced by narrative confidence.

### 13.3 Protective Context

Deterministic understanding becomes protective context when the product identifies what must be secured before optional action.

It owns survival protection, mandatory expense coverage, minimum payment coverage, negative cash-flow recognition, and constraints against unsafe optimization.

It does not own acceleration, persuasion, or future guarantees.

It relates to Risk Context by identifying which constraints create pressure.

It must never be hidden by a more optimistic product story.

### 13.4 Risk Context

Protective context becomes risk context when the product identifies pressure, urgency, and severity.

It owns evidence-backed risk levels and reasons.

It does not own panic, shame, or unsupported prioritization.

It relates to Decision Context by identifying what deserves attention.

It must never add severity without evidence.

### 13.5 Decision Context

Risk context becomes decision context when the product clarifies what the user can responsibly consider.

It owns options, tradeoffs, review needs, assumptions, and valid deferral paths.

It does not own user consent or automated action.

It relates to Exploration Context by identifying what scenarios may be useful.

It must never imply that a recommendation is already a decision.

### 13.6 Exploration Context

Decision context may become exploration context when the user examines scenarios.

It owns hypothetical comparison and reversible assumption changes.

It does not own current reality or historical truth.

It relates to Forecast Context when hypothetical assumptions are projected forward.

It must never modify current reality.

### 13.7 Forecast Context

Exploration or current-state information may become forecast context when the product looks forward.

It owns assumption-bound future-facing understanding.

It does not own certainty or current truth.

It relates to Narrative Context by requiring uncertainty-aware explanation.

It must never become a promise.

### 13.8 Narrative Context

Calculated, protective, risk, decision, simulation, or forecast information may become narrative context.

It owns explanation, summaries, coaching language, reports, and reflection.

It does not own new financial facts or unsupported conclusions.

It relates to Memory Context when explanations become part of later review.

It must never invent meaning that the evidence does not support.

### 13.9 Memory Context

Information may become memory context when it is preserved as a prior snapshot, decision history, risk pattern, monthly review, or report reference.

It owns continuity and historical reference.

It does not own rewriting prior reality.

It relates to Future Reflection by helping the user compare change over time.

It must never rewrite history or shame the user.

### 13.10 Future Reflection

Memory context supports future reflection.

It owns comparison, pattern recognition, prior decision review, and future understanding.

It does not own current truth unless current reality is reviewed again.

It relates back to the Reality Layer by helping the user understand how the present differs from the past.

It must never turn historical comparison into blame.

### 13.11 Lifecycle Rule

At every lifecycle stage, information may gain context, meaning, comparison, or narrative value.

It must not lose:

- Its deterministic foundation
- Its evidence trail
- Its state category
- Its uncertainty markers
- Its privacy constraints
- Its relationship to user agency

Every conceptual state change must preserve provenance. The product must continue to distinguish what was entered, calculated, assumed, simulated, forecasted, AI-interpreted, narrated, remembered, or chosen by the user.

Degraded information should degrade safely. It should preserve deterministic truth where available, expose uncertainty where necessary, and keep the user oriented without filling gaps with unsupported certainty.

## 14. Architectural Invariants

Architectural invariants are timeless truths that every future product architecture decision must preserve.

They are not implementation rules. They are constitutional constraints on how the product may evolve.

- Financial reality always precedes recommendation.
- Deterministic understanding always precedes interpretation.
- User agency always remains final.
- Evidence always precedes interpretation.
- Provenance always remains attached to conceptual state.
- Protection always precedes optimization.
- Minimum obligations and survival needs always precede extra payoff suggestions.
- Missing, stale, delayed, partially synchronized, externally unavailable, or uncertain information always reduces certainty.
- Risk always requires explainable reasons.
- Visible risk levels always remain `Düşük`, `Orta`, and `Yüksek`.
- Critical conditions always appear as reasons under `Yüksek Risk`, not as a separate visible level.
- Memory never rewrites history.
- Memory preserves what occurred, not what was merely suggested.
- Memory deepens continuity without creating surveillance.
- Simulation never modifies current reality.
- Simulation remains hypothetical until the user explicitly chooses otherwise in a future approved product flow.
- Forecast never becomes certainty.
- Forecast never becomes committed intent.
- Forecast remains assumption-bound and uncertainty-aware.
- AI never becomes the source of truth.
- AI never bypasses deterministic finance logic.
- AI never bypasses user decision authority.
- AI interpretation never becomes memory, history, or financial fact by default.
- Narrative never introduces unsupported conclusions.
- Narrative never becomes historical truth.
- Product experience never hides deterministic evidence.
- Architectural complexity must increase user understanding or preserve architectural integrity.
- Privacy is preserved across every architectural layer.
- Sensitive financial information is minimized wherever interpretation, AI, memory, reporting, or reflection can work from summarized context.
- User-facing product behavior remains Turkish-first.
- The product supports responsible decisions; it does not simulate consent.
- Future capabilities must attach to the architecture without replacing its lower layers.

## 15. Memory Architecture

Memory Architecture defines how the product supports continuity over time.

### 15.1 Purpose of Memory

Memory exists to help users understand change, patterns, decisions, risk, and progress across time.

It owns continuity, reflection, and pattern recognition.

It does not own surveillance, hidden profiling, or judgment of the user's identity.

It relates to Narrative and Future Reflection by making history understandable.

It must never become a mechanism for shame, pressure, or dependency.

### 15.2 What Memory May Preserve

Memory may preserve:

- Monthly summaries
- Risk history
- Decision history
- Scenario assumptions
- Report snapshots
- Prior forecast assumptions
- Prior review context

It owns historical reference.

It does not own every raw sensitive detail.

It relates to privacy by preserving only what supports product purpose.

It must never preserve unnecessary sensitive financial detail when summarized context is sufficient.

### 15.3 What Memory Must Protect

Memory must protect:

- Sensitive financial detail
- User dignity
- Local-first expectations
- Consent
- Historical integrity

It owns trust over time.

It does not own expansion of data collection for convenience.

It relates to AI and reports by limiting what future interpretation may consume.

It must never expose, exaggerate, or reinterpret history without evidence.

### 15.4 Memory Boundaries

Memory must remember without surveillance, support continuity without dependency, and enable reflection without shame.

It owns the boundary between helpful continuity and invasive accumulation.

It does not own behavioral tracking for persuasion.

It relates to Product Evolution by constraining future personalization.

It must never turn memory into a pressure system.

## 16. Narrative Architecture

Narrative Architecture defines how product meaning is expressed.

### 16.1 Purpose of Narrative

Narrative exists to make financial reality understandable, preserve calm, preserve seriousness, and support user agency.

It owns explanation, summary, coaching tone, and report language.

It does not own financial truth, risk overrides, or decisions.

It relates to Copy Guidelines by expressing reality, evidence, interpretation, options, and decision in the correct order.

It must never prioritize polish over comprehension.

### 16.2 Narrative Sources

Narrative may derive from:

- Deterministic outputs
- Risk reasons
- Scenario results
- Forecast assumptions
- Historical patterns
- Decision context

It owns expression of sourced meaning.

It does not own unsupported inference.

It relates to AI because AI may assist narrative only from approved sources.

It must never create conclusions that cannot be traced to evidence.

### 16.3 Narrative Boundaries

Narrative must remain calm, clear, educational, Turkish-first, and non-shaming.

It owns tone and interpretive framing.

It does not own panic, false reassurance, advice without basis, or authority posture.

It relates to Risk and Decision by helping users understand seriousness without pressure.

It must never hide uncertainty or serious risk for comfort.

## 17. Simulation Architecture

Simulation Architecture defines safe hypothetical exploration.

### 17.1 Purpose of Simulation

Simulation exists to help users compare possible choices, tradeoffs, and assumptions without consequence.

It owns safe exploration and hypothetical comparison.

It does not own current truth, saved decisions, or guaranteed outcomes.

It relates to Decision Support by helping users understand possible paths before choosing.

It must never change reality without explicit future-approved user action.

### 17.2 Simulation Boundaries

Simulation must remain visibly hypothetical.

It owns distinction between scenario and actual state.

It does not own persistence, commitment, or current financial history.

It relates to Narrative by requiring clear language about assumptions and deltas.

It must never silently persist or blur scenario outcomes with actual financial status.

### 17.3 Simulation Relationships

Simulation relates to:

- Current state as the baseline
- Decision Support as the question source
- Forecast as a possible future extension
- AI explanation as downstream interpretation
- Memory as optional reflection context when appropriate

It owns comparison relationships.

It does not own replacing the current plan.

It must never pressure users to act on hypotheticals.

## 18. Forecast Architecture

Forecast Architecture defines future-facing product understanding.

### 18.1 Purpose of Forecasting

Forecasting exists to help users anticipate possible future conditions while keeping assumptions visible.

It owns projection, assumption visibility, and uncertainty framing.

It does not own certainty, promises, or source-of-truth current state.

It relates to Simulation, Memory, and Narrative by projecting from clearly defined assumptions.

It must never claim the future is guaranteed.

### 18.2 Forecast Boundaries

Forecasts are not promises.

They own future-facing directional understanding.

They do not own deterministic present truth.

They relate to Risk by helping users anticipate possible pressure, not by replacing current risk evidence.

They must never create false precision.

### 18.3 Forecast Relationships

Forecasts may relate to:

- Simulations through projected assumptions
- Reports through future-facing summaries
- Risk through anticipated pressure
- User decisions through tradeoff awareness
- AI through explanation of assumptions and uncertainty

They own assumption-bound context.

They do not own final decision authority.

They must never become a product promise.

## 19. AI Participation Boundaries

AI Participation Boundaries define what AI may and may not contribute to the product architecture.

### 19.1 What AI May Do

AI may:

- Explain
- Summarize
- Ask review questions
- Clarify tradeoffs
- Interpret deterministic outputs
- Help users reflect
- Support educational coaching

It owns assisted comprehension.

It also owns preservation of AI provenance wherever its explanations, summaries, questions, reflections, or interpretations are used.

It does not own financial authority, historical truth, memory by default, or deterministic fact.

It relates to Narrative, Decision, Forecast, Simulation, and Memory only after deterministic context exists.

It must never become the first or final source of product truth, and its outputs must remain visibly distinguishable from deterministic financial truth.

### 19.2 What AI Must Not Do

AI must not:

- Calculate source-of-truth values
- Override risk
- Invent facts
- Make decisions
- Create urgency
- Act as a licensed advisor
- Bypass user review
- Trigger irreversible actions
- Silently become memory, history, or financial fact
- Lose provenance when reused by narrative, reflection, or future architecture

It owns none of these responsibilities.

It relates to Architecture Principles as the clearest test of downstream interpretation.

It must never be treated as a shortcut around deterministic product responsibility.

### 19.3 AI Placement in Product Architecture

AI is downstream from deterministic truth, outside final decision authority, and inside narrative and reflection support.

It owns interpretive assistance after evidence exists.

It does not own the product's source of truth.

It relates to future AI architecture, which must derive from this boundary.

It must never expand its role without preserving deterministic truth, privacy, user agency, and visible provenance.

## 20. Cross-Layer Rules

Cross-Layer Rules are architectural constraints. They govern how layers may interact.

- No upper layer may overwrite deterministic truth.
- Evidence must remain available wherever interpretation appears.
- Narrative cannot introduce unsupported conclusions.
- AI cannot bypass Decision Architecture.
- AI cannot override risk, protection, or deterministic calculations.
- AI outputs must remain visibly distinguishable from deterministic financial truth.
- AI interpretation cannot silently become memory, history, or financial fact.
- AI provenance must be preserved wherever AI-assisted explanation, summary, question, reflection, or interpretation is reused.
- Simulation cannot modify current reality.
- Hypothetical information cannot silently become current reality.
- Forecast cannot become the source of truth.
- Forecast context cannot become committed intent.
- Memory cannot rewrite history.
- Memory must preserve what occurred, not what was merely suggested.
- Risk cannot be raised or lowered without evidence.
- Protection constraints cannot be hidden by prioritization or coaching.
- Decision support cannot imply consent.
- Experience cannot hide evidence.
- Copy cannot soften serious risk into ambiguity.
- Forecasts and simulations must remain visibly assumption-bound.
- Historical comparison must preserve dignity and avoid shame.
- User agency remains the final boundary across all layers.

These rules own architectural safety across boundaries.

They do not own implementation enforcement mechanisms.

They relate to every future architecture document that derives from this one.

They must never be treated as optional product preferences.

## 21. Cross-Layer Relationships

Cross-layer relationships describe how layers support one another.

- Reality informs Protection.
- Protection constrains Obligation and Prioritization.
- Obligation informs Risk.
- Risk informs Decision Support.
- Decision Support frames Exploration.
- Exploration may inform Forecasting.
- Forecasting informs Narrative with uncertainty.
- Narrative helps Memory become understandable.
- Memory informs future Reality review.
- AI may assist Narrative, Reflection, and Explanation only after deterministic truth exists.

These relationships own the product's conceptual composition.

They do not own software dependencies or technical architecture.

They relate to Cross-Layer Rules by showing permitted support patterns under strict constraints.

They must never be interpreted as permission for upper layers to replace lower layers.

## 22. Product Evolution Architecture

Product Evolution Architecture defines how the product may grow without violating its constitutional organization.

### 22.1 Capability Maturity Path

The product should mature in this order:

- Clarity before optimization
- Protection before acceleration
- Simulation before automation
- Forecasting before commitment
- AI explanation before AI initiative
- Memory before personalization
- Evidence before persuasion

This path owns product maturity logic.

It does not own release dates, implementation phases, or delivery sequencing.

It relates to Roadmap by preserving the reason capabilities should mature gradually.

It must never allow sophisticated capabilities to appear before users can understand current financial reality.

### 22.2 Expansion Rules

Future capabilities must:

- Attach to a product layer
- Make their source of truth explicit
- Make their user decision point explicit
- Preserve privacy
- Bound AI participation
- Preserve risk evidence
- Distinguish current, hypothetical, forecast, historical, and interpreted state
- Preserve provenance across conceptual state changes
- Degrade safely when information is missing, stale, delayed, partially synchronized, externally unavailable, or uncertain
- Justify architectural complexity through user understanding or architectural integrity

These rules own architectural fit.

They do not own technical acceptance criteria.

They relate to future system, AI, data, and UX architecture by defining what they must inherit.

They must never allow a capability to enter the product without responsibility boundaries.

Future capabilities may refine boundaries, extend responsibilities, and compose with existing layers. They may not dissolve deterministic truth, user agency, architectural ownership, evidence hierarchy, or responsibility boundaries.

### 22.3 Future Architecture Derivation

Future architecture documents must derive from this document.

`SYSTEM_ARCHITECTURE.md` should derive conceptual system relationships, state categories, and product boundaries from this product architecture without becoming the authority over product meaning.

`AI_ARCHITECTURE.md` should derive AI role, input boundaries, output principles, fallback rules, and evaluation responsibilities from this product architecture without expanding AI beyond its allowed role.

Implementation documents should remain subordinate to product architecture.

This section owns architectural inheritance.

It does not own future technical choices.

It must never allow technical architecture to redefine product responsibility.

## 23. Product Architecture Guardrails

The product must preserve these guardrails:

- Deterministic truth first
- User agency final
- Turkish-first user experience
- Privacy-first financial data handling
- Risk with evidence
- AI as support, not authority
- Simulation without consequence
- Forecast without false certainty
- Memory without surveillance
- Narrative without shame
- Protection before optimization
- Evidence before interpretation
- Deferral as valid decision
- Current reality distinct from hypothetical, forecast, historical, and interpreted state
- Provenance preserved across every conceptual state change
- Degraded information reduces certainty rather than inventing confidence
- AI output distinguishable from deterministic truth
- Complexity justified by user understanding or architectural integrity

These guardrails own long-term product integrity.

They do not own detailed implementation checks.

They relate to every future product, design, system, AI, data, reporting, and implementation decision.

They must never be weakened for speed, novelty, automation, or polish.

Future interpretation should follow this constitutional hierarchy:

- Architecture Principles explain architectural philosophy.
- Architectural Invariants define timeless truths.
- Cross-Layer Rules constrain interaction between layers.
- Product Architecture Guardrails summarize non-negotiable architectural behavior.

When these sections appear to overlap, the overlap is intentional. Principles explain why the architecture exists, invariants define what must remain true, cross-layer rules govern interaction, and guardrails provide the practical constitutional checklist.

## 24. Architectural Review Questions

Future product architecture decisions should be reviewed against these questions:

- Does this architecture preserve deterministic truth as the source of financial reality?
- Does every upper layer depend on, rather than replace, the layers below it?
- Does the user remain the final decision-maker?
- Are simulation, forecast, memory, and current reality clearly separated?
- Are AI responsibilities bounded and downstream?
- Are risk labels evidence-backed and limited to `Düşük`, `Orta`, and `Yüksek`?
- Do critical conditions appear as reasons under `Yüksek Risk` rather than as a separate visible level?
- Does memory deepen understanding without surveillance or shame?
- Does narrative explain without inventing?
- Does the experience make evidence visible rather than hiding it?
- Are privacy expectations preserved across every layer?
- Does the capability preserve protection before optimization?
- Does the capability support deferral when immediate action is not responsible?
- Can future system architecture derive from this without redefining product meaning?
- Can future AI architecture derive from this without expanding AI authority?
- Can future implementation documents inherit from this without turning it into software architecture?

These questions own governance review.

They do not own implementation approval, release approval, or delivery planning by themselves.

They relate to all future architecture work as the minimum conceptual review standard.

They must never be replaced by purely technical readiness criteria.

Future changes require an explicit versioned constitutional review.

No future product architecture evolution may contradict:

- `PRODUCT_MANIFESTO.md`
- `PRODUCT_PRINCIPLES.md`
- `PRODUCT_STRATEGY.md`
- `ROADMAP.md`
- `DESIGN_SYSTEM.md`
- `COPY_GUIDELINES.md`
- `UX_PRINCIPLES.md`
