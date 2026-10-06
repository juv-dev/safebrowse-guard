# App Store Accountability Acts research

This document records the current engineering understanding for SafeBrowse Guard. It is not legal advice. Treat Utah, Louisiana, and Texas as `LEGAL COUNSEL REQUIRED` until qualified counsel reviews the product, launch markets, user flows, and store distribution plan.

## Summary

Several United States state laws and proposals around app stores, minors, age assurance, parental consent, and default safety controls are active or changing. SafeBrowse Guard must not launch in affected markets based only on engineering interpretation.

| Jurisdiction | Current planning status | Product impact | Next review |
| --- | --- | --- | --- |
| Utah | LEGAL COUNSEL REQUIRED | Age assurance, parental consent, and default content-safety expectations may affect onboarding and minor profiles. | Before any United States launch or store submission. |
| Louisiana | LEGAL COUNSEL REQUIRED | Effective-date and scope analysis is required before launch; requirements may affect app-store distribution, age assurance, and parental consent. | Before any United States launch or store submission. |
| Texas | LEGAL COUNSEL REQUIRED | Age assurance and minor-safety requirements may affect onboarding, consent records, and default filtering. | Before any United States launch or store submission. |

## Engineering requirements derived from the risk

SafeBrowse Guard must implement the following product controls before activation:

1. Require explicit Terms of Service and Privacy Policy acceptance before the first protection activation.
2. Require an explicit role step before activation: adult self-use, parent or guardian, or minor self-use.
3. Block minor-profile activation unless the installer confirms a parent or guardian role.
4. Store only the consent and role state required to prove the local product flow was completed.
5. Avoid silent activation, dark patterns, or buried legal consent.
6. Keep Privacy Policy text clear that account data is not sold or shared for advertising.
7. Keep the Jurisdiction Matrix marked `LEGAL COUNSEL REQUIRED` for Utah, Louisiana, and Texas until reviewed.

## Utah notes

Utah should be treated as high-risk for a product that filters explicit content and may be used by or for minors. Engineering must assume that onboarding, parental consent, and default content-safety settings can be legally material. The implementation must preserve a clear consent record and must not activate protection silently.

## Louisiana notes

Louisiana should be treated as high-risk because effective dates and scope may change launch obligations. The product must not rely on a one-time historical reading of the law. Before launch, counsel must confirm whether app-store accountability, age assurance, parental consent, or content-filter defaults apply to SafeBrowse Guard's distribution model.

## Texas notes

Texas should be treated as high-risk for minors, explicit-content controls, and age-assurance policy. The product must keep separate adult self-use and parent or guardian installation flows. Product copy must avoid promising impossible enforcement, such as guaranteed prevention of uninstall or guaranteed detection.

## Open legal questions

- Whether each law applies to SafeBrowse Guard directly, to app stores, or both.
- Whether browser extension distribution through a bundled desktop or mobile app changes the obligation scope.
- Whether local-only protection creates different obligations from server-side filtering.
- What record retention is required for consent and role confirmation.
- Whether default-on protection for minors is required, prohibited before consent, or conditionally permitted after parental consent.

## Decision

For engineering planning, Utah, Louisiana, and Texas remain `LEGAL COUNSEL REQUIRED`. The codebase may implement consent and role gates now, but market launch and final legal copy require human counsel.
