# UX_PRINCIPLES.md

Version: 1.0  
Status: Accepted

## 1. Purpose of This Document

This document defines the constitutional interaction doctrine of the product.

Its purpose is to answer a durable question:

> How should users experience the product while making financial decisions?

This document governs:

- Interaction philosophy
- Decision flows
- Navigation philosophy
- Attention management
- Progressive disclosure
- Friction
- Confirmations
- Recoverability
- Exploration
- Interruption
- Onboarding
- Discoverability
- Long-term user experience

This document does not define:

- Screens
- UI components
- Figma files
- Layouts
- Animations
- Implementation specifications
- Exact interaction mechanics
- Wireframes

The purpose of UX in this product is not to move users through tasks as quickly as possible. It is to help users understand financial reality, protect what must be protected, explore safely, evaluate tradeoffs, recover from mistakes, and make responsible decisions with agency.

## 2. Constitutional Lineage

This UX doctrine derives from the accepted constitutional documents:

- `PRODUCT_MANIFESTO.md`
- `PRODUCT_PRINCIPLES.md`
- `PRODUCT_STRATEGY.md`
- `ROADMAP.md`
- `DESIGN_SYSTEM.md`
- `COPY_GUIDELINES.md`

The lineage is directional:

- The manifesto defines why the product deserves to exist.
- The principles define what the product must protect.
- The strategy defines how the product should create durable value.
- The roadmap defines how capabilities should mature over time.
- The design system defines how those commitments should feel through design.
- The copy guidelines define how those commitments should sound through communication.
- This document defines how those commitments should behave through interaction.

`UX_PRINCIPLES.md` must never introduce interaction behavior that weakens agency, dignity, clarity, evidence, restraint, deterministic truth, privacy, consent, uncertainty, explainability, progressive disclosure, inclusion, recoverability, continuity, responsibility without blame, appropriate numerical precision, state transparency, decision deferral, or product voice independence from AI.

## 3. UX North Star

Using the product should feel orienting, calm, safe to explore, evidence-grounded, and decision-supportive.

The user should feel more capable after interacting with the product, not more dependent on it. The experience should help users build financial understanding over time rather than merely complete isolated tasks.

The product should not rush users into action before they understand reality, constraints, risks, and tradeoffs. It should also not bury users in information before they can take a responsible next step.

Not deciding yet may be the most responsible outcome when evidence is insufficient, uncertainty is high, consequences are significant, or additional information would materially improve judgment. The product must never pressure users into unnecessary immediacy.

The experience should support a humane arc:

1. Recognize reality.
2. Understand cash flow.
3. See constraints.
4. Compare tradeoffs.
5. Consider choices.
6. Understand consequences.
7. Decide or safely defer.

## 4. Core UX Commitments

Each commitment in this section governs future product experience across flows, navigation, onboarding, exploration, decision support, AI interaction, recovery, and long-term use.

### 4.1 Orientation Before Action

**Constitutional Source**

This commitment derives from the constitutional requirement that users understand financial reality before recommendations, optimization, or automation.

**Principle**

Users should understand where they are financially before being asked to act.

**What this means**

Interaction should establish the user's current financial context before asking for decisions. Income, obligations, minimum payments, survival budget, risk, and relevant constraints should be understandable before the product presents optimization or action paths.

Orientation does not require showing every detail at once. It requires that users know enough to understand why the next interaction matters.

**What this rejects**

- Action before context
- Recommendation-first flows
- Optimization before survival pressure is visible
- Decisions without current-state understanding
- Asking users to act on unexplained outputs

### 4.2 Decisions Before Features

**Constitutional Source**

This commitment derives from the product strategy and design doctrine that the product should follow user financial decisions rather than internal feature inventory.

**Principle**

The experience should follow financial decision needs, not feature inventory.

**What this means**

UX should be organized around what the user needs to understand or decide. Features should appear because they help a meaningful financial decision, not because they exist in the product.

The product should make the user's decision journey more coherent, not require users to assemble meaning from disconnected tools.

**What this rejects**

- Feature-first UX
- Navigation based primarily on internal data models
- Tool exposure without decision purpose
- AI-first flows that ignore user context
- Making users discover the product's structure before understanding their own situation

