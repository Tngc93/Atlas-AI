# SYSTEM_ARCHITECTURE.md

Version: 1.0  
Status: Draft

## 1. Purpose of This Document

This document defines the conceptual system architecture of the product.

In this context, "system architecture" means the organization of product layers, capability relationships, information movement, decision ownership, and trust boundaries before any software implementation exists.

This document does not define technologies, frameworks, APIs, databases, services, infrastructure, deployment architecture, or microservices.

Its purpose is to answer:

> How should the product system be conceptually arranged so that financial truth, user agency, privacy, and AI interpretation remain in the right relationship?

## 2. Constitutional Lineage

This document derives from the accepted constitutional layer:

- `PRODUCT_MANIFESTO.md`
- `PRODUCT_PRINCIPLES.md`
- `PRODUCT_STRATEGY.md`
- `ROADMAP.md`
- `DESIGN_SYSTEM.md`
- `COPY_GUIDELINES.md`
- `UX_PRINCIPLES.md`
- `PRODUCT_ARCHITECTURE.md`

It must preserve the accepted commitments to agency, dignity, clarity, evidence, restraint, deterministic truth, privacy, consent, uncertainty, explainability, recoverability, continuity, and responsibility without blame.

## 3. System Architecture North Star

The product system should make financial reality legible, protect the user from unsafe interpretation, and preserve human decision authority.

The system is organized so that:

- Inputs become deterministic financial outputs.
- Deterministic outputs become explainable evidence.
- Evidence becomes risk and option framing.
- AI may explain and synthesize only after deterministic truth exists.
- The user remains the final decision-maker.

## 4. Conceptual Layer Model

The product system is organized into seven conceptual layers:

1. Input Layer
2. Deterministic Finance Layer
3. Protection and Constraint Layer
4. Risk and Priority Layer
5. Decision Support Layer
6. AI Interpretation Layer
7. User Decision Layer

The layers are directional. Later layers may depend on earlier layers. Earlier layers must not depend on later layers.

## 5. Layer Responsibilities

### 5.1 Input Layer

The Input Layer represents financial facts, user-provided values, sample values, and scenario assumptions.

It may include:

- Income
- Mandatory expenses
- Debt balances
- Credit card obligations
- Minimum payments
- Due dates
- Interest rates
- Survival threshold
- Scenario assumptions

Its responsibility is to collect or represent financial inputs clearly and safely.

Input quality matters because every downstream layer depends on it. Missing, invalid, stale, hypothetical, or uncertain inputs must remain visible to later layers.

### 5.2 Deterministic Finance Layer

The Deterministic Finance Layer converts inputs into calculated financial outputs.

It may produce:

- Monthly cash-flow position
- Mandatory expense coverage
- Minimum payment coverage
- Survival budget
- Daily spending limit
- Weekly spending limit
- Interest pressure
- Payment-after balances
- Payoff projections

This layer is the source of financial truth. It must remain deterministic, testable, and independent from AI interpretation.

### 5.3 Protection and Constraint Layer

The Protection and Constraint Layer decides what must be protected before the product presents optional action.

It evaluates:

- Whether mandatory expenses are covered
- Whether minimum payments are covered
- Whether survival budget is protected
- Whether cash flow is negative
- Whether extra debt payment is responsible
- Whether the user should focus on stabilization before optimization

This layer prevents the product from suggesting acceleration when basic financial stability is not secured.

### 5.4 Risk and Priority Layer

The Risk and Priority Layer translates deterministic outputs and constraints into user-understandable urgency and ordering.

It may produce:

- `Düşük`, `Orta`, or `Yüksek` risk
- Risk reasons
- Due date pressure
- Interest pressure
- Payoff priority
- Critical reasons under `Yüksek Risk`

This layer must be explainable. A risk label without reasons is not sufficient.

### 5.5 Decision Support Layer

The Decision Support Layer organizes available options, tradeoffs, and safe next steps.

It may support:

- Reviewing obligations
- Considering extra repayment
- Comparing scenario outcomes
- Understanding forecast assumptions
- Choosing a next action
- Deferring a decision

This layer must preserve the distinction between a calculated fact, a product interpretation, a possible option, and a user decision.

### 5.6 AI Interpretation Layer

The AI Interpretation Layer provides educational explanation, synthesis, review questions, and plain-language coaching.

It may:

- Explain calculated outputs
- Summarize tradeoffs
- Ask reflective questions
- Clarify assumptions
- Help users understand risk reasons
- Provide educational next-step framing

It must not:

