# AGENTS.md

## Project Context

This project is an AI-powered personal finance coach dashboard for Turkish users.

The product helps users understand monthly salary allocation, mandatory expenses, debts, credit cards, minimum payments, interest pressure, survival budget, payoff roadmap, and financial risk signals.

The app is privacy-first and local-first. Treat all personal financial data as sensitive.

## Operating Rules

- Inspect the existing codebase before making changes.
- Keep edits scoped, reviewable, and consistent with existing patterns.
- Do not start a new phase unless the user explicitly approves it.
- Preserve existing behavior unless the requested change requires a behavior update.
- Do not add dependencies unless the need is clear and justified.
- Keep user-facing product behavior deterministic where financial calculations are involved.
- Use mock/sample data only unless the user explicitly asks to connect real user data.

## Turkish-First UX

- All user-facing application content must be Turkish.
- This includes page titles, navigation labels, dashboard cards, tables, forms, buttons, empty states, errors, chart labels, coach copy, helper text, warnings, sample/mock labels, and README user instructions where relevant.
- Keep code, variable names, function names, route names, technical comments, and internal types in English.
- Prefer centralized Turkish copy in `src/lib/copy/tr.ts` or the established copy layer.
- Risk levels shown to users must be only `Düşük`, `Orta`, and `Yüksek`.
- Critical financial situations should appear as critical reasons under `Yüksek Risk`, not as a separate visible risk level.

## Next.js, TypeScript, and Tailwind

- Use the Next.js App Router conventions already present in the project.
- Keep Server Components as the default where interactivity is not required.
- Use Client Components only for actual client-side state, browser APIs, or interactions.
- Keep TypeScript strict and explicit around finance domain types.
- Avoid `any`; model finance inputs and outputs with clear types.
- Use Tailwind utility classes consistently with the existing visual system.
- Keep layouts responsive and avoid mobile horizontal scroll.
- Keep UI components focused on presentation; do not bury finance rules inside JSX.
- Use semantic HTML where possible.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may differ from older assumptions. Read relevant local documentation in `node_modules/next/dist/docs/` or project code before writing code that depends on framework behavior. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Server Actions and Route Handlers

- Prefer Server Actions or route handlers for mutations, database access, OpenAI calls, and server-only integrations.
- Never call Prisma, OpenAI, or secret-bearing services directly from client components.
- Validate server inputs before using them.
- Return user-safe Turkish error messages from UI-facing paths.
- Do not log secrets or raw financial details.
- Keep API responses minimal and avoid exposing internal implementation details.

## Prisma and SQLite

- SQLite is the local-first MVP database.
- Prisma models should reflect the finance domain clearly and avoid premature complexity.
- Use Decimal or integer kuruş values for money. Do not use floating point for stored money.
- Keep migrations minimal and intentional.
- Do not run or create migrations casually if the current phase does not require persistence changes.
- Do not commit local SQLite database files, generated backups, or real user data.

## Repository Pattern

- Keep database access behind repository/helper functions under `src/lib/db` or the established data layer.
- UI pages and components should not contain raw Prisma queries.
- Route handlers and Server Actions should call repositories or service functions instead of duplicating data logic.
- Keep mock/sample data separate from repositories and clearly labeled as sample data.

## Separation of UI and Business Logic

- Finance calculations belong in `src/features/finance`.
- Rate provider logic belongs in `src/features/rates`.
- AI coach prompt, schema, and service logic belong in `src/features/coach`.
- Dashboard components should render calculated outputs, not calculate finance rules inline.
- Keep reusable formatting helpers in shared utility modules.
- Keep user-facing copy centralized where practical.

## Financial Calculation Engine Principles

- Deterministic calculations are the source of truth.
- AI may explain results, but must not replace deterministic math.
- Always protect mandatory living expenses first.
- Minimum debt payments must be secured before extra payoff suggestions.
- If the survival budget threshold cannot be protected, do not recommend extra debt payments.
- Default payoff strategy is avalanche: highest monthly interest debt first.
- Due date risk threshold defaults to 7 days unless the user changes it.
- Daily and weekly spending limits should be calculated from the days remaining in the current month.
- Handle negative cash flow explicitly.
- Calculate payment-after balances and payoff projections clearly.
- Guard against invalid numbers, negative amounts, missing rates, impossible dates, and divide-by-zero cases.
- Keep functions unit-testable and independent from React.

