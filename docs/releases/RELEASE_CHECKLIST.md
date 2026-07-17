# Atlas AI v1.0.0-beta Release Checklist

Status values: `[x]` verified in the release-candidate repository, `[ ]` requires a manual or hosted step.

## Repository

- [ ] Release branch has been merged to a clean `main`.
- [ ] Required GitHub Actions checks are green on the final commit.
- [x] Package metadata is `1.0.0-beta`.
- [x] `CHANGELOG.md` and GitHub release notes are finalized.
- [x] README, license, security, contributing, conduct, issue, and PR files are present.
- [x] Implemented, experimental, planned, and known-limitation language is explicit.
- [ ] Repository visibility is confirmed as public by the maintainer.
- [ ] Repository topics and GitHub About description are configured.
- [ ] GitHub Discussions categories are configured if Discussions is enabled.

## Quality and Security

- [x] `npm run security:secrets` passes in the local release-candidate audit.
- [x] `npm run security:audit` passes at the configured high-severity gate; four moderate transitive advisories are recorded without applying the breaking forced downgrade.
- [x] `npm run lint` passes.
- [x] `npm run test:unit` passes: 127 tests.
- [x] `npm run test:integration` passes against isolated test-preview schemas: 11 tests.
- [x] `npm run build` and `npm run build:demo` pass.
- [x] `npm run test:e2e` passes: 16 Chromium tests.
- [x] `npm run test:e2e:demo` passes: 17 Chromium demo/public tests.
- [x] `git diff --check` passes.
- [x] No tracked `.env`, database, report, test-result, log, credential, or real-data file exists.

## Public Demo and Vercel

- [x] Demo contract requires only `PUBLIC_DEMO_MODE=true` and `AI_PROVIDER=mock`.
- [x] Database and owner-owned provider credentials are forbidden in the demo environment.
- [ ] Vercel preview validates `/`, `/demo`, `/product`, `/architecture`, `/docs`, and resource routes.
- [ ] Demo reset, refresh reset, context isolation, no-storage, no-database, and no-external-AI checks pass on preview.
- [ ] Preview is promoted to Production only after validation.
- [ ] Stable production origin is set in optional `NEXT_PUBLIC_SITE_URL` if needed.
- [ ] Canonical, Open Graph, Twitter, sitemap, and robots URLs use the final origin.
- [ ] README live-demo placeholder is replaced with the verified URL.
- [ ] Vercel Hobby terms, quotas, and non-commercial eligibility remain suitable.

## Release Media and Publication

- [ ] Fictional-data screenshots are captured and reviewed.
- [ ] README screenshot placeholders are replaced only with approved images.
- [x] Screenshot plan and LinkedIn launch package are prepared.
- [ ] Short demo video is captured without local browser chrome or real data.
- [ ] `v1.0.0-beta` tag is created from the verified final `main` commit.
- [ ] GitHub Release is created from [release notes](v1.0.0-beta.md).
- [ ] GitHub and live-demo links are inserted into the launch copy.
- [ ] LinkedIn launch materials receive final human review.
