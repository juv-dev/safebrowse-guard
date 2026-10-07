import { describe, expect, it } from 'vitest';

import {
  createAccountRegistrationRequest,
  createAccountStatus,
} from '../../../src/core/account/accountContracts';

const CONSENTED = {
  acceptedTerms: true,
  acceptedPrivacyPolicy: true,
  ageRole: 'adult-self' as const,
};

describe('createAccountRegistrationRequest', () => {
  it('should create a minimal account registration request after explicit consent', () => {
    const result = createAccountRegistrationRequest({
      email: ' Test-User@Example.COM ',
      consent: CONSENTED,
    });

    expect(result).toEqual({
      ok: true,
      request: {
        email: 'test-user@example.com',
        consentAccepted: true,
      },
    });
  });

  it('should reject registration before the consent gate is complete', () => {
    const result = createAccountRegistrationRequest({
      email: 'test@example.com',
      consent: { acceptedTerms: true, acceptedPrivacyPolicy: false, ageRole: 'adult-self' },
    });

    expect(result).toEqual({ ok: false, reason: 'consent-required' });
  });

  it('should reject invalid email addresses', () => {
    const result = createAccountRegistrationRequest({
      email: 'not-an-email',
      consent: CONSENTED,
    });

    expect(result).toEqual({ ok: false, reason: 'invalid-email' });
  });

  it('should not include protection engine data in the request', () => {
    const result = createAccountRegistrationRequest({
      email: 'private@example.com',
      consent: CONSENTED,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(Object.keys(result.request).sort()).toEqual(['consentAccepted', 'email']);
    expect(JSON.stringify(result.request)).not.toContain('hostname');
    expect(JSON.stringify(result.request)).not.toContain('url');
    expect(JSON.stringify(result.request)).not.toContain('history');
    expect(JSON.stringify(result.request)).not.toContain('blocked');
  });
});

describe('createAccountStatus', () => {
  it('should expose only account and entitlement state', () => {
    const status = createAccountStatus({
      email: 'USER@Example.com',
      verified: true,
      createdAt: '2026-10-06T00:00:00.000Z',
      entitlements: ['DOMAIN_BLOCKING'],
      expiresAt: '2027-10-06T00:00:00.000Z',
    });

    expect(status).toEqual({
      email: 'user@example.com',
      verified: true,
      createdAt: '2026-10-06T00:00:00.000Z',
      entitlements: ['DOMAIN_BLOCKING'],
      expiresAt: '2027-10-06T00:00:00.000Z',
    });
    expect(Object.keys(status).sort()).toEqual([
      'createdAt',
      'email',
      'entitlements',
      'expiresAt',
      'verified',
    ]);
  });
});
