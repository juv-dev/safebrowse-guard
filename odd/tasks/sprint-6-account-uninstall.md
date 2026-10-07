# Sprint 6 — Account registration and uninstall authorization

## Objective
Complete SG Sprint 6 on top of the Sprint 5 candidate and prepare the next prerelease candidate as v0.4.3.

## Scope
- SG-14: account registration with email verification and explicit consent gate.
- SG-15: temporary password by email for uninstall or deactivation.
- SG-16: three-step confirmation before uninstall or deactivation.
- SG-17: account privacy separation from the Protection Engine.

## Constraints
- Do not edit CI/CD workflows.
- Keep the account contract separated from browsing history, URLs, page content, blocked content, and Protection Engine outputs.
- Keep technical artifacts in English.
- Version this work as 0.4.3 after v0.4.2.
- User authorized continuing sprint work, commits, push, and release-style delivery.

## Tasks
- [x] T1: Add account registration and verification contracts.
  - Acceptance: account requests contain only email and consent state; account status exposes email, verification and entitlement fields only.
  - Checks: unit tests and privacy contract tests passed.
  - Commit: 29df6f4c5f0f1575f4b06aec2264f7f45098a597.
- [x] T2: Add uninstall authorization contracts.
  - Acceptance: uninstall/deactivation requires request, warning acknowledgement, and temporary password confirmation in order.
  - Checks: unit tests for ordering, expiry and one-use validation passed.
  - Commit: 29df6f4c5f0f1575f4b06aec2264f7f45098a597.
- [x] T3: Document account privacy and release v0.4.3 scope.
  - Acceptance: docs explain no browsing data reaches account services; release notes mention Sprint 6 scope and limits.
  - Checks: document tests, lint, typecheck, test, build and manifest readback passed.
  - Commit: 29df6f4c5f0f1575f4b06aec2264f7f45098a597.

## Evidence
- Branch: feature/sprint-5-consent-legal.
- Base: v0.4.2 candidate branch.
- Focused tests: `pnpm vitest run tests/unit/account/account-contracts.spec.ts tests/unit/account/uninstall-authorization.spec.ts` passed.
- Account docs tests: `pnpm vitest run tests/unit/account/account-contracts.spec.ts tests/unit/account/uninstall-authorization.spec.ts tests/legal/account-privacy-docs.spec.ts` passed.
- Full checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` passed.
- Manifest readback: `dist/chrome/manifest.json` and `dist/firefox/manifest.json` report `0.4.3`.
