# Vercel Public Demo Deployment

This runbook prepares the database-free Atlas AI public demo for Vercel Hobby. It does not cover a multi-user financial service, PostgreSQL production migration, or authentication.

## Deployment Contract

Required production and preview variables:

```text
PUBLIC_DEMO_MODE=true
AI_PROVIDER=mock
```

Optional canonical origin after a deployment URL is known:

```text
NEXT_PUBLIC_SITE_URL=https://your-final-origin.example
```

`NEXT_PUBLIC_SITE_URL` must contain only an `http://` or `https://` origin. Paths, query parameters, fragments, and credentials are discarded by the application URL resolver. If it is absent, Atlas AI uses `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`, then the localhost development fallback.

Do not configure any of the following for the public demo:

- `DATABASE_URL` or `DIRECT_URL`
- Neon, PostgreSQL, KV, Redis, Blob, or Edge Config credentials
- Owner-owned OpenAI, Gemini, Anthropic, OpenRouter, or custom provider keys
- Analytics, tracking, or session replay credentials

Browser BYOK flags remain `false` by default. No additional environment variable is required for the release demo.

## Vercel Setup

1. Import the GitHub repository into Vercel.
2. Select the repository root. Do not select a nested documentation or application folder.
3. Confirm the `Next.js` framework preset and Node.js `20.x`.
4. Keep the install command as `npm ci`.
5. Keep the build command as `npm run build`. The two required environment values select the database-free route and build boundary.
6. Add `PUBLIC_DEMO_MODE=true` and `AI_PROVIDER=mock` to Preview and Production.
7. Confirm that database credentials and owner-owned AI keys are absent.
8. Deploy a preview.
9. Validate `/`, `/demo`, `/product`, `/architecture`, `/docs`, `/security`, `/robots.txt`, and `/sitemap.xml`.
10. Run the manual items in [Release Checklist](../releases/RELEASE_CHECKLIST.md), then promote the verified preview to Production.
11. Add the verified production origin to `NEXT_PUBLIC_SITE_URL` only when a stable final URL or custom domain exists.
12. Rebuild, then verify canonical, Open Graph, Twitter, sitemap, and robots URLs use the final origin.
13. Replace the explicit live-demo placeholder in `README.md` with the verified URL.

## Validation

Run before promotion:

```bash
npm run security:secrets
npm run security:audit
npm run lint
npm run test:unit
npm run build:demo
npm run test:e2e:demo
git diff --check
```

The deployed public demo must:

- Render the English marketing website at `/` and the fictional workspace at `/demo`.
- Start without `DATABASE_URL` or `DIRECT_URL`.
- Make no Prisma, database, or external AI request from demo flows.
- Reset fictional state on refresh and keep browser contexts isolated.
- Keep product application routes inside `/demo/*`.

## Rollback

1. Stop promotion if preview validation fails.
2. If Production is affected, use Vercel's deployment history to promote the last verified deployment.
3. Keep `PUBLIC_DEMO_MODE=true` and `AI_PROVIDER=mock`; do not introduce a database or paid key as an emergency fallback.
4. Remove or correct an invalid `NEXT_PUBLIC_SITE_URL`, then rebuild.
5. If demo isolation is in doubt, disable the public deployment until the fail-closed boundary is revalidated.

No database cleanup or user-data migration is required because the public demo does not persist financial state.

## Free-Tier Limits

Vercel Hobby is appropriate only while the project and usage comply with its current personal/non-commercial terms, quotas, and fair-use policy. Zero required infrastructure cost does not mean unlimited availability. A quota or policy change may require pausing the demo or choosing another compatible host.

The public demo is not a public beta for real financial information. Authentication, user ownership, production database operations, backups, monitoring, and incident response remain required before any real-data multi-user release.