### 4.3 Agency Before Optimization

**Constitutional Source**

This commitment derives from the constitutional requirement that users remain in control of financial decisions and that deterministic outputs support, rather than replace, judgment.

**Principle**

The product should support user choice before maximizing speed, automation, or efficiency.

**What this means**

UX should help users review context, understand tradeoffs, and choose deliberately. Speed is valuable only when it does not reduce comprehension, consent, or control.

Automation may reduce effort, but it must not take over decisions that require user judgment.

Agency includes the ability to defer. The product should support intentional "not yet" moments when waiting, reviewing, or gathering more information is more responsible than immediate action.

**What this rejects**

- Over-automation
- Efficiency that weakens understanding
- One-click high-impact decisions
- AI-led decision paths
- Optimization that hides user choice
- Pressure to decide before evidence supports action

### 4.4 Friction as Protection

**Constitutional Source**

This commitment derives from the design doctrine of agency, consent, recoverability, and restraint.

**Principle**

Friction is appropriate when it protects understanding, consent, reversibility, or high-impact decisions.

**What this means**

Not all friction is bad. Some moments deserve review, confirmation, explanation, or pause. Friction should appear when it protects the user from misunderstanding, accidental commitment, unclear data movement, or hard-to-recover consequences.

Friction should not be used to manipulate, delay, or trap users.

**What this rejects**

- Friction for engagement
- Obstructive friction
- Consent fatigue
- Confirmation without comprehension
- High-impact action without review
- Friction that hides alternatives

### 4.5 Progressive Disclosure Without Concealment

**Constitutional Source**

This commitment derives from the design doctrine of progressive disclosure and the communication hierarchy of reality, evidence, interpretation, recommendation, and user decision.

**Principle**

The product should sequence information responsibly without hiding meaningful risk or evidence.

**What this means**

UX should reveal information in the order needed for responsible understanding. The product should begin with what the user needs now, then make evidence, assumptions, and deeper detail available as needed.

Progressive disclosure is not concealment. It must never hide meaningful risk, constraints, assumptions, or evidence that could affect a financial decision.

**What this rejects**

- Dashboard overload
- Concealment disguised as simplicity
- Detail dumping
- Hidden assumptions
- Hidden risk
- Depth without orientation

### 4.6 Exploration Without Consequence

**Constitutional Source**

This commitment derives from the roadmap's scenario and forecast capabilities, the design doctrine of recoverability, and the communication doctrine that simulated and actual states must remain distinguishable.

**Principle**

Users should be able to explore scenarios, forecasts, and options without accidentally changing their financial reality.

**What this means**

Exploration should feel safe. Users should be able to ask "what if?" without fear that they have changed real data, committed to a plan, or triggered an irreversible action.

Hypothetical states, assumptions, and outcomes should remain distinguishable from current reality.

**What this rejects**

- Exploration that silently persists changes
- Confusing simulated and actual data
- Scenario outcomes presented as promises
- Pressure to act on hypotheticals
- Hidden consequences during exploration

### 4.7 Recovery Over Punishment

**Constitutional Source**

This commitment derives from the design and copy doctrines of recoverability, responsibility without blame, and dignity under financial stress.

**Principle**

Mistakes, invalid inputs, stale data, and failed states should help users recover.

**What this means**

When something goes wrong, interaction should help users understand what happened and how to continue. The product should preserve dignity and avoid making users afraid to explore.

Recovery should apply to user mistakes, changed assumptions, stale information, provider failures, misunderstood outputs, and interrupted flows.

**What this rejects**

- Punitive states
- Dead-end errors
- Blame
- Data loss without warning
- Failed AI making the product feel broken
- Recovery paths that require financial expertise

### 4.8 Attention as a Limited Resource

**Constitutional Source**

This commitment derives from the design doctrine of restraint and the communication doctrine against artificial urgency, dashboard overload, and attention capture.

**Principle**

The product should protect user attention, especially under financial stress.

**What this means**

UX should prioritize what matters now. It should distinguish informational, optional, important, high-priority, and high-risk states based on actual consequence, not engagement goals.

The product should avoid competing calls to action, noisy surfaces, and unnecessary interruptions.

**What this rejects**

