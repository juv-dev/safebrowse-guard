# Sprint 8 — Keyword rules and custom rules

## Objective
Complete SG Sprint 8 on top of the Sprint 7 candidate and prepare the next prerelease candidate as v0.4.5.

## Scope
- SG-36: Keyword Guard with structured keyword rules.
- SG-37: context rules that prevent low-risk isolated keywords from blocking educational or medical content.
- SG-38: custom block/allow keyword entries with ReDoS validation and privacy boundaries.

## Constraints
- Do not edit CI/CD workflows.
- Do not read form values, textareas, contenteditable regions, private messages, query strings, fragments, credentials, or tokens for custom rules.
- Use English for repository-facing technical artifacts.
- Version this work as 0.4.5 after v0.4.4.

## Tasks
- [x] T1: Add structured Keyword Guard.
  - Acceptance: rules are data objects; evaluateKeywords filters by protection level and returns matched categories/weights.
  - Checks: unit tests passed.
  - Commit: pending final work-unit commit.
- [x] T2: Add context aggregation rules.
  - Acceptance: low-risk isolated educational terms do not block; explicit combinations do block; generic one-word rules are rejected.
  - Checks: unit tests passed.
  - Commit: pending final work-unit commit.
- [x] T3: Add custom keyword entry validation.
  - Acceptance: block/allow entries persist as sanitized patterns only; unsafe regex patterns are rejected before save.
  - Checks: unit tests, lint, typecheck, test, build and manifest readback passed.
  - Commit: pending final work-unit commit.

## Evidence
- Branch: feat/sprint-8-keyword-rules.
- Base: v0.4.4 candidate branch.
- Focused tests: `pnpm vitest run tests/unit/keywords/keyword-guard.spec.ts tests/unit/keywords/context-rules.spec.ts tests/unit/keywords/custom-keywords.spec.ts` passed.
- Full checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` passed.
- Manifest readback: `dist/chrome/manifest.json` and `dist/firefox/manifest.json` report `0.4.5`.
