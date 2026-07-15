# Atlas AI Product Philosophy

Atlas AI is an open-source AI Financial Intelligence Platform designed to strengthen financial understanding without replacing human judgment. The accepted [Product Manifesto](product/PRODUCT_MANIFESTO.md) is the repository's constitutional authority; this document summarizes how that philosophy appears in engineering decisions.

## Deterministic Finance First

Financial calculations must be reproducible, testable, and explainable. Cash flow, mandatory-expense coverage, minimum payments, living budget, risk, debt priority, forecasts, and scenario deltas therefore come from deterministic code.

This order matters because fluent language is not evidence. The product establishes calculated reality before presenting interpretation.

## AI Is Never the Source of Truth

AI is a downstream explanation layer. It may summarize calculated outputs, clarify trade-offs, and ask useful review questions. It must not invent inputs, calculate financial results, override risk classifications, or make the user's decision.

When AI is unavailable, deterministic features continue to work. Mock fallback is a resilience feature, not a replacement calculation engine.

## Why Bring Your Own AI

Different users and self-hosters have different privacy, cost, latency, and model requirements. A provider registry avoids making the product dependent on one vendor. Self-host users can configure supported providers with their own server-side credentials, while Mock mode remains available without a key.

BYOK does not remove security responsibility. Credentials must not be committed, logged, persisted in product data, or exposed through public client configuration.

## Why Bring Your Own Database

Financial data is sensitive and infrastructure preferences vary. The self-host architecture uses PostgreSQL through a repository boundary, allowing operators to control their own database environment. The public demo deliberately avoids shared database mutation.

Authentication and user ownership are required before the database mode can become a public multi-user service.

## Why a Zero-Cost Demo

People should be able to evaluate the product without provisioning a database or consuming a paid AI API. Demo mode uses fictional seed data, active-tab memory, deterministic engines, and Mock AI.

This makes the product inspectable at zero required API cost while preventing one visitor's changes from becoming another visitor's state. It is a product demonstration, not a real-data beta.

## Privacy First

Atlas AI minimizes data movement and makes system boundaries visible:

- Raw banking activity is not required by the current product.
- AI receives minimized deterministic context.
- Public demo finance state is not persisted.
- Secrets remain outside source control and product data.
- User agency remains explicit at every recommendation or scenario boundary.

Privacy is treated as architecture and restraint, not merely as a disclosure.