- Artificial urgency
- Notification pressure
- Visual or copy noise
- Treating every metric as equally important
- Engagement-driven UX
- Attention capture

### 4.9 Continuity Without Dependence

**Constitutional Source**

This commitment derives from the design doctrine of long-term continuity and the copy doctrine for reports, summaries, and temporal understanding.

**Principle**

The experience should help users understand change over time without making them unable to reason without the product.

**What this means**

UX should help users understand what changed, what stayed stable, what assumptions shifted, and what decisions remain open across months and years.

Continuity should strengthen the user's internal financial model. It should not create dependency through mystery, hidden logic, or product-only understanding.

**What this rejects**

- Treating each session as isolated
- Progress theater
- Scorecard shame
- Long-term history that creates dependence
- Trend claims without evidence
- Making the product the only place where financial meaning exists

### 4.10 Inclusion Through Comprehension

**Constitutional Source**

This commitment derives from the design doctrine of inclusive design and the communication doctrine of education without superiority.

**Principle**

UX should remain usable under stress, lower financial literacy, language uncertainty, and cognitive overload.

**What this means**

The product should assume users may arrive tired, anxious, distracted, embarrassed, or unfamiliar with financial terminology. Interaction should support comprehension without requiring confidence first.

Inclusion means users can perceive, understand, decide, and recover. It is not only compliance.

**What this rejects**

- Expert-only flows
- Cognitive overload
- Accessibility as afterthought
- Jargon-dependent interaction
- Treating confusion as user failure
- Experiences that punish low financial literacy

## 5. Mental Model Doctrine

UX should help users build an accurate internal understanding of how their financial reality works.

Interaction should progressively reinforce this model:

1. Reality
2. Cash Flow
3. Constraints
4. Trade-offs
5. Choices
6. Consequences

Reality means the user understands the current state of income, obligations, debt, due dates, risk, and available budget.

Cash Flow means the user understands how money moves through the month, including what enters, what must leave, and what remains.

Constraints mean the user understands mandatory expenses, minimum payments, survival budget pressure, due dates, interest pressure, and other limits.

Trade-offs mean the user understands that choosing one action may affect another, especially where cash flow, debt payoff, risk, and household pressure interact.

Choices mean the user can see responsible options without feeling that the product has already decided.

Consequences mean the user can understand likely effects, uncertainty, assumptions, and recovery paths.

The product should help users leave with a better mental model, not merely a completed task. The strongest UX outcome is a user who better understands their financial situation and can reason more clearly over time.

When assumptions, calculations, inputs, or user understanding are incorrect, the product should correct gently. Correction should increase understanding rather than reduce confidence. The interaction should help users build a more accurate mental model without blame, embarrassment, or unnecessary friction.

State transparency is part of mental model development. Users should understand whether they are viewing current reality, simulated state, forecast, saved information, unsaved changes, partial data, stale data, or external provider data. Hypothetical, incomplete, delayed, or outdated information must never be confused with current financial reality.

## 6. Trust Calibration Doctrine

UX should continuously calibrate trust.

Trust should never exceed evidence, and reliable evidence should not be weakened by unnecessary hesitation.

Where evidence is deterministic, interaction may be more direct. Where uncertainty increases, interaction should become more cautious, explanatory, and review-oriented.

Confidence should remain proportional to deterministic evidence. Calculated values, source-backed facts, stale data, estimates, forecasts, AI interpretations, and scenario outputs should not feel equally certain.

Trust calibration governs both overconfidence and underconfidence. The product should avoid making uncertain outputs feel certain, and it should also avoid over-qualifying reliable deterministic calculations until users doubt outputs that are well supported.

Trust calibration should help users understand:

- What is known
- What is calculated
- What is estimated
- What is assumed
- What may change
- What remains the user's decision

The product should reject confidence theater. Polished interaction must not make uncertain outputs feel more certain than they are.

Reliable calculations should remain confidently understandable. Caution should increase with uncertainty, not become the default tone for all information.

## 7. Decision Latency Doctrine

Different financial decisions deserve different interaction speeds.

Higher-impact decisions should naturally introduce more reflection, review, explanation, and confirmation. Low-impact exploration should remain lightweight.

