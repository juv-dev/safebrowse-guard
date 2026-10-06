# Sprint 5 — Consent, legal gates, and platform research

## Objective
Complete SG Sprint 5 on top of v0.4.1 and prepare the next prerelease candidate as v0.4.2.

## Scope
- SG-18: explicit consent gate before first protection activation.
- SG-19: explicit age/role confirmation before any minor profile activation.
- SG-20: Privacy Policy clause that states account/email data is not sold or shared for advertising.
- SG-21: App Store Accountability Acts research for Utah, Louisiana, and Texas.
- SG-22: Bitdefender Total Security coexistence research for desktop adapters.

## Constraints
- Do not edit CI/CD workflows.
- Keep security and privacy controls available without premium gating.
- Use English for repository-facing technical artifacts.
- Version this work as 0.4.2 after v0.4.1.
- User authorized commit, push, and release-style delivery for this sprint.

## Tasks
- [x] T1: Add consent and age-role domain gates with tests.
  - Acceptance: protection is inactive until explicit terms/privacy consent; minor profiles require an explicit parent/guardian role; default state is not activated.
  - Checks: focused unit tests and pipeline integration test passed.
  - Commit: 8c0b826d71998b5123f94a9a507581f9b0091ba9.
- [x] T2: Add legal and research documentation for Sprint 5.
  - Acceptance: Privacy Policy no sale/share advertising clause; Utah/Louisiana/Texas accountability acts research; Bitdefender coexistence test plan and current evidence limits.
  - Checks: document assertions and lint passed.
  - Commit: 8c0b826d71998b5123f94a9a507581f9b0091ba9.
- [x] T3: Bump package version to 0.4.2 and document release notes.
  - Acceptance: package version is 0.4.2; release notes mention Sprint 5 scope and evidence boundaries.
  - Checks: typecheck, test, build and manifest readback passed after correcting one shell quoting mistake in the manifest readback command.
  - Commit: 8c0b826d71998b5123f94a9a507581f9b0091ba9.

## Evidence
- Branch: feature/sprint-5-consent-legal.
- Base: v0.4.1 / main.
- Focused tests: `pnpm vitest run tests/unit/consent/protection-consent.spec.ts tests/pipeline/classification-pipeline.spec.ts` passed.
- Sprint 5 docs tests: `pnpm vitest run tests/legal/sprint-5-docs.spec.ts tests/unit/consent/protection-consent.spec.ts tests/pipeline/classification-pipeline.spec.ts` passed.
- Full checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` passed.
- Manifest readback: `dist/chrome/manifest.json` and `dist/firefox/manifest.json` report `0.4.2`.
- Native review attempt: lineage `review-ed8b37d8e0d66a4f` could not complete because the configured reviewer transport requested an unavailable `openai-codex` API key. RDD assessment marked the candidate `unassessable`; inline self-verification and deterministic checks were used.
