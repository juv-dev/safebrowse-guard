# Sprint 7 — Detection foundation

## Objective
Complete SG Sprint 7 on top of v0.4.3 and prepare the next prerelease candidate as v0.4.4.

## Scope
- SG-33: shared text and hostname normalization.
- SG-34: Domain Intelligence with local block rules priority.
- SG-35: preloaded adult domain list metadata and build-time dataset boundary.

## Constraints
- Do not edit CI/CD workflows.
- Keep detection local-first; no runtime remote rules execution.
- Use English for repository-facing technical artifacts.
- Version this work as 0.4.4 after v0.4.3.

## Tasks
- [x] T1: Add normalization functions with ReDoS-oriented tests.
  - Acceptance: normalizeText and normalizeHostname support lowercase, NFKC, accent removal, URL decoding, full-width normalization and separator collapsing.
  - Checks: unit tests passed.
  - Commit: d9d757018263c3a2e19c4c290bd065c56bc99b1c.
- [x] T2: Add Domain Intelligence with local rule priority.
  - Acceptance: local block rules are evaluated before embedded domain list; known adult domains return blocking classification; normal domains return null.
  - Checks: unit tests and pipeline-style spies passed.
  - Commit: d9d757018263c3a2e19c4c290bd065c56bc99b1c.
- [x] T3: Add preloaded list metadata and docs.
  - Acceptance: metadata includes source, license, version/date, SHA-256, and attribution; docs clarify build-time embedding and no runtime remote code.
  - Checks: unit/doc tests, lint, typecheck, test, build and manifest readback passed.
  - Commit: d9d757018263c3a2e19c4c290bd065c56bc99b1c.

## Evidence
- Branch: feat/sprint-7-detection-foundation.
- Base: v0.4.3 candidate branch.
- Focused tests: `pnpm vitest run tests/unit/normalization/text-normalization.spec.ts tests/unit/domain-intelligence/domain-intelligence.spec.ts tests/legal/domain-lists-docs.spec.ts` passed after fixing hostname leading-hyphen handling and ESLint `no-control-regex` compliance.
- Full checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` passed.
- Manifest readback: `dist/chrome/manifest.json` and `dist/firefox/manifest.json` report `0.4.4`.
