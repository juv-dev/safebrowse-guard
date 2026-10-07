# Account privacy boundary

SafeBrowse Guard account features exist only to verify an email address, recover authorized access, and resolve entitlement state. They must not become a telemetry or browsing-data channel.

## Account registration contract

The account registration request contains only:

- email
- explicit consent completion flag

It must not contain:

- browsing history
- full URL or hostname
- page title
- search query
- blocked content
- classification result
- screenshots
- private messages
- form values
- password or payment canaries

## Account status contract

The account status response contains only:

- email
- verified
- createdAt
- entitlements
- expiresAt

The Protection Engine can read entitlement state when a feature requires it, but account services must not import or receive Protection Engine inputs or outputs.

## Uninstall or deactivation authorization

Uninstall or deactivation follows three ordered steps:

1. Start an uninstall or deactivation request.
2. Acknowledge the protection loss warning.
3. Confirm with the temporary password sent through the account email channel.

The temporary password is one-use and expires. The local flow must reject out-of-order confirmation, expired passwords, already used passwords, and incorrect passwords.

## Privacy test rule

Tests must fail if account contracts include Protection Engine data. The account layer is allowed to know account identity and entitlement state only.