Decision latency should be proportional to consequence. The product should not force slow interaction where the user is safely exploring, and it should not make serious decisions feel casual.

Interaction speed should be determined by three independent dimensions:

- Financial consequence
- Reversibility
- Data sensitivity

Higher values in any dimension should naturally increase explanation, review, confirmation, and reflection.

High-impact moments may include changes that affect debt payment strategy, survival budget protection, sensitive data movement, saved financial assumptions, or hard-to-recover commitments.

Low-impact moments may include reviewing information, exploring hypothetical scenarios, comparing assumptions, or learning what a calculation means.

This doctrine does not define exact interaction mechanics. It defines the constitutional principle that interaction speed should match financial consequence, uncertainty, reversibility, data sensitivity, and recoverability.

## 8. Decision Flow Doctrine

Financial decision flows should follow a responsible order:

1. Reality
2. Constraints
3. Evidence
4. Risk
5. Options
6. Tradeoffs
7. Recommendation, if appropriate
8. User decision
9. Recovery or review path

Mandatory expenses should be understood before optimization. Minimum required payments should be understood before extra payoff. Survival budget should be protected before acceleration. User decision should come before automation.

Deferral is a valid user decision. When evidence is insufficient, uncertainty is high, consequences are significant, or additional information would materially improve judgment, the experience should support deciding later without shame or pressure.

Decision flows should make the difference between calculated facts, risk interpretation, recommendations, assumptions, and user choices clear.

The product should not treat all decisions as equally urgent. It should use decision latency proportionally: more reflection for higher-impact choices, lighter movement for safe exploration.

Decision flows should make state visible. Users should understand whether they are acting on current, simulated, forecasted, saved, unsaved, partial, stale, or external-provider information before committing to a decision.

Decision flows reject:

- Recommendation-first flows
- Hidden constraints
- Optimization before survival
- AI-led decision paths
- Irreversible action without review
- High-impact decisions with low-friction presentation
- Pressure against responsible deferral
- Decisions made from unclear state

## 9. Navigation Philosophy

Navigation should reflect user mental models and financial decision journeys.

The product should guide users:

- From current reality to future exploration
- From obligations to options
- From deterministic summary to explanation
- From monthly understanding to long-term continuity
- From financial confusion to responsible next consideration

Navigation should not require users to understand the product's internal data model before they understand their financial state.

Risk, due dates, minimum payments, survival budget pressure, and core constraints should not be buried behind feature inventory.

Navigation should preserve state transparency across areas. Moving between summaries, reports, simulations, forecasts, AI explanations, and external provider data should not make users lose track of whether they are viewing current reality, hypothetical exploration, stale information, partial information, or saved state.

Navigation rejects:

- Feature-first navigation
- Data-model navigation
- AI-first navigation
- Burying risk, due dates, or minimum payments
- Making users assemble meaning from scattered areas
- Navigation that serves product structure over user understanding
- Movement that obscures current, simulated, stale, partial, saved, or unsaved state

## 10. Attention Management Doctrine

Attention is a limited resource, especially under financial stress.

UX should prioritize what matters now and reduce unnecessary competition for attention.

Urgency should only appear when consequence is real. High-risk signals should be distinguishable from informational content. Optional exploration should not compete with required obligations.

The product should avoid competing calls to action, notification pressure, artificial urgency, and engagement-driven loops.

Attention management rejects:

- Artificial urgency
- Notification pressure
- Visual or copy noise
- Treating every metric as equally important
- Engagement-driven UX
- Attention capture
- Calm interfaces that hide important risk

## 11. Progressive Disclosure Doctrine

Progressive disclosure should support comprehension.

The product should start with what the user needs for the next responsible decision, then reveal evidence, assumptions, details, and alternatives as needed.

Deeper context should remain available. Important risk, constraints, and assumptions should never be hidden in the name of simplicity.

Progressive disclosure should reinforce the user's mental model: reality, cash flow, constraints, tradeoffs, choices, and consequences.

Progressive disclosure should also preserve state transparency. Simplifying a view must not obscure whether information is current, simulated, forecasted, saved, unsaved, stale, partial, or dependent on an external provider.

Progressive disclosure rejects:

