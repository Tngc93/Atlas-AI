# PRODUCT PRINCIPLES

Version: 1.0

Status: Accepted

This document translates the Product Manifesto into operational product principles.

It exists to guide product managers, designers, AI engineers, software engineers, and future contributors before they make consequential product decisions.

---

## 1. Purpose

PRODUCT_MANIFESTO.md defines why this product exists.

PRODUCT_PRINCIPLES.md defines how that purpose should be applied when making product decisions.

These principles are not slogans. They are decision rules.

They should be consulted before introducing new capabilities, changing user-facing behavior, designing AI interactions, presenting risk, shaping roadmap priorities, or resolving product trade-offs.

If a product decision cannot satisfy these principles, it should be reconsidered.

---

## 2. Relationship To The Product Manifesto

The Product Manifesto is the constitutional foundation of the product.

It defines the beliefs, boundaries, and long-term purpose that must remain stable even as technologies, interfaces, business models, and implementation strategies change.

This document is the operating doctrine derived from that constitution.

It does not replace the Manifesto.

It does not reinterpret the Manifesto for convenience.

It translates the Manifesto into principles that can be used in daily product judgement.

The relationship is:

```text
PRODUCT_MANIFESTO.md
        -> why we exist
        -> what we believe
        -> what must never be violated

PRODUCT_PRINCIPLES.md
        -> how we judge decisions
        -> how we resolve trade-offs
        -> how we protect product integrity in practice
```

If this document ever conflicts with PRODUCT_MANIFESTO.md, the Manifesto prevails.

---

## 3. How To Use These Principles

These principles should be used as a product decision filter.

Before a meaningful product decision is accepted, the team should ask:

- Does this strengthen user judgement, or create dependence?
- Does this increase clarity, or merely increase information?
- Does this preserve user agency?
- Does this keep trust proportional to evidence?
- Does this respect the sensitivity of financial data?
- Does this make trade-offs visible?
- Does this communicate in language the user can truly understand?
- Does this help the user make the next better decision?

The principles are especially important when:

- adding AI behavior
- designing recommendations
- changing risk language
- introducing automation
- expanding data collection
- shaping roadmap priorities
- designing financial narratives
- presenting forecasts or simulations
- creating emotionally sensitive user experiences

---

## 4. Principle Hierarchy

The principles are organized into three levels.

### Foundational Principles

These are constitutional. They should almost never change.

They protect the product from becoming something it was not meant to be.

### Decision Principles

These guide trade-offs between competing product choices.

They help teams decide what to build, what to defer, what to simplify, and what to reject.

### Experience Principles

These define how the product should feel to the user.

They shape communication, emotional tone, narrative, AI behavior, and interaction quality.

---

## 5. Foundational Principles

### 1. Deterministic Truth Comes First

The product must treat deterministic financial calculations as the source of truth.

AI may explain, summarize, prioritize, and coach.

AI must not become the authority for financial math.

Financial calculations, risk signals, budget constraints, payment coverage, interest pressure, and scenario outputs must remain grounded in deterministic logic.

**Rationale**

Money is not a domain where persuasive uncertainty can be allowed to replace reliable calculation.

If users cannot trust the numbers, they cannot trust the guidance built upon them.

This principle protects the product from becoming an impressive but unsafe AI interface.

---

### 2. Privacy Is Architecture

The product must protect sensitive financial data by default through local-first thinking, data minimization, restraint, and clear boundaries.

Privacy must shape what is collected, stored, inferred, displayed, shared, remembered, and sent to AI systems.

Access to financial context must never be treated as entitlement.

**Rationale**

Financial data reveals more than money.

It reveals priorities, obligations, fears, habits, relationships, and vulnerability.

Privacy is therefore not a feature that can be added later.

It is a product and architectural commitment that preserves human dignity in the presence of sensitive knowledge.

---

### 3. The User Keeps Final Agency

The product may recommend, simulate, warn, explain, prioritize, and coach.

It must not take irreversible financial action on behalf of the user.

The user must remain able to understand meaningful decisions and retain responsibility for them.

**Rationale**

The product exists to strengthen judgement, not replace it.

Convenience, automation, and intelligence are valuable only when they expand human agency.

If a feature makes the user less capable of understanding or owning future decisions, it weakens the core purpose of the product.

---

### 4. Survival Comes Before Optimization

The product must protect mandatory living needs before recommending debt acceleration, savings targets, optimization strategies, or ambitious future plans.

Basic financial resilience must come before performance.

Minimum obligations, essential expenses, near-term liquidity, and survival budget constraints must be respected before the product encourages additional action.

**Rationale**

