# Production Readiness

Atlas AI has two explicit execution modes. They have different safety and infrastructure contracts and never silently fall back to one another.

## Current Release Scope

| Mode | Intended use | Database | AI default | Current boundary |
| --- | --- | --- | --- | --- |
| Public demo | Fictional product evaluation | None | Mock | Anonymous, non-persistent, no real financial data |
| Self-host | Controlled single-user development or operation | PostgreSQL | Mock or operator-configured | No Auth or user ownership; not a public multi-user service |

The public demo is release-ready only after the checks in [Release Checklist](../releases/RELEASE_CHECKLIST.md) pass. Self-host mode remains operator-managed and is not a claim of production multi-user readiness.

## Public Demo Contract

Required environment values:

```text
PUBLIC_DEMO_MODE=true
AI_PROVIDER=mock
```

Optional final canonical origin:

```text
NEXT_PUBLIC_SITE_URL=https://your-final-origin.example
```

Do not supply `DATABASE_URL`, `DIRECT_URL`, cloud AI keys, persistent storage, analytics, tracking, or session replay to the public demo.

Public demo behavior:

- The marketing website remains at `/`; the fictional workspace begins at `/demo`.
- Demo finance state is copied from an immutable seed into per-tab React memory.
- Refresh, tab closure, a new browser context, or confirmed reset restores the seed.
- Demo components do not import Prisma repositories or Server Actions.
- API access and Prisma initialization fail closed while demo mode is active.
- Finance state is not written to URL, cookies, local/session storage, IndexedDB, Cache Storage, service-worker storage, server memory, logs, analytics, or a database.
- AI explanation is Mock-only and makes no paid external provider request.

Validate with:

```bash
npm run build:demo
npm run test:e2e:demo
```

See [Public Demo](../PUBLIC_DEMO.md) and [Vercel Deployment](vercel-deployment.md).

## Self-host PostgreSQL Contract

Required baseline configuration:

```text
PUBLIC_DEMO_MODE=false
DATABASE_URL=postgresql://pooled-runtime-connection
DIRECT_URL=postgresql://direct-migration-connection
AI_PROVIDER=mock
```

- `DATABASE_URL` is the pooled runtime connection.
- `DIRECT_URL` is the direct Prisma CLI/migration connection.
- PostgreSQL TLS, least-privilege access, backups, restore testing, migration approval, and monitoring are operator responsibilities.
- Missing or invalid `DATABASE_URL` fails explicitly. The application does not fall back to SQLite or demo mode.
- Archived SQLite migrations under `prisma/migrations-sqlite` are historical artifacts and must never be applied to PostgreSQL.
- Active PostgreSQL migrations under `prisma/migrations` require review and an environment-specific deploy runbook.

Authentication and owner-scoped authorization are not implemented. PostgreSQL alone does not make Atlas AI safe for public multi-user financial data. The future ownership model is documented in [User Ownership Architecture](../architecture/user-ownership.md).

## Guarded Test-preview Environment

PostgreSQL integration and standard E2E tests may use only the isolated `test-preview` endpoint and temporary schemas.

| Variable | Purpose |
| --- | --- |
| `TEST_DATABASE_URL` | Test-preview pooled connection |
| `TEST_DIRECT_URL` | Matching direct connection |
| `TEST_NEON_ENDPOINT_ID` | Endpoint identity guard |
| `TEST_DATABASE_RESET_CONFIRM=test-preview` | Explicit destructive-cleanup confirmation |
| `TEST_BASELINE_DEPLOY_CONFIRM` | Explicit fixed preview baseline approval when needed |

The harness enforces endpoint identity, TLS, schema prefixes, and cleanup boundaries. Integration schemas use `pfc_it_*`; E2E schemas use `pfc_e2e_*`. Production credentials must not be present in CI.

To review and apply the baseline only to the approved fixed test-preview schema:

```bash
npm run prisma:baseline:check
TEST_BASELINE_DEPLOY_CONFIRM=test-preview:preview_app npm run prisma:baseline:deploy:test
```

This command does not fall back to normal `DATABASE_URL` or `DIRECT_URL`. Production migration remains a separate, manual, explicitly approved operation.

## AI Provider Operations

- Public demo always uses Mock and contains no owner-owned paid key.
- Self-host cloud provider keys remain server-side environment variables.
- Browser BYOK is disabled by default. OpenAI, Anthropic, and remote custom providers are self-host only.
- Gemini/OpenRouter browser support is experimental and production-disabled.
- Ollama/LM Studio browser access is local-only, uses fixed loopback ports, and depends on explicit local CORS configuration.
- Provider connection tests do not send `CoachContext`; sending minimized context requires a separate user action.
- Provider failure cannot change or remove deterministic finance output.

See `.env.example`, [Self-hosting](../SELF_HOSTING.md), and [Security](../../SECURITY.md).

## Canonical URL and Public Metadata

The public origin is resolved in this order:

1. Valid `NEXT_PUBLIC_SITE_URL`
2. `VERCEL_PROJECT_PRODUCTION_URL`
3. `VERCEL_URL`
4. `http://localhost:3000`

Only HTTP(S) origins are accepted. The resolved origin is shared by canonical links, sitemap, robots, Open Graph, Twitter metadata, and structured public routes. Set `NEXT_PUBLIC_SITE_URL` only after a stable final URL is known, then rebuild and verify generated metadata.

## Release Validation

Required local gates:

```bash
npm run security:secrets
npm run security:audit
npx prisma validate
npx prisma generate
npm run lint
npm run test:unit
npm run test:integration
npm run build
npm run build:demo
npm run test:e2e
npm run test:e2e:demo
git diff --check
```

Standard integration and E2E commands require the guarded test-preview environment. Demo build and E2E require no database or paid AI credential.

Manual release review must also confirm:

- No tracked `.env`, API key, database URL, database file, backup, log, Playwright report, test result, or real financial fixture.
- CI is green on the final commit.
- Public routes, metadata, sitemap, robots, custom 404, mobile navigation, and footer links work.
- Demo reset, refresh reset, browser-context isolation, no-storage, no-database, and no-external-AI controls work.
- The stable Vercel URL is added to README and optional canonical configuration only after deployment verification.

## Known Operational Limitations

- `npm audit --omit=dev` currently reports four moderate transitive advisories in two dependency paths: Next.js bundles a PostCSS version affected by `GHSA-qx2v-qp2m-jg93`, and `gaxios` depends on a UUID version affected by `GHSA-w5hq-g745-h8pq`. The configured high-severity gate passes. The suggested forced fix would introduce a breaking Next.js downgrade, so no forced dependency change is accepted for this beta; upgrades will be reassessed when compatible upstream releases are available.
- No authentication, user ownership, tenant isolation, or public multi-user authorization.
- No banking connection, payment execution, transaction synchronization, analytics, or operational monitoring.
- Public demo state is intentionally lost on refresh.
- Free hosting remains subject to provider terms, quotas, and acceptable-use policy.
- Local Browser BYOK behavior depends on browser mixed-content policy, CORS, local runtime, and extension/XSS risk.
- Self-host operators must design backup, recovery, incident response, data retention, and provider compliance for their environment.

## Deployment Decision

- **Database-free fictional public demo:** ready with conditions after all release gates and hosted preview validation pass.
- **Controlled self-host single-user use:** supported with operator-managed PostgreSQL and security responsibilities.
- **Public real-data multi-user beta:** not ready; Auth, user ownership, authorization, backup/restore, and operational controls are blockers.
