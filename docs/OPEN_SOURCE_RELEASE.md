# Open-source Release Presentation

This document records recommended GitHub presentation settings. It does not change repository settings.

## GitHub Discussions Categories

- Announcements
- General
- Ideas
- Q&A
- Show and Tell
- Self-hosting Help
- AI Providers
- Product and Architecture

Security reports must not use Discussions; follow [SECURITY.md](../SECURITY.md).

## Repository Topics

Recommended topics:

```text
ai
typescript
react
nextjs
postgresql
personal-finance
financial-planning
forecasting
llm
ollama
openrouter
gemini
openai-compatible
fintech
prisma
self-hosted
```

Topics should be applied manually in GitHub repository settings after maintainer review.

## Release Checklist

- README links resolve.
- Live demo and screenshots remain placeholders until verified assets exist.
- `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md` are present.
- Issue and pull request templates are visible in GitHub.
- Secret scan and documentation path checks are clean.
- `v1.0.0-beta` notes distinguish implemented, experimental, and planned work.
- No deployment, release tag, or GitHub setting change is implied by documentation alone.
- Public demo onboarding, persistent mode indicator, safety panel, confirmed reset, canonical `/demo/*` navigation, and safe unsupported-route recovery are verified.
- Demo storage-negative checks cover local/session storage, IndexedDB, cookies, Cache Storage, service workers, URL, and browser history state.
- `PUBLIC_DEMO_MODE=true AI_PROVIDER=mock` builds without database or cloud AI credentials; free hosting remains subject to provider quotas.
- Demo E2E verifies refresh, reset, new-tab/context isolation, Mock AI network isolation, responsive behavior, focus restoration, and API fail-closed behavior.
