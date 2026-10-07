# Privacy Policy

SafeBrowse Guard is designed as a local-first protection product. This draft describes the product privacy commitments that the implementation must preserve. It is not legal advice and requires human legal review before commercial launch.

## Account data

When account features are enabled, SafeBrowse Guard may process the minimum account data needed to identify the account and its entitlements:

- email address
- verification status
- account creation date
- entitlement status
- entitlement expiration date

The account service must not receive browsing history, full URLs, page titles, search queries, screenshots, blocked content, private messages, form values, passwords, payment card numbers, health data, or other page content inspected by the Protection Engine.

Uninstall or deactivation may require a temporary one-use password sent through the account email channel. The temporary password flow authorizes only the uninstall or deactivation request and must not transmit Protection Engine data.

## No sale or advertising sharing

SafeBrowse Guard does not sell account data, email addresses, browsing data, protection events, or product usage data. SafeBrowse Guard does not share account data, email addresses, browsing data, protection events, or product usage data with third parties for advertising, ad targeting, cross-context behavioral advertising, or data-broker enrichment.

## Protection Engine separation

The Protection Engine must stay separated from account, licensing, billing, and marketing systems. The Protection Engine may read only local policy, local configuration, local rules, and local classification inputs needed to protect the current browsing context. Account and licensing systems may return only entitlement state and must not receive Protection Engine inputs or outputs.

## Consent before activation

SafeBrowse Guard must not activate blocking, monitoring, or filtering before the user explicitly accepts the Terms of Service and this Privacy Policy. The product must also collect the installer's age or role before activation:

- adult installing for personal use
- parent or guardian installing for a minor under legitimate authority
- minor attempting to install for themselves

A minor profile must not activate unless the installer confirms the parent or guardian role.

## Sensitive data boundaries

SafeBrowse Guard must not read or persist text typed into form fields, editable regions, private messages, search inputs, password fields, clipboard events, or keyboard events. Privacy canaries used in tests must never appear in classification results, logs, storage, runtime messages, provider requests, block-page parameters, or account requests.

## Draft status

This policy is a product and engineering draft. It must be reviewed by qualified legal counsel before public launch, store submission, or commercial distribution.
