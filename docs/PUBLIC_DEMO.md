# Atlas AI Public Demo

## Purpose

The public demo is a zero-cost, anonymous product preview at `/demo`. It uses only fictional records and a fresh in-memory state for each browser tab. It is not a bank connection, financial account, persistent workspace, or financial-advice service.

## Safety boundaries

- **Synthetic data:** the immutable seed, examples, forecasts, scenarios, reminders, and snapshots are fictional.
- **Session isolated:** changes exist only in the React state owned by the current page context.
- **No persistence:** refresh, tab closure, a new tab, a new browser context, or Reset Demo restores the seed.
- **Mock AI:** explanations are produced locally from minimized deterministic output. No platform-owned AI key or external provider is used.
- **Database free:** public demo components do not import Prisma repositories or Server Actions. Demo-mode API access fails closed.

Demo financial values, form inputs, credentials, and generated explanations must not enter `localStorage`, `sessionStorage`, IndexedDB, cookies, Cache Storage, URLs, browser history state, service-worker storage, logs, analytics, or a database. Theme preference is application UI state and contains no demo financial content.

## Visitor lifecycle

1. Open `/demo` and review the concise safety introduction.
2. Navigate only through `/demo/*` routes.
3. Apply temporary income, debt, expense, reminder, memory, forecast, decision, and Mock AI changes.
4. Use **Reset Demo** to confirm removal of all temporary changes and return to `/demo`.
5. Refresh or open a new tab to receive the original fictional seed automatically.

The safety introduction dismissal is also in-memory only. It is never stored in browser persistence.

## Supported demo routes

| Route | Demo-safe behavior |
| --- | --- |
| `/demo` | Deterministic dashboard summary |
| `/demo/income` | Temporary income and salary-history changes |
| `/demo/debts` | Temporary debt CRUD |
| `/demo/expenses` | Temporary expense CRUD |
| `/demo/plan` | Deterministic monthly plan |
| `/demo/forecast` | Temporary forecast horizon and comparison |
| `/demo/decisions` | Reversible hypothetical scenarios |
| `/demo/memory` | Temporary structured snapshot refresh |
| `/demo/reminders` | Temporary in-app reminder state |
| `/demo/coach` | Deterministic Mock AI explanation |

Unknown `/demo/*` routes fail closed with a safe recovery page. They do not fall through to database-backed product routes.

## Free deployment profile

Minimum runtime configuration:

```text
PUBLIC_DEMO_MODE=true
AI_PROVIDER=mock
```

Leave the following unset or empty:

```text
DATABASE_URL=
DIRECT_URL=
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
```

No Neon, PostgreSQL, Redis, KV, Blob, Edge Config, paid AI provider, analytics, cookie, or monitoring service is required. The build is compatible with a free Vercel deployment, subject to Vercel's current free-tier quotas and acceptable-use limits. This repository does not claim unlimited free hosting.

Validate before deployment:

```bash
npm run build:demo
npm run test:e2e:demo
npm run security:secrets
npm run security:audit
```

## Known limitations

- State intentionally resets instead of being saved.
- No authentication or account ownership exists in demo mode.
- No bank, email, SMS, push, payment, investment, or transaction execution integration exists.
- Forecasts and scenarios are illustrative results based on visible assumptions, not guarantees.
- Mock AI explains deterministic output and is not a substitute for professional financial advice.
