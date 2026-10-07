# Preloaded domain lists

SafeBrowse Guard embeds reviewed domain lists at build time. Runtime code must not download remote rules or execute remote code.

## Current fixture list

The current repository list is a deterministic development fixture used to validate Domain Intelligence behavior before a production source is selected.

| Field | Value |
| --- | --- |
| Source | SafeBrowse Guard curated development fixture list |
| License | Project test fixture only; replace with reviewed public source before production use |
| Version | 2026-10-07 |
| SHA-256 | sha256:2f6baf8b8bd04e80e41a05dfdf6f6ca2f73f2f1a68a957516a476e31c8b2f424 |
| Attribution | Internal fixtures derived from non-resolving example hostnames for deterministic tests. |

## Production source requirements

Before using a public list in production, compare at least two candidate sources and record:

- source URL and maintainer
- license and commercial redistribution rights
- update cadence and version date
- false-positive handling
- normalized output SHA-256
- attribution text

## Runtime boundary

Domain lists are data. They are normalized and embedded at build time. The extension must not fetch, import, evaluate, or execute a remote ruleset at runtime.
