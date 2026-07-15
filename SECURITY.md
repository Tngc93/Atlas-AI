# Security Policy

Atlas AI handles security reports with particular care because the product domain involves financial information and user-provided AI/database credentials.

## Supported Versions

| Version | Supported |
| --- | --- |
| Latest `main` / current beta | Yes |
| Older branches or forks | Best effort only |

Until the first stable release, security fixes target the latest maintained branch. Self-host operators are responsible for updating their deployments.

## Reporting a Vulnerability

Do not open a public issue for a suspected vulnerability.

Use GitHub's **Report a vulnerability** / private security advisory feature for this repository. If that feature is unavailable, open a minimal issue asking maintainers for a private reporting channel without including exploit details, credentials, personal data, or financial data.

Include privately when possible:

- A concise description and affected component
- Reproduction steps using fictional data
- Expected and observed security impact
- Affected commit or version
- Suggested mitigation, if known

Never include a live API key, database URL, access token, `.env` content, real financial record, or production exploit payload.

## Response Expectations

Maintainers will attempt to acknowledge a report promptly, validate impact, coordinate remediation, and provide disclosure guidance. Response times are best effort; the project currently has no commercial SLA.

## Secrets Policy

- Secrets must remain in ignored local environment files or deployment secret stores.
- API keys and database URLs must never enter source, fixtures, screenshots, logs, analytics, issue bodies, or pull requests.
- No secret may use a `NEXT_PUBLIC_` prefix.
- Secret scan must pass before merge.
- Suspected exposed credentials must be revoked and rotated; removing them from a later commit is not sufficient.

## BYOK Policy

- Self-host cloud provider keys are server-side environment variables.
- Browser credentials are disabled by default and, where explicitly enabled for local/experimental use, remain session-only.
- Credentials must not be persisted in database, cookies, URL, `localStorage`, `sessionStorage`, cache keys, logs, or telemetry.
- OpenAI, Anthropic, and remote custom endpoints are self-host-only.
- Public demo deployments must not contain project-owned paid provider credentials.

## Demo Limitations

Public demo mode is designed for fictional data only. It has no authentication or durable user storage. State lives in active-tab memory and resets after refresh, tab closure, a new context, or the confirmed Reset Demo action. Demo navigation remains under `/demo/*`; unsupported routes and DB-backed APIs fail closed.

Demo financial state, form values, reminders, snapshots, scenarios, Mock AI output, and onboarding state must not enter browser persistence, URLs, logs, analytics, Prisma, or PostgreSQL. Public demo deployments must use Mock AI and must not receive database credentials or project-owned provider keys. See [Public Demo](docs/PUBLIC_DEMO.md) for the complete negative-control and deployment profile.

The demo is not a secure environment for real financial information. Warnings and ephemeral state reduce risk but cannot protect users from malicious browser extensions, compromised client code, screenshots, or information manually shared elsewhere.

## Threat Model Summary

Primary trust boundaries include:

- Browser state versus server-side repositories
- Public demo mode versus PostgreSQL self-host mode
- Deterministic finance output versus AI interpretation
- Minimized Coach Context versus raw financial records
- Browser credential memory versus persistent storage and logs
- Test-preview database credentials versus production database credentials

Key risks include secret disclosure, cross-user data access after future Auth work, accidental demo-to-database access, prompt/context over-sharing, XSS exposure of browser credentials, unsafe custom provider URLs, and test credentials reaching production.

More detail: [Security and Privacy](docs/security/security-and-privacy.md), [Architecture](docs/ARCHITECTURE.md), and [Production Readiness](docs/operations/production-readiness.md).

## Responsible Disclosure

Please allow maintainers a reasonable opportunity to investigate and remediate before public disclosure. Avoid accessing, modifying, or retaining data that is not yours. Use fictional test data and the minimum proof needed to demonstrate impact.