Many financial products assume slack that users do not have.

This product must begin from financial reality rather than ideal financial behavior.

Optimization that endangers survival is not intelligence.

It is misalignment.

---

### 5. Trust Must Be Earned

The product must earn trust through evidence, consistency, humility, and restraint.

Claims should never exceed what can be justified.

Confidence should never exceed understanding.

When uncertainty exists, it must remain visible.

**Rationale**

Trust cannot be demanded by interface polish, AI fluency, or confident language.

It is granted gradually when the product consistently explains what it knows, what it does not know, and why it recommends what it recommends.

Trust grows through intellectual honesty, not the appearance of certainty.

---

## 6. Decision Principles

### 6. Explain Before You Automate

The product should make reasoning visible before increasing automation.

Users should understand why a recommendation, warning, simulation, or next step exists before the product attempts to make the process easier or faster.

Automation must follow understanding.

It must not replace it.

**Rationale**

Financial automation without understanding can create dependence.

The product should help users become more capable over time, not merely more compliant with system output.

Explanation is the bridge between assistance and agency.

---

### 7. Prioritize The Next Best Decision

The product should guide users toward the most important near-term financial decision instead of overwhelming them with every possible insight, metric, notification, or recommendation.

The goal is not to present everything.

The goal is to help the user understand what matters now.

Every additional demand on user attention must justify its existence.

If an insight does not improve understanding, timing, resilience, or decision quality, it should not compete for attention.

**Rationale**

The personal finance category already contains too many dashboards that produce information without judgement.

This product should operate as a decision system.

Its value comes from sequencing attention toward the decision that most improves clarity, stability, or future optionality.

Attention is finite.

Consuming it without improving judgement is a product cost, not a neutral act.

---

### 8. Make Tradeoffs Explicit

The product must show what a recommendation protects, costs, delays, improves, or risks.

Whenever a path is suggested, the meaningful alternatives and consequences should remain visible.

**Rationale**

Personal finance is trade-off management.

Every decision allocates limited money, attention, time, and risk capacity.

Guidance that hides trade-offs may feel simpler, but it weakens judgement.

Guidance that reveals trade-offs strengthens agency.

---

### 9. Recommendations Must Be Grounded In Evidence

Every recommendation should be traceable to deterministic outputs, trend signals, user-stated constraints, or clearly labeled assumptions.

The product should distinguish between what is known, what is inferred, and what remains uncertain.

**Rationale**

Recommendations without grounding become motivational content.

This product must provide decision intelligence, not generic encouragement.

Evidence keeps recommendations accountable to reality and protects the user from persuasive but unsupported guidance.

---

## 7. Experience Principles

### 10. Design For Real Financial Lives

The product must assume that missed payments, inconsistent behavior, changing income, avoidance, anxiety, incomplete data, competing responsibilities, and limited attention are normal conditions of financial life.

The experience should support people under real financial pressure, not idealized users with perfect information, perfect discipline, or stable circumstances.

**Rationale**

Most people do not make financial decisions under clean, calm, complete conditions.

They make them with stress, uncertainty, limited time, and competing responsibilities.

A product that only works in ideal conditions fails precisely when clarity matters most.

---

### 11. Speak The User's Financial Language

The product should communicate in language that feels native to the user's financial, cultural, and emotional context.

Language should be precise without being cold.

It should be simple without being simplistic.

It should respect how users actually understand salary, debt, payments, risk, obligations, and daily financial pressure.

It must not imitate the user to manufacture intimacy.

It must not use cultural fluency, emotional language, or personalization to persuade without improving understanding.

**Rationale**

Communication is not the transfer of information.

It is the transfer of understanding.

Users should not have to translate the product's language into their own financial reality.

The product should meet them where financial meaning already lives.

The purpose of native communication is comprehension, not influence.

---

### 12. Show The Story Behind The Numbers

The product should help users understand what changed, why it matters, and what it means for the decisions ahead.

Narrative should organize reality into a more understandable form without inventing drama, certainty, or unsupported meaning.

**Rationale**

Raw numbers rarely create understanding on their own.

People understand through relationships, sequence, context, and consequence.

The product should reveal the story that is already present in the financial reality, while remaining accountable to evidence.

---

### 13. The Product Should Feel Calmly Competent

The product should feel steady, precise, respectful, and capable.

It should reduce panic without hiding difficulty.

It should communicate seriousness without becoming cold, punitive, or overwhelming.

It should help the user feel oriented, respected, and able to take the next responsible step.

**Rationale**

Users may arrive with financial stress, guilt, avoidance, or uncertainty.

The product should not add emotional noise.

