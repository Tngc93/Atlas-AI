# Self-hosting Atlas AI

## Status

Self-host mode is implemented for single-user development and controlled environments. Authentication and user ownership are not implemented; do not expose it as a public multi-user financial service.

## Requirements

- Node.js 20+
- npm
- PostgreSQL
- Optional AI provider account or local model runtime

## Installation

```bash
git clone https://github.com/Tngc93/personal-finance-coach-dashboard.git
cd personal-finance-coach-dashboard
npm ci
cp .env.example .env.local
```

Configure at minimum:

```text
PUBLIC_DEMO_MODE=false
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
AI_PROVIDER=mock
```

- `DATABASE_URL` is the pooled runtime connection.
- `DIRECT_URL` is the direct Prisma migration connection.
- Never commit `.env.local` or paste credentials into issues.

Generate and validate:

```bash
npx prisma validate
npm run prisma:generate
npm run lint
npm run test:unit
npm run build
```

Apply only reviewed PostgreSQL migrations using the operational process appropriate to your environment. Archived SQLite migrations are not PostgreSQL migrations.

## Supported AI Providers

| `AI_PROVIDER` | Credential | Status |
| --- | --- | --- |
| `mock` | None | Recommended default |
| `gemini` | `GEMINI_API_KEY` | Implemented |
| `openai` | `OPENAI_API_KEY` | Implemented adapter |
| `anthropic` | `ANTHROPIC_API_KEY` | Implemented adapter |
| `openrouter` | `OPENROUTER_API_KEY` | Implemented adapter |
| `ollama` | Optional local token | Local/self-host |
| `lm-studio` | Optional local token | Local/self-host |
| `custom-openai-compatible` | `CUSTOM_AI_API_KEY` when required | Self-host |

Provider model and base URL variables are documented in `.env.example`. Keep all cloud API keys server-side. AI remains optional; deterministic features work with Mock mode.

## Demo Mode

To evaluate the product without PostgreSQL:

```bash
PUBLIC_DEMO_MODE=true AI_PROVIDER=mock npm run dev
```

Do not set database or paid provider secrets in a public demo deployment. Demo state is temporary and fictional.

The free public-demo profile requires only `PUBLIC_DEMO_MODE=true` and `AI_PROVIDER=mock`. Leave `DATABASE_URL`, `DIRECT_URL`, and cloud AI keys empty. It needs no PostgreSQL, Neon, KV, Redis, Blob, analytics, tracking, or other persistent service. `/` remains the marketing site and `/demo` is the canonical demo entry.

The deployment can fit a free Vercel project, subject to Vercel's current quotas and acceptable-use limits. Atlas AI does not claim unlimited free hosting. See [Public Demo](PUBLIC_DEMO.md) for reset, route, storage, and security boundaries.

## Production Recommendations

Before accepting real user data:

1. Implement authentication and server-side user ownership checks.
2. Complete PostgreSQL migration and restore drills.
3. Use TLS database connections and least-privilege credentials.
4. Separate preview and production databases.
5. Run secret scan, audit, lint, unit, integration, build, and E2E gates.
6. Review provider data processing and retention terms.
7. Establish backup, incident response, and vulnerability reporting procedures.

See [Production Readiness](operations/production-readiness.md) and [Security](../SECURITY.md).

## Troubleshooting

| Problem | Check |
| --- | --- |
| `DATABASE_URL is required` | Confirm `PUBLIC_DEMO_MODE=false` and set a PostgreSQL runtime URL. |
| Prisma migration cannot connect | Confirm `DIRECT_URL`, SSL requirements, and database access policy. |
| AI falls back to Mock | Verify provider selection, server-side key, model access, timeout, and quota. |
| Local AI cannot connect | Verify local runtime, fixed loopback URL, CORS, and optional token settings. |