- Concealment disguised as simplicity
- Dashboard overload
- Detail dumping
- Hidden assumptions
- Depth without orientation
- Hiding meaningful risk
- Hiding state to simplify the experience

## 12. Friction and Confirmation Doctrine

Friction should protect the user.

High-impact changes should create space for review. Data movement should require understandable consent. Risky actions should be confirmed in a way the user can understand. Destructive or hard-to-recover actions should introduce stronger reflection.

Higher financial consequence, lower reversibility, or greater data sensitivity should each increase the need for explanation, review, confirmation, or reflection.

Low-impact exploration should remain fluid. The product should not make safe learning feel burdensome.

Confirmations should help users understand consequences, not merely click through a barrier.

Friction and confirmation reject:

- Friction for engagement
- Friction that hides choices
- One-click high-impact decisions
- Confirmations that users cannot understand
- Consent fatigue
- Blocking safe exploration
- Treating consequence, reversibility, and data sensitivity as the same thing

## 13. Recoverability Doctrine

Users should be able to recover from mistakes, changed assumptions, failed providers, invalid inputs, stale data, partial data, delayed updates, unavailable services, and misunderstood outputs.

Recovery should explain what happened, preserve dignity, and offer a next step. It should avoid blame and avoid exposing sensitive data or implementation internals.

The deterministic product should remain usable when AI or other external dependencies fail. Optional provider failure, partial synchronization, delayed updates, or stale information should not make the product feel broken.

Scenario exploration should be reversible. Users should be able to return to current reality after exploring hypothetical states.

Correction is a form of recovery. When assumptions, calculations, inputs, or user understanding are incorrect, the product should help users move toward a more accurate understanding without blame, embarrassment, or unnecessary friction.

Recoverability rejects:

- Punitive states
- Dead-end errors
- Blame
- Data loss without warning
- Failed AI making the product feel broken
- Exploration that cannot return to reality
- External dependency failure that makes the whole product feel unreliable
- Correction that reduces user confidence through blame

## 14. Safe Exploration Doctrine

Users should be able to explore possibilities safely.

Scenario exploration should feel separate from commitment. Hypothetical data must be distinguishable from current reality. Users should understand assumptions before trusting scenario outcomes.

Exploration should support judgment, not certainty. It should help users compare tradeoffs, see possible consequences, and understand uncertainty.

Exploration should not silently persist changes or pressure users to act on hypotheticals.

Exploration should support intentional deferral. A user may responsibly decide to gather more evidence, revisit a scenario later, or avoid committing while uncertainty remains high.

State transparency is essential to safe exploration. Simulated, forecasted, unsaved, partial, stale, or externally sourced information must remain distinguishable from current reality.

Safe exploration rejects:

- Confusing simulated and actual data
- Hidden persistence
- False precision
- Scenario outcomes as promises
- Pressure to act on hypotheticals
- Exploration that changes real data silently
- Exploration that hides whether changes are saved or unsaved
- Exploration that treats deferral as failure

## 15. Onboarding and Discoverability Doctrine

Onboarding should orient, not overwhelm.

The product should explain what it does and does not do. It should ask only for what is needed, explain why sensitive data matters, and make privacy expectations clear.

Onboarding should teach through use rather than front-loading everything. Users should not have to understand every future capability before reaching first value.

Discoverability should support growing understanding over time. Deeper capabilities should become discoverable as they become relevant to the user's decisions.

Onboarding and discoverability reject:

- Long instructional gates
- Feature tours detached from user need
- Asking for sensitive data before explaining why
- Hiding core value behind setup complexity
- Over-teaching before context exists
- Discoverability that depends on financial expertise

## 16. Interruption and Notification Doctrine

The product should interrupt only when interruption protects the user or supports a user-requested need.

Meaningful reasons may include real risk, due dates, failed state recovery, stale data, or user-requested reminders.

Interruptions should explain why they matter. They should not manufacture urgency, create shame, or expose sensitive financial detail in inappropriate contexts.

The user's attention and stress level are part of the design context. Interruption should be proportionate to consequence.

Interruption and notification reject:

- Engagement nudges
- Shame-based reminders
- Alarm without evidence
- Repeated pressure
- Sensitive financial exposure in interruption surfaces
- Interruption for product activity rather than user need