It should feel like a competent partner beside the user: calm enough to make hard facts bearable, and precise enough to make next steps usable.

Trust Must Be Earned governs system credibility.

This principle governs the felt experience of using the product under pressure.

---

## 8. Principle Conflict Resolution

When principles appear to conflict, resolve the conflict according to this hierarchy:

1. The Product Manifesto prevails over this document.
2. Foundational Principles prevail over Decision Principles.
3. Decision Principles prevail over Experience Principles.
4. User agency prevails over convenience.
5. Deterministic truth prevails over AI fluency.
6. Privacy prevails over personalization.
7. Evidence prevails over persuasion.
8. Clarity prevails over completeness.
9. Survival prevails over optimization.
10. Restraint prevails over engagement.

If a proposal still cannot be resolved, the safer choice is the one that leaves the user with greater clarity, greater agency, and less unnecessary exposure.

---

## 9. Product Decision Checklist

Before accepting a meaningful product decision, ask:

- What user decision does this improve?
- Does it strengthen judgement or create dependence?
- What evidence supports it?
- What uncertainty remains?
- What trade-offs does it reveal?
- What trade-offs might it hide?
- Does it preserve user agency?
- Does it protect sensitive financial context?
- Does it communicate in the user's financial language?
- Does it reduce complexity without removing necessary truth?
- Does it help the user act more deliberately?
- Would this still feel trustworthy if the user were under financial stress?

If the answer to any of these questions is unclear, the decision needs more product judgement before implementation.

---

## 10. Anti-Principles

The product must refuse paths that make it more impressive while making the user less capable.

It must not become:

- a system that values dependence over capability
- a system that values persuasion over understanding
- a system that values certainty over honesty
- a system that values engagement over intention
- a system that values complexity over clarity
- a system that values personalization over dignity
- a system that values automation over agency
- a system that values AI fluency over deterministic truth
- a system that values optimization over survival
- a system that values growth over trust

These are not branding preferences.

They are product boundaries.

---

## 11. Derivation Map For Future Documents

Future product documents must derive from these principles.

### PRODUCT_STRATEGY.md

PRODUCT_STRATEGY.md should define where the product competes, who it serves first, what category it creates, and which strategic bets matter.

It must derive from:

- Trust Must Be Earned
- Privacy Is Architecture
- Prioritize The Next Best Decision
- Design For Real Financial Lives
- Speak The User's Financial Language

Strategy should never pursue growth paths that require confusion, dependence, hidden trade-offs, or excessive data exposure.

### ROADMAP.md

ROADMAP.md should describe product evolution as capability maturity, not feature accumulation.

It must derive from:

- Deterministic Truth Comes First
- Survival Comes Before Optimization
- Prioritize The Next Best Decision
- Make Tradeoffs Explicit
- Recommendations Must Be Grounded In Evidence

Roadmap items should be judged by whether they improve decision quality, resilience, clarity, and user agency.

### DESIGN_SYSTEM.md

DESIGN_SYSTEM.md should encode the emotional and interaction standards of the product.

It must derive from:

- The Product Should Feel Calmly Competent
- Speak The User's Financial Language
- Design For Real Financial Lives
- Make Tradeoffs Explicit
- Trust Must Be Earned

The design system should protect calm density, clear hierarchy, proportionate risk presentation, accessible financial language, and non-shaming interaction patterns.

### AI_GUIDELINES.md

AI_GUIDELINES.md should govern how AI behaves, communicates, refuses, explains, and handles uncertainty.

It must derive from:

- Deterministic Truth Comes First
- The User Keeps Final Agency
- Explain Before You Automate
- Recommendations Must Be Grounded In Evidence
- Trust Must Be Earned

AI should never become the source of financial truth.

It should help users understand evidence, consequences, trade-offs, uncertainty, and next decisions.

---

## 12. Amendment Policy

PRODUCT_MANIFESTO.md changes rarely.

PRODUCT_PRINCIPLES.md may evolve as the product matures, but every amendment must remain consistent with the Manifesto.

A principle may be added, removed, renamed, or clarified only if doing so strengthens the product's ability to preserve user agency, clarity, trust, dignity, and sound financial judgement.

Every amendment should answer:

- What product risk or ambiguity does this change resolve?
- Which part of the Manifesto supports it?
- Does it preserve the existing principle hierarchy?
- Could it be used to justify behavior the product has refused to become?

If a principle conflicts with PRODUCT_MANIFESTO.md, the Manifesto prevails.

If a future opportunity requires weakening these principles, the opportunity should be rejected.

---

End of Product Principles

Version: 1.0

Status: Accepted
