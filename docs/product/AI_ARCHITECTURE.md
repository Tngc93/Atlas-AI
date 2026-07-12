# AI_ARCHITECTURE.md

Version: 1.0  
Status: Draft

## 1. Purpose of This Document

This document defines the conceptual AI architecture of the product.

Its purpose is to answer:

> What role may AI play in the product, and what boundaries must protect deterministic financial truth, user agency, privacy, and dignity?

This document does not define model providers, prompts, APIs, schemas, databases, frameworks, infrastructure, deployment, or implementation details.

AI architecture in this product is a product-governance layer before it is a technical design.

## Provider Independence and Execution Boundaries

The product is provider-independent. Provider selection must not alter deterministic financial truth, `CoachContext` minimization, structured response validation, or user control.

Three execution boundaries are supported:

- Mock demo: no credential and no paid AI call.
- Browser BYOK: explicit opt-in, direct provider call, transient session-only credential, and no application-server persistence.
- Self-host: server-side credentials supplied by the operator through environment variables.

Browser support is a provider capability, not a universal assumption. Providers with unsafe or unsupported browser credential behavior remain self-host-only. AI failure always falls back to deterministic content or the Mock explanation layer.

Browser availability is explicit: Mock is `Demo`; Ollama and LM Studio are `Local`; Gemini and OpenRouter are `Experimental Browser`; OpenAI, Anthropic, and custom remote endpoints are `Self-host`. A connection test must not receive financial context. Minimized `CoachContext` may leave the browser only after a separate user action that clearly names the selected provider.

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
- `SYSTEM_ARCHITECTURE.md`

It must preserve the accepted commitments to agency, dignity, clarity, evidence, restraint, deterministic truth, privacy, consent, uncertainty, explainability, recoverability, continuity, and responsibility without blame.

## 3. AI North Star

AI exists to help the user understand deterministic financial outputs, reflect on tradeoffs, and ask better review questions.

AI does not exist to replace calculations, decide for the user, create urgency, simulate expertise, or become the product's financial authority.

The AI experience should feel educational, careful, restrained, transparent, and subordinate to the user's financial reality.

## 4. AI Role in the Product

AI may support:

- Plain-language explanations of calculated outputs
- Educational summaries of risk reasons
- Tradeoff framing
- Scenario interpretation
- Forecast assumption explanation
- Review questions
- Monthly reflection
- User-safe fallback guidance

AI must not:

- Calculate budgets, interest, risk levels, payoff priority, or projections as the source of truth
- Override deterministic outputs
- Invent missing financial facts
- Present itself as a licensed advisor
- Create action pressure
- Hide uncertainty
- Trigger irreversible actions
- Use raw sensitive detail when summarized context is sufficient

## 5. AI Position in the System

AI is downstream from deterministic finance logic.

The conceptual order is:

```text
Financial Inputs
  -> Deterministic Finance Outputs
  -> Protection Constraints
  -> Risk and Priority Reasons
  -> Summarized Context
  -> AI Explanation
  -> User Review and Decision
```

AI receives context only after financial truth has been calculated by deterministic product logic. AI output is interpretation, not truth.

If AI output conflicts with deterministic outputs, deterministic outputs prevail and the conflict should be treated as a product failure requiring safe fallback or review.

## 6. AI Capability Boundaries

### 6.1 Explanation

AI may explain what a calculated output means in Turkish, using calm and respectful language.

Explanation must distinguish between:

- Calculated facts
- Risk reasons
- Assumptions
- Interpretations
- Possible next considerations

### 6.2 Coaching

AI may provide educational coaching that helps the user understand tradeoffs and reflect on next steps.

Coaching must remain:

- Educational
- Non-prescriptive
- Evidence-based
- Dignity-preserving
- Explicitly subordinate to user decision-making

Coaching must not sound like an order, guarantee, or licensed financial-advisor recommendation.

### 6.3 Scenario Interpretation

AI may explain scenario outputs after deterministic scenario logic has produced results.

It must clearly label hypothetical assumptions and must not present scenario outcomes as promises.

### 6.4 Forecast Interpretation

AI may explain forecast assumptions, uncertainty, and directional implications.

It must not present forecasts as guarantees or create false precision.

### 6.5 Reflection

AI may help summarize monthly patterns and ask review questions.

