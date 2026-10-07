import { canActivateProtection, type ProtectionConsentState } from '../consent/protectionConsent';

export interface AccountRegistrationInput {
  email: string;
  consent: ProtectionConsentState;
}

export interface AccountRegistrationRequest {
  email: string;
  consentAccepted: true;
}

export interface AccountStatus {
  email: string;
  verified: boolean;
  createdAt: string;
  entitlements: readonly string[];
  expiresAt?: string;
}

export type AccountRegistrationResult =
  | { ok: true; request: AccountRegistrationRequest }
  | { ok: false; reason: 'invalid-email' | 'consent-required' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function createAccountRegistrationRequest(
  input: AccountRegistrationInput,
): AccountRegistrationResult {
  const email = input.email.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, reason: 'invalid-email' };
  }

  if (!canActivateProtection(input.consent).allowed) {
    return { ok: false, reason: 'consent-required' };
  }

  return {
    ok: true,
    request: {
      email,
      consentAccepted: true,
    },
  };
}

export function createAccountStatus(input: AccountStatus): AccountStatus {
  return {
    email: input.email.trim().toLowerCase(),
    verified: input.verified,
    createdAt: input.createdAt,
    entitlements: [...input.entitlements],
    ...(input.expiresAt === undefined ? {} : { expiresAt: input.expiresAt }),
  };
}
