## Summary

What problem does this PR solve, and why is this the smallest appropriate change?

## Change Type

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor with no intended behavior change
- [ ] Test / CI
- [ ] Documentation
- [ ] Security hardening

## Scope

### Included

-

### Not Included

-

## Architecture and Product Alignment

- [ ] Deterministic finance logic remains the source of financial truth.
- [ ] AI remains downstream and explanatory.
- [ ] User agency, uncertainty, and evidence remain visible.
- [ ] Demo and self-host execution boundaries remain explicit.
- [ ] Documentation marks behavior as implemented, experimental, or planned accurately.

## Validation

List commands actually run and results. Mark unavailable checks with a reason.

- [ ] `npm run security:secrets`
- [ ] `npm run lint`
- [ ] `npm run test:unit`
- [ ] `npm run test:integration` when repository/data behavior changes
- [ ] `npm run build`
- [ ] `npm run test:e2e` when DB-backed user flows change
- [ ] `npm run build:demo` when demo boundaries change
- [ ] `npm run test:e2e:demo` when demo behavior changes

## Security and Privacy

- [ ] No `.env`, API key, database credential, real financial data, database file, or generated test artifact is included.
- [ ] Client code does not receive Prisma access or server credentials.
- [ ] New logs and errors do not expose financial inputs or provider responses.
- [ ] Provider/context changes preserve minimization and safe fallback behavior.

## UI and Documentation

- [ ] User-facing copy is calm, non-authoritative, and Turkish-first where applicable.
- [ ] Responsive and accessibility impact was reviewed when UI changed.
- [ ] Setup, environment, architecture, or workflow documentation was updated when required.

## Risk and Rollback

Describe likely regressions, monitoring needs, and the smallest rollback path.

## Screenshots

Add redacted before/after screenshots for visible changes. Use fictional data only.
