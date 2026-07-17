# Changelog

Atlas AI is a Turkish-first, open-source AI Financial Intelligence Platform. This file records user-visible releases and material technical changes.

## v1.0.0-beta - Release Candidate

Release date: pending final deployment validation.

### Product

- Added a Turkish-first financial workspace for reviewing current position, monthly plans, forecasts, decisions, memory, reminders, and optional AI explanations.
- Added an English public website for product, architecture, documentation, security, roadmap, contributing, and open-source resources.
- Kept financial outputs educational and decision-support oriented; Atlas AI is not a regulated financial adviser.

### Deterministic Finance Engine

- Calculates monthly cash flow, protected living budget, minimum-payment coverage, risk bands, debt priority, and payoff projections without AI.
- Preserves deterministic finance output as the source of truth for every downstream product surface.
- Uses integer kuruş for stored money values and explicit interest-rate context.

### Forecast

- Provides 3, 6, 12, and 24-month projections with visible assumptions, risk timelines, payoff milestones, and scenario comparison.
- Keeps forecast scenarios temporary and separates projected outcomes from current financial reality.

### Decision Simulator

- Compares reversible salary, expense, payment, and debt scenarios against the current deterministic plan.
- Shows trade-offs, risk effects, and short/long-term impact without selecting a decision for the user.

### Financial Memory

- Stores structured monthly snapshots in self-host mode and derives deterministic trend context.
- Keeps AI memory minimized and separate from raw finance records.

### Reminders

- Generates calm in-app reminders for due dates, cash-flow pressure, missing setup, and review moments.
- Persists only reminder state in self-host mode; reminder content remains deterministic and regenerated.
- Does not include push, email, SMS, or external notification delivery.

### AI Coach

- Explains minimized deterministic context through validated structured responses.
- Falls back to Mock AI when a configured provider is unavailable or invalid.
- Does not calculate budgets, risk, payoff order, or financial truth.

### Provider Architecture

- Includes provider-independent adapters for Mock, Gemini, OpenAI, Anthropic, OpenRouter, Ollama, LM Studio, and custom OpenAI-compatible APIs.
- Keeps OpenAI, Anthropic, and remote custom endpoints self-host only.
- Marks browser Gemini/OpenRouter support as experimental and disabled in production; Ollama/LM Studio browser connectivity remains local-only and conditional.

### Public Demo

- Adds a database-free `/demo` workspace with immutable fictional seed data and per-tab in-memory CRUD.
- Resets all demo state on refresh, tab closure, browser-context change, or confirmed reset.
- Uses Mock AI only and makes no platform-owned paid AI request.
- Does not persist finance state to PostgreSQL, URL, cookies, browser storage, analytics, or server memory.

### Public Website

- Adds product, architecture, documentation, resource, sitemap, robots, offline, and custom 404 routes.
- Adds responsive navigation, canonical metadata, Open Graph/Twitter metadata, structured data, and reduced-motion support.

### Self-hosting

- Supports PostgreSQL through Prisma with pooled runtime and direct migration connection contracts.
- Preserves guarded isolated-schema integration and E2E validation for the test-preview environment.
- Supports operator-owned database and server-side AI provider credentials.

### Security and Privacy

- Adds secret scanning, fail-closed demo database/API boundaries, credential redaction, restrictive provider capability gates, and a responsible disclosure policy.
- Keeps API keys server-side in self-host mode; experimental browser credentials are session-memory only and disabled by default.
- Excludes `.env` files, database files, test artifacts, logs, and provider credentials from version control.

### Testing and Quality

- Covers deterministic services with unit tests, repositories with isolated PostgreSQL integration tests, and product/public/demo flows with Playwright.
- Adds database-free demo build and E2E validation to CI.
- Includes responsive, reduced-motion, metadata, broken internal navigation, storage-negative, and no-external-AI assertions.

### Known Limitations

- Authentication, user ownership, and multi-user authorization are not included.
- Banking import, account aggregation, payment execution, and transaction synchronization are not included.
- The public demo is fictional, non-persistent, and intentionally unsuitable for real financial information.
- Browser cloud BYOK is experimental and disabled in production; local provider access depends on browser, CORS, and local runtime configuration.
- Self-host operators are responsible for database security, backups, migration review, provider terms, and infrastructure operations.
- Forecasts, scenarios, reminders, and AI explanations are educational decision support, not guarantees or regulated financial advice.

## v0.1.0 - Personal Finance OS Foundation

Release date: 2026-07-05

### Scope

- Initial deterministic finance engine, local CRUD, interest context, Mock-first AI coach, decision simulation, and forecast foundation.
- Initial Turkish dashboard, responsive form flows, unit tests, and Playwright coverage.

### Privacy Note

Real financial data, local database files, `.env.local`, API keys, and generated test artifacts must never be committed.