## 17. AI Interaction Doctrine

AI should explain, not lead.

AI must follow the communication hierarchy:

1. Reality
2. Evidence
3. Interpretation
4. Recommendation
5. User Decision

AI cannot replace deterministic flows. It cannot become the dominant product voice. It should not become the only path to understanding.

AI interaction should invite review questions, surface assumptions, and remain bounded by deterministic outputs. AI failure should be recoverable.

AI interaction should not require raw sensitive data unless explicitly justified, consented, and constitutionally appropriate.

AI interaction is one external dependency state among others. Users should understand when an AI response is unavailable, delayed, partial, stale, or based on summarized information rather than current full context.

AI interaction rejects:

- AI-first navigation
- AI-led financial decisions
- AI oracle UX
- Chat as the only path to understanding
- AI output without evidence
- AI interaction that weakens privacy
- AI voice replacing product voice
- AI state that obscures whether information is current, partial, stale, or unavailable

## 18. Consent and Privacy Interaction Doctrine

Consent should be understandable and continuous.

Meaningful data movement should be visible. Sensitive data requests should explain purpose. Users should understand local, summarized, AI-supported, and external boundaries when those boundaries matter to decision-making or privacy.

Privacy should be felt in interaction, not buried in text. The user should feel that the product treats financial information carefully.

Consent should not become fatigue. Interaction should make meaningful consent clear without forcing users through unnecessary repeated barriers.

External dependency states should be understandable. Users should clearly understand when interaction depends on external providers, unavailable services, stale information, partial synchronization, or delayed updates.

Consent and privacy interaction reject:

- One-time blanket consent
- Surprise data movement
- Consent fatigue
- Overcollection
- Privacy hidden behind legal language
- Sensitive data requests without purpose
- External data states hidden from the user
- Partial or delayed synchronization presented as complete

## 19. Long-Term Experience Doctrine

The product should remain understandable across months and years.

Long-term UX should help users understand change over time, revisit decisions, recognize shifted assumptions, and see trend evidence without scorecard shame.

The product should support changing household, income, debt, and expense realities. It should not treat every session as isolated.

Continuity should strengthen the user's financial understanding without creating dependence. The product should help users reason better, not make them feel unable to reason alone.

Long-term UX should preserve state history carefully. Users should understand when a change reflects current reality, a revised assumption, stale data becoming fresh, external provider updates, or a saved decision.

Long-term experience rejects:

- Treating each session as isolated
- Progress theater
- Over-celebrating behavior
- Over-punishing behavior
- Making users dependent on the product
- Trend claims without evidence
- History that obscures present responsibility
- Long-term views that blur current, stale, revised, or externally updated state

## 20. UX Rejection List

The product rejects interaction patterns that weaken agency, dignity, clarity, evidence, restraint, deterministic truth, privacy, consent, uncertainty, explainability, progressive disclosure, inclusion, recoverability, continuity, responsibility without blame, trust calibration, or safe exploration.

The following patterns are constitutionally disallowed unless a future explicit amendment changes this doctrine:

- Recommendation-first UX
- AI-first UX
- Dashboard overload
- Hidden assumptions
- Hidden persistence
- Irreversible actions without review
- Shame loops
- Engagement nudges
- Artificial urgency
- Dead-end errors
- Consent dark patterns
- Exploration that changes real data silently
- Forecasts treated as certainty
- Feature-first navigation
- Trust exceeding evidence
- Underconfidence in reliable deterministic evidence
- High-impact decisions that feel casual
- Low-impact exploration that feels punitive
- Mental models that obscure cash flow or constraints
- Pressure against intentional decision deferral
- Hypothetical, stale, partial, or external provider data presented as current reality
- External dependency failure that breaks user understanding

This list is not exhaustive. Any future interaction pattern that produces the same constitutional harms should be rejected even if it is not named here.

## 21. UX Review Questions

Future UX work should be reviewed against these questions before it is accepted:

