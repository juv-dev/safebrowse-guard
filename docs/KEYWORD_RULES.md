# Keyword rules

Keyword Guard uses structured data rules instead of a single large regular expression. Each rule records its category, language, locations, protection levels, risk weight and confidence.

## Context rule

A single low-risk keyword is not enough to block educational, medical, health, news or research content. Blocking requires either high-confidence explicit evidence or combined risk above the keyword threshold.

Permanent regression examples:

- `nudity education and health research` is allowed in the keyword context layer.
- `explicit XXX sexual videos hentai archive` is blocked.
- Generic one-word rules such as `big`, `hand`, `maid`, `adult`, `sex` and `sexual` are rejected as standalone rules.

## Custom keyword entries

Custom keyword entries are normalized before saving. They store only the sanitized pattern, entry type and creation time. They must not store full URLs, query strings, fragments, credentials, private tokens or form values.

Unsafe regex-shaped patterns are rejected before saving to reduce ReDoS risk. Custom entries match public text only after the PrivacyBoundary and SafeDOMScanner exclusions have removed protected inputs and editable regions.