## Privacy-First Financial Data Rules

- Treat salary, debts, expenses, credit limits, due dates, and notes as sensitive financial data.
- Use mock/sample data only in tests, stories, screenshots, and seed-like examples.
- Never include real personal financial data in code, tests, fixtures, mocks, screenshots, logs, documentation examples, or commits.
- Prefer summarized values when sending data to AI services.
- Avoid sending raw free-text notes to AI unless the user explicitly asks and the privacy impact is clear.
- Redact sensitive values from logs and errors.
- Keep local database and backups out of git.

## OpenAI API Usage Rules

- OpenAI integration must be server-side only.
- Use environment variables for API keys.
- The expected local variable is `OPENAI_API_KEY`.
- `.env.example` may contain `OPENAI_API_KEY=` as an empty placeholder only.
- Never place API keys in frontend/client-side code.
- Never expose API keys through serialized props, API responses, logs, browser network payloads, or build output.
- Use AI for educational explanations, tradeoff summaries, review questions, and coaching language.
- Do not use AI as the source of truth for budgets, interest, risk levels, or payoff projections.
- Coach responses must be Turkish and must include educational-only framing.
- Validate structured AI responses before displaying or saving them.
- Provide safe fallback copy when the API key is missing or the OpenAI call fails.

## Gemini API Usage Rules

- Gemini integration must be server-side only.
- Use `GEMINI_API_KEY` from server-side environment variables only.
- `.env.example` may contain `GEMINI_API_KEY=` as an empty placeholder only.
- Never place Gemini API keys in frontend/client-side code, logs, docs, tests, screenshots, or commits.
- `AI_PROVIDER=gemini` may call the real Gemini provider; `AI_PROVIDER=mock` must keep all AI behavior local and deterministic.
- The default Gemini model is `gemini-2.5-flash`; use `GEMINI_MODEL` only for server-side model selection.
- Gemini prompts must be Turkish and must not ask the model to perform financial calculations.
- Gemini may only receive the minimized deterministic finance summary, never raw database rows, names, IBANs, account numbers, card numbers, transaction descriptions, notes, or bank movement data.
- Gemini responses must be structured JSON and validated before use.
- If the API key is missing, the request times out, JSON validation fails, or Gemini returns an error, the app must gracefully fall back to Mock Provider without showing a crash screen.
- Cache repeated minimized finance summaries to avoid unnecessary provider calls.
- Track provider usage metrics without logging secrets or raw financial data.

## Testing Requirements

- Before every completion that changes code, run the most relevant checks.
- For this project, the default completion gate is:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

- Unit tests are required for finance calculation changes.
- Add or update tests for risk classification, survival budget, minimum payment coverage, due date risk, avalanche allocation, daily/weekly limits, payoff projection, and AI response schema when touched.
- If a check cannot be run, report why and state the remaining risk.
- Do not claim release readiness if lint, tests, or build are failing.

## GitHub / Release Workflow

After every completed phase or meaningful feature, the release workflow checklist is mandatory:

- `npm run lint` passed.
- `npm run test` passed.
- `npm run build` passed.
- `npm run test:e2e` passed.
- `npm run security:secrets` passed.
- `npm run security:audit` passed.
- GitHub Actions CI passed for the related PR or push when available.
- Obsidian `Personal Finance OS` was updated.
- README was updated if user setup, workflow, or behavior changed.
- `CHANGELOG.md` or release notes were updated.
- A Git commit was created.
- Changes were pushed to the GitHub `develop` branch.
- If the phase is a release, `develop` was merged into `main`.
- Semantic version and tag were updated when needed.

GitHub branch rules:

