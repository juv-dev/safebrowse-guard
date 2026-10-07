import { describe, expect, it } from 'vitest';

import {
  canActivateMinorProfile,
  canActivateProtection,
  type ProtectionConsentState,
} from '../../../src/core/consent/protectionConsent';

describe('canActivateProtection', () => {
  it('should reject the default installation state before any explicit consent', () => {
    const state: ProtectionConsentState = {
      acceptedTerms: false,
      acceptedPrivacyPolicy: false,
    };

    expect(canActivateProtection(state)).toEqual({ allowed: false, reason: 'terms-consent-required' });
  });

  it('should require privacy policy consent separately from terms consent', () => {
    const state: ProtectionConsentState = {
      acceptedTerms: true,
      acceptedPrivacyPolicy: false,
      ageRole: 'adult-self',
    };

    expect(canActivateProtection(state)).toEqual({ allowed: false, reason: 'privacy-consent-required' });
  });

  it('should require an explicit age role before protection activation', () => {
    const state: ProtectionConsentState = {
      acceptedTerms: true,
      acceptedPrivacyPolicy: true,
    };

    expect(canActivateProtection(state)).toEqual({ allowed: false, reason: 'age-role-required' });
  });

  it('should allow protection for an adult installing for personal use', () => {
    expect(
      canActivateProtection({
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        ageRole: 'adult-self',
      }),
    ).toEqual({ allowed: true });
  });

  it('should allow protection for a parent or guardian installing with legitimate authority', () => {
    expect(
      canActivateProtection({
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        ageRole: 'parent-guardian',
      }),
    ).toEqual({ allowed: true });
  });

  it('should reject a minor self-declaration before protection activation', () => {
    expect(
      canActivateProtection({
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        ageRole: 'minor-self',
      }),
    ).toEqual({ allowed: false, reason: 'parental-consent-required' });
  });
});

describe('canActivateMinorProfile', () => {
  it('should require the parent or guardian role for minor profile activation', () => {
    expect(
      canActivateMinorProfile({
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        ageRole: 'adult-self',
      }),
    ).toEqual({ allowed: false, reason: 'parental-consent-required' });
  });

  it('should allow minor profile activation only for a parent or guardian', () => {
    expect(
      canActivateMinorProfile({
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        ageRole: 'parent-guardian',
      }),
    ).toEqual({ allowed: true });
  });
});
