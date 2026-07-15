# Atlas AI Delivery Roadmap

This document communicates delivery status. It complements the constitutional capability roadmap in [docs/product/ROADMAP.md](product/ROADMAP.md) and does not replace it.

## Status Key

- **Implemented:** Available in the repository and covered by existing validation.
- **Experimental:** Implemented behind constraints or still undergoing release validation.
- **Planned:** Directional work; not available and not a delivery commitment.

## Implemented

- Deterministic monthly finance engine
- Debt priority, payment allocation, living budget, and payoff projections
- Forecast Engine and temporary forecast scenarios
- Decision Simulator and deterministic trade-off summaries
- Financial Memory, trend signals, and recommendation context
- In-app Reminder Engine
- Provider registry, structured AI response validation, and Mock fallback
- Server-side adapters for supported cloud and local providers
- PostgreSQL Prisma schema and guarded test-preview infrastructure
- Session-isolated zero-cost public demo mode
- Secret scan, unit, integration, build, and Playwright quality gates

## Experimental

- Cloud Browser BYOK capability flags; production remains fail-closed
- Browser access to local Ollama and LM Studio runtimes
- PostgreSQL baseline and production migration process
- Public demo release packaging and hosted URL

## Planned

### Identity and Data Ownership

- Authentication
- User ownership fields and repository scoping
- Cross-user isolation tests
- Multi-user production readiness

### Data Connectivity

- Consent-driven banking data import
- Import review and reconciliation
- Portable export/import for self-host users

### Product Experience

- PWA capabilities
- Mobile-focused experience
- Accessibility and localization expansion

### Ecosystem

- Provider/plugin SDK
- Extension points for finance data and AI adapters
- Deployment templates for multiple hosting/database providers

## Non-goals Until Safety Foundations Exist

- Automated payments
- AI-generated financial calculations
- AI acting as decision owner
- Public real-data beta without Auth and user ownership
- Hidden collection of financial or credential data

Roadmap items may change as product evidence, security review, and contributor feedback evolve.