- `main` is the stable release branch.
- `develop` is the active integration branch.
- Feature work should branch from `develop` using names such as `feature/phase-9-forecast-engine`.
- Release tags should be created from `main` only after validation passes.
- GitHub Actions CI must stay green before merging PRs into `develop` or `main`.
- CI should enforce Prisma generate, secret scan, dependency audit, lint, tests, build, and Playwright E2E checks.

Git safety rules:

- Never stage or commit secrets, real financial data, local SQLite databases, generated backups, `.env.local`, `.next`, `node_modules`, `test-results`, `playwright-report`, `coverage`, or log files.
- Before the first commit or any broad staging operation, run a dry-run staging check and inspect ignored files.
- Prefer explicit `git add` paths when the worktree contains unrelated files.
- Do not push directly to GitHub until validation and secret/local-data checks are complete.
- Prefer PR-based merges after CI passes; branch protection should require CI checks on `main` and `develop`.

## Security and Privacy Checklist

Before completing security-sensitive work, verify:

- No real financial data is present.
- No `.env.local` or real secret value is committed.
- No API key appears in client-side code.
- No Prisma or database access is used in Client Components.
- Server inputs are validated.
- Error messages are user-safe and Turkish where user-facing.
- Logs do not contain raw financial data or secrets.
- AI requests contain only the minimum necessary summarized data.
- Local SQLite files and backups are ignored by git.
- Rate data failures show stale/fallback warnings when relevant.

## Future Architecture Notes

### AI Coach

- The AI coach should consume a summarized `MonthlyFinancePlan`, not raw database rows.
- AI coach input should flow through `CoachContext` from `src/features/coach/context-builder.ts` before reaching providers or prompt builders.
- `CoachContext` may include reduced Financial Memory signals, but must not include raw Prisma rows, user notes, IBANs, account numbers, card numbers, transaction descriptions, or bank movements.
- Trend context should come from deterministic Financial Memory analysis and should use minimized direction, band, count, and label signals instead of exact raw snapshot values.
- It should explain risk, tradeoffs, next actions, and review questions in Turkish.
- It should cache insights by input hash to avoid repeated calls.
- It should keep the user in control and avoid licensed financial-advisor language.

### Scenario Simulator

- Scenario simulation should be deterministic first.
- Planned scenarios may include salary changes, extra payment changes, interest changes, due date shifts, and expense reductions.
- Scenario inputs should be isolated from persisted real data until the user explicitly saves them.
- Results should show deltas against the current plan.

### Forecast Engine

- Forecasting should extend the existing calculation engine rather than duplicate it.
- Keep assumptions visible: horizon, interest rates, minimum payments, expense stability, salary stability, and payoff strategy.
- Support stale or missing rate data gracefully.
- Avoid pretending forecasts are guarantees.

### Financial Reports

- Reports should be generated from deterministic plan outputs and stored snapshots.
- Reports should be Turkish-first and exportable later.
- Candidate reports include monthly cash-flow summary, debt payoff roadmap, interest cost estimate, risk history, and action-plan history.
- Do not include real data in report examples or tests.

## Yaşayan Proje Hafızası

- Bu projede her önemli geliştirme tamamlandıktan sonra Obsidian içindeki `~/Documents/Obsidian/Personal Finance OS` bilgi tabanı güncellenmelidir.
- Mevcut `AI-Product-OS` klasörü bu proje için kullanılmamalı, okunmamalı, değiştirilmemeli ve referans alınmamalıdır.
- Bilgi tabanındaki tüm klasör, Markdown dosyası ve açıklama içerikleri Türkçe olmalıdır.
- Güncellemeler gerçek finansal veri, API anahtarı, `.env.local` değeri, SQLite veritabanı içeriği veya kişisel veri içermemelidir.
- Önemli değişikliklerde en az [[Değişiklik Geçmişi]] güncellenmeli; mimari, veri modeli, AI, finans motoru, roadmap veya release etkisi varsa ilgili sayfalar da güncellenmelidir.

## Completion Reporting

When finishing a task, report:

- What changed.
- Which files changed.
- Which validations ran.
- Any assumptions or risks.
- Any follow-up items that should be considered before the next phase.