- Replace deterministic calculations
- Invent financial facts
- Override risk classification
- Act as a licensed financial advisor
- Make decisions for the user
- Create irreversible actions

### 5.7 User Decision Layer

The User Decision Layer is where the user reviews, chooses, defers, or changes course.

The product must make this layer explicit. It should be clear when the system is showing information, when it is explaining, when it is offering options, and when the user is making a decision.

The system must preserve the user's ability to decide differently from a recommendation after understanding the tradeoffs.

## 6. Directional Information Flow

The conceptual flow is:

```text
Inputs
  -> Deterministic Calculations
  -> Protection and Constraints
  -> Risk and Priority
  -> Decision Support
  -> AI Interpretation
  -> User Decision
```

This flow protects product integrity.

The following reverse flows are not allowed:

- AI interpretation must not change deterministic calculations.
- Recommendations must not hide protection constraints.
- Risk labels must not exist without evidence.
- Scenario assumptions must not silently become current reality.
- User-facing urgency must not be created without financial evidence.

## 7. State Categories

The product system must distinguish between different kinds of state.

### 7.1 Current State

Current state represents the user's present financial reality. It is the primary basis for calculations, risk, and decision support.

### 7.2 Hypothetical State

Hypothetical state represents scenario, simulation, or forecast assumptions. It must remain clearly separate from current state.

### 7.3 Interpreted State

Interpreted state represents explanations, summaries, coaching, and risk narratives derived from calculated outputs.

### 7.4 Historical State

Historical state represents prior snapshots, monthly reviews, reports, or trend references.

The system must not blur these categories. Confusing current, hypothetical, interpreted, and historical state would weaken user trust and agency.

## 8. Decision Ownership

Decision ownership is distributed as follows:

| Area | Owner |
|---|---|
| Financial facts and assumptions | User, with product support |
| Calculations | Deterministic finance layer |
| Protection constraints | Protection and constraint layer |
| Risk labels and reasons | Risk and priority layer |
| Explanation and education | AI interpretation layer or product copy |
| Final action, deferral, or change | User |

No product layer may simulate user consent. No AI layer may claim final authority over a financial decision.

## 9. Trust Boundaries

The system has several conceptual trust boundaries.

### 9.1 Sensitive Data Boundary

Personal financial inputs are sensitive. The product should minimize exposure, avoid unnecessary sharing, and preserve local-first expectations.

### 9.2 Deterministic Truth Boundary

Calculated outputs must be protected from narrative override. Interpretation may explain calculations, but not replace them.

### 9.3 AI Boundary

AI belongs outside the deterministic source-of-truth boundary. It receives only the minimum necessary summarized context and returns educational explanation subject to validation and fallback.

### 9.4 Scenario Boundary

Hypothetical assumptions must remain separate from current financial reality until the user explicitly chooses otherwise in a future product layer.

### 9.5 Decision Boundary

The product may support decisions but must not create financial commitments, automated payments, or irreversible actions without explicit user control and future design approval.

## 10. Failure and Recovery Principles

The system must treat failures as recovery moments.

Examples:

- Missing input should produce clear next-step guidance.
- Invalid values should be explained without blame.
- Stale rates should be marked as stale or fallback-based.
- AI failure should produce safe Turkish fallback copy.
- Forecast uncertainty should remain visible.
- Scenario confusion should be corrected by clearly labeling hypothetical state.

Failure states should preserve dignity, avoid panic, and help the user continue.

## 11. Conceptual Expansion Rules

Future capabilities must attach to the correct layer.

- New financial calculations belong in the Deterministic Finance Layer.
- New risk reasons belong in the Risk and Priority Layer.
- New AI explanations belong in the AI Interpretation Layer.
- New simulations belong behind the Scenario Boundary.
- New reports belong to continuity and historical state.
- New decision flows must preserve user ownership.

If a future capability spans multiple layers, its source of truth, assumptions, interpretation, and user decision moment must be separated explicitly.

## 12. Out of Scope

This document does not define:

- Application architecture
- Code structure
- Components
- Routes
- APIs
- Data schemas
- Database persistence
- Authentication
- Authorization
- Infrastructure
- Deployment
- Vendor choices
- Model choices
- Prompt implementation
- Logging implementation

Those details belong to later software architecture and implementation documents.

## 13. Open Questions

- What product moments should create durable historical snapshots?
- Which assumption changes should require explicit confirmation?
- How should stale or unavailable rate data affect risk communication?
- What level of AI fallback is sufficient when coaching cannot be generated?