- Does the user understand reality before action?
- Does this preserve user agency?
- Is the evidence visible or available?
- Is trust proportional to deterministic evidence?
- Does the interaction become more cautious when uncertainty increases?
- Does the interaction avoid unnecessary hesitation when evidence is deterministic?
- Does the decision speed match financial consequence, reversibility, data sensitivity, and recoverability?
- Does the experience support intentional deferral when evidence is insufficient, uncertainty is high, consequences are significant, or more information would improve judgment?
- Is the user clear whether they are viewing current reality, simulated state, forecast, saved state, unsaved changes, partial data, stale data, or external provider data?
- Is risk clear without panic?
- Is exploration safe?
- Can the user recover?
- Does correction increase understanding without blame or embarrassment?
- Is friction protective rather than obstructive?
- Is AI explaining rather than leading?
- Is consent understandable and continuous?
- Does this protect attention?
- Does this support continuity without dependence?
- Does this help users build an accurate mental model of reality, cash flow, constraints, tradeoffs, choices, and consequences?
- Does the experience remain understandable when external providers, unavailable services, stale information, partial synchronization, or delayed updates are involved?
- Does this remain usable under stress, lower financial literacy, language uncertainty, and cognitive overload?
- Does this avoid shame, blame, artificial urgency, and false certainty?

If UX work cannot answer these questions well, it should be revised before implementation.

## 22. Relationship to Future Documents

This document governs downstream experience work but does not replace it.

Information Architecture should use this doctrine to organize product meaning around financial reality, cash flow, constraints, tradeoffs, choices, consequences, and long-term continuity.

Interaction Philosophy should use this doctrine to define how users move, pause, review, confirm, recover, explore, and decide.

Decision Experience should use this doctrine to ensure financial decisions follow reality, constraints, evidence, risk, options, tradeoffs, recommendation where appropriate, user decision, deferral where responsible, and recovery or review path.

AI Experience should use this doctrine to keep AI explanatory, bounded, evidence-grounded, privacy-conscious, and subordinate to deterministic truth and product voice.

Future external dependency experiences should use this doctrine to make unavailable services, stale information, partial synchronization, delayed updates, and provider-sourced data understandable without making the product feel broken.

Future implementation work may create screens, components, flows, layouts, animations, or exact interaction mechanics. Those downstream artifacts must remain subordinate to this doctrine.

## 23. UX Amendment Policy

`UX_PRINCIPLES.md` derives from `PRODUCT_MANIFESTO.md`, `PRODUCT_PRINCIPLES.md`, `PRODUCT_STRATEGY.md`, `ROADMAP.md`, `DESIGN_SYSTEM.md`, and `COPY_GUIDELINES.md`.

It must never contradict those higher-level constitutional documents.

UX evolution is expected. The product will learn from user research, financial behavior, accessibility needs, support issues, AI capability changes, roadmap phases, and real-world Turkish financial context. However, UX evolution must happen through explicit versioned review.

No future UX evolution may weaken:

- Agency
- Dignity
- Clarity
- Evidence
- Restraint
- Deterministic truth
- Privacy
- Consent
- Uncertainty
- Explainability
- Progressive disclosure
- Inclusion
- Recoverability
- Continuity
- Responsibility without blame
- Product voice independence from AI
- Mental model development
- Trust calibration
- Decision latency proportional to consequence
- Safe exploration
- Decision deferral
- State transparency
- Gentle correction
- External dependency understandability

Future amendments should also test known drift risks: recommendations before reality, AI explanation becoming AI authority, AI becoming the dominant product voice, calm UX hiding important risk, privacy becoming fine print, Turkish-first experience becoming translation-only, reports becoming scorecards, numerical precision creating false certainty, urgency being manufactured, responsibility becoming blame, interaction speed becoming disconnected from consequence, deferral being treated as failure, stale or simulated information being confused with current reality, correction becoming embarrassing, reliable deterministic evidence being over-qualified, and external dependency states becoming opaque.

Amendments should state:

- What changed
- Why the change is needed
- Which higher constitutional documents support it
- Which downstream product areas are affected
- Whether the change introduces new UX risks

Future changes require an explicit versioned constitutional review.

No future UX evolution may contradict:

- `PRODUCT_MANIFESTO.md`
- `PRODUCT_PRINCIPLES.md`
- `PRODUCT_STRATEGY.md`
- `ROADMAP.md`
- `DESIGN_SYSTEM.md`
- `COPY_GUIDELINES.md`