Reflection should support continuity and learning over time without shame, gamification pressure, or dependence.

## 7. AI Input Principles

AI input should follow data minimization.

The AI layer should receive the minimum necessary summarized context, such as:

- Risk level and reasons
- Calculated budget outputs
- Debt pressure summaries
- Due date pressure summaries
- Scenario assumptions and deltas
- Forecast assumptions and limitations

The AI layer should avoid raw sensitive detail when summarized values are sufficient.

AI input should not include unnecessary free-text notes, secrets, credentials, local database content, or unrelated personal information.

## 8. AI Output Principles

AI output must be:

- Turkish-first
- Educational-only
- Calm and non-shaming
- Grounded in provided context
- Clear about uncertainty
- Clear about assumptions
- Free from fabricated facts
- Free from pressure tactics
- Safe when the user's financial state is difficult

AI output should follow the communication hierarchy:

1. Reality
2. Evidence
3. Interpretation
4. Recommendation or next consideration
5. User decision

AI should not begin with persuasion, motivation, or advice before grounding the explanation in financial reality and evidence.

## 9. Human Control and Consent

AI must preserve user agency.

The product should make clear when content is AI-assisted and what it is based on. The user should be able to review AI explanations without being forced into action.

AI must never simulate consent. It must never imply that a financial decision has already been made for the user.

For high-impact future capabilities, the user must have explicit review moments before any saved plan, commitment, or external action.

## 10. Uncertainty and Limits

AI must make uncertainty visible when outputs depend on:

- Future income stability
- Expense behavior
- Interest rate changes
- Payment timing
- Scenario assumptions
- Forecast horizons
- Missing or stale data

AI should communicate uncertainty without becoming vague. It should explain what is known, what is assumed, and what may change.

## 11. Safety and Fallback Behavior

AI failure should not block the user's access to deterministic financial truth.

When AI is unavailable, fails validation, or cannot safely answer, the product should provide safe Turkish fallback copy that:

- Preserves calculated outputs
- Avoids inventing facts
- Explains that coaching is unavailable
- Provides simple review guidance
- Keeps the user in control

AI fallback should be treated as a normal state, not a broken or alarming experience.

## 12. AI Risk Model

The primary AI product risks are:

- Overriding deterministic finance truth
- Hallucinating financial facts
- Sounding like a licensed advisor
- Creating urgency or pressure
- Minimizing serious risk
- Shaming users under financial stress
- Hiding uncertainty
- Exposing unnecessary sensitive data
- Blurring current and hypothetical states
- Producing explanations that conflict with product copy principles

Every AI capability must be evaluated against these risks before it becomes part of the product experience.

## 13. AI Evaluation Principles

AI quality should be evaluated by product safety and user comprehension, not only fluency.

Evaluation should check whether output:

- Correctly reflects deterministic inputs
- Keeps risk levels unchanged
- Uses Turkish clearly and respectfully
- Separates facts from interpretation
- Communicates uncertainty
- Avoids shame and pressure
- Avoids regulated-advice posture
- Gives the user useful review questions
- Provides safe fallback when context is insufficient

The best AI response is not the most confident response. It is the response that helps the user understand reality and decide responsibly.

## 14. Relationship to Future Product Capabilities

AI may support future roadmap capabilities only within the same boundary model.

For scenarios, AI explains deterministic scenario outputs.

For forecasts, AI explains assumptions and uncertainty.

For reports, AI may summarize deterministic report data.

For decision support, AI may frame tradeoffs and questions.

For continuity, AI may help users reflect on change over time.

In all cases, AI remains interpretive, downstream, and user-controlled.

## 15. Out of Scope

This document does not define:

- Model provider selection
- Prompt text
- Prompt templates
- API design
- Data schemas
- Validation implementation
- Caching implementation
- Logging implementation
- Rate limits
- Cost controls
- Deployment architecture
- Monitoring tools
- Evaluation datasets

Those details belong to later implementation planning and must inherit from this conceptual AI architecture.

## 16. Open Questions

- What exact disclosure language should identify AI-assisted explanations?
- Which future AI outputs should require human review before being shown?
- How should AI coaching be evaluated with Turkish users under real financial stress?
- What summarized context is sufficient for useful coaching without exposing unnecessary sensitive detail?
