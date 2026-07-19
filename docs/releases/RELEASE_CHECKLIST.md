# Atlas AI v1.0.0-beta Release Checklist

Status values: `[x]` verified, `[ ]` still requires a maintainer action.

## Repository

- [x] Release branch has been merged to a clean `main`.
- [x] Required GitHub Actions checks are green on the AI Coach feature PR.
- [x] Package metadata is `1.0.0-beta`.
- [x] `CHANGELOG.md` and GitHub release notes are finalized.
- [x] README, license, security, contributing, conduct, issue, and PR files are present.
- [x] Implemented, experimental, planned, and known-limitation language is explicit.
- [ ] Repository visibility is changed from private to public by the maintainer.
- [ ] Repository About description, website, and topics are configured.
- [ ] GitHub Discussions categories are configured if Discussions is enabled.

## Quality and Security

- [x] `npm run security:secrets` passes.
- [x] `npm run security:audit` passes at the configured high-severity gate; four moderate transitive advisories are documented.
- [x] `npm run lint` passes.
- [x] Unit tests pass: 155 tests.
- [x] PostgreSQL integration tests pass: 11 tests in isolated test-preview schemas.
- [x] Normal and demo builds pass.
- [x] Standard Playwright E2E passes: 16 Chromium tests.
- [x] Public demo E2E passes: 21 Chromium tests.
- [x] `git diff --check` passes.
- [x] No tracked `.env`, database, report, test-result, log, credential, or real-data file exists.
- [x] Public demo exposes no frontend API-key field and makes no external AI request.
- [x] Sidebar navigation keeps exactly one active item across desktop/mobile and light/dark modes.

## Public Demo and Vercel

- [x] Demo contract requires only `PUBLIC_DEMO_MODE=true` and `AI_PROVIDER=mock`.
- [x] Database and owner-owned provider credentials are absent from the demo environment.
- [x] Production validates `/`, `/demo`, `/product`, `/architecture`, `/docs`, and product routes.
- [x] Demo reset, refresh reset, context isolation, no-storage, no-database, and no-external-AI controls are covered by E2E.
- [x] Vercel production deployment is active.
- [x] `NEXT_PUBLIC_SITE_URL` is set to `https://personal-atlas-ai.vercel.app`.
- [x] Canonical, sitemap, and robots URLs use the verified production origin.
- [x] README contains the verified live-demo URL.
- [x] AI Coach public demo is available at `/demo/coach`.
- [ ] Vercel Hobby terms, quotas, and usage remain suitable over time.

## Release Media and Publication

- [ ] Fictional-data screenshots are captured and reviewed.
- [ ] A short demo video is captured without local browser chrome or real data.
- [ ] `v1.0.0-beta` tag is created from the verified final `main` commit.
- [ ] GitHub Release is created from [release notes](v1.0.0-beta.md).
- [ ] Repository social preview image is uploaded.
- [ ] GitHub and live-demo links are inserted into the final LinkedIn copy.
- [ ] LinkedIn launch materials receive final human review.

## Public-Repository Final Check

Before changing visibility to public:

- [x] `SECURITY.md` directs vulnerability reports to private channels.
- [x] README clearly states the public demo uses fictional data and Mock AI.
- [x] README clearly states self-host mode is not public multi-user ready.
- [x] API and database credentials are documented as server-side only.
- [x] License is MIT.
- [ ] Maintainer confirms Git history contains no previously committed secret or real financial data.
- [ ] Maintainer enables private vulnerability reporting after the repository becomes public.
