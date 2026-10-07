# Bitdefender Total Security coexistence plan

SafeBrowse Guard must prove desktop filtering coexistence with Bitdefender Total Security before claiming compatibility. This document defines the evidence required for Windows, macOS, and Linux adapters.

## Current status

Status: `REQUIRES REAL DEVICE TESTING`.

No desktop adapter may be marked complete based only on theoretical compatibility. Android VPN-slot conflict is already known, but that evidence does not prove anything about desktop network filtering, proxy configuration, WFP filters, macOS Network Extension, or Linux firewall behavior.

## Compatibility claim rule

Do not claim that SafeBrowse Guard is compatible with Bitdefender Total Security until a real machine test records:

- operating system name and version
- Bitdefender Total Security version
- SafeBrowse Guard commit SHA and artifact identity
- adapter mechanism tested
- test steps
- expected result
- observed result
- whether both products kept functioning
- logs or screenshots that do not expose personal data

## Windows test plan

Candidate mechanisms:

- local proxy
- Windows Filtering Platform integration

Required test:

1. Install Bitdefender Total Security and confirm its protection is active.
2. Install the SafeBrowse Guard Windows adapter prototype.
3. Confirm SafeBrowse Guard can block a controlled test destination.
4. Confirm Bitdefender still reports active protection.
5. Confirm Bitdefender can still block its own controlled test destination or safe vendor test page.
6. Reboot and repeat the two blocking checks.
7. Uninstall SafeBrowse Guard and confirm Bitdefender remains functional.

Completion status remains blocked until this evidence exists.

## macOS test plan

Candidate mechanism:

- Network Extension content filter

Required test:

1. Confirm the Network Extension entitlement and signing setup for the tested build.
2. Install Bitdefender Total Security for macOS and confirm protection is active.
3. Install the SafeBrowse Guard macOS adapter prototype.
4. Confirm both products remain enabled after approval prompts.
5. Confirm SafeBrowse Guard can block a controlled test destination.
6. Confirm Bitdefender can still block its own controlled test destination or safe vendor test page.
7. Reboot and repeat the two blocking checks.

Completion status remains blocked until this evidence exists.

## Linux test plan

Candidate mechanisms:

- local proxy
- nftables or iptables rules

Bitdefender Total Security desktop availability and exact product behavior must be verified for the selected Linux distribution before testing. If Bitdefender is unavailable for the target Linux environment, record that fact and test against the closest supported Bitdefender endpoint product only if the product owner accepts that scope.

Required test:

1. Record distribution, kernel version, and Bitdefender product/version.
2. Confirm Bitdefender protection is active.
3. Install the SafeBrowse Guard Linux adapter prototype.
4. Confirm SafeBrowse Guard can block a controlled test destination.
5. Confirm Bitdefender remains active and can still perform its own protection check.
6. Remove SafeBrowse Guard rules or proxy configuration and confirm cleanup is reversible.

## Result classification

| Result | Meaning | Next action |
| --- | --- | --- |
| Compatible | Both products work after install, reboot, protection checks, and uninstall cleanup. | Document evidence and unblock the adapter story. |
| Requires adjustment | Both products can coexist only after configuration changes. | Implement the adjustment and retest. |
| Incompatible | One product disables or breaks the other. | Do not claim support; choose a different adapter mechanism or document the limitation. |

## Product limitation

Until the real tests pass, SafeBrowse Guard must say that Bitdefender desktop coexistence is under validation. It must not state or imply guaranteed compatibility.
