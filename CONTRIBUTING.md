# Contributing to Atlas AI

Thank you for helping improve Atlas AI. Contributions should preserve deterministic financial truth, privacy, explainability, and user agency.

## Requirements

- Node.js 20+
- npm
- Git
- PostgreSQL test-preview credentials only when running integration or standard E2E tests

Read the [Product Manifesto](docs/product/PRODUCT_MANIFESTO.md), [Architecture](docs/ARCHITECTURE.md), [AI Guidelines](docs/product/AI_GUIDELINES.md), and [Security Policy](SECURITY.md) before changing product or AI behavior.

## Install and Run

```bash
git clone https://github.com/Tngc93/personal-finance-coach-dashboard.git
cd personal-finance-coach-dashboard
npm ci
cp .env.example .env.local
npm run prisma:generate
npm run dev
```

For a database-free contribution environment:

```bash
PUBLIC_DEMO_MODE=true AI_PROVIDER=mock npm run dev
```

Use fictional data only. Never commit `.env.local`, database files, API keys, or real financial records.

## Tests

Run the checks relevant to your change:

```bash
npm run security:secrets
npm run lint
npm run test:unit
npm run build
npm run build:demo
npm run test:e2e:demo
```

Repository/data changes also require guarded PostgreSQL integration tests and standard E2E:

```bash
npm run test:integration
npm run test:e2e
```

Do not point automated tests at production databases.

## Code Style

- Follow existing TypeScript, React, and feature-module patterns.
- Keep the finance engine deterministic and independent from AI.
- Keep Prisma access behind server-side repository boundaries.
- Prefer small, reviewable changes over broad refactors.
- Preserve Turkish-first user-facing copy and calm, non-authoritative language.
- Add tests proportional to behavior and risk.
- Do not add dependencies without clear need and review.

## Commit Convention

Use concise Conventional Commit-style messages:

- `feat: add ...`
- `fix: correct ...`
- `refactor: simplify ...`
- `test: cover ...`
- `docs: document ...`
- `chore: maintain ...`

Keep unrelated changes in separate commits.

## Pull Request Process

1. Start from the current target branch and create a focused feature branch.
2. Confirm the issue or user problem and define acceptance criteria.
3. Keep secrets and real financial data out of the diff.
4. Run relevant validation and report any unavailable checks honestly.
5. Complete the pull request template, including risk and rollback notes.
6. Address review feedback without unrelated cleanup.
7. Do not merge while required CI checks are failing.

## Issue Reporting

- Use Bug Report for reproducible incorrect behavior.
- Use Feature Request for user problems and scoped product proposals.
- Use Documentation for inaccurate or missing documentation.
- Use private security reporting for vulnerabilities.

Search existing issues first. Provide fictional reproduction data and redact identifiers. Feature requests should explain user value, constraints, and how user agency remains protected.

## Documentation

Update documentation when changing setup, environment variables, architecture, provider support, security boundaries, or user workflows. Mark capabilities as implemented, experimental, or planned; do not present roadmap items as shipped.

## Community Standards

Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). By contributing, you agree to follow it.
