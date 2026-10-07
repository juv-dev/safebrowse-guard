export type AgeRole = 'adult-self' | 'parent-guardian' | 'minor-self';

export type ConsentGateReason =
  | 'terms-consent-required'
  | 'privacy-consent-required'
  | 'age-role-required'
  | 'parental-consent-required';

export interface ProtectionConsentState {
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
  ageRole?: AgeRole;
}

export type ConsentGateDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason: ConsentGateReason;
    };

export function canActivateProtection(state: ProtectionConsentState): ConsentGateDecision {
  if (!state.acceptedTerms) {
    return { allowed: false, reason: 'terms-consent-required' };
  }

  if (!state.acceptedPrivacyPolicy) {
    return { allowed: false, reason: 'privacy-consent-required' };
  }

  if (state.ageRole === undefined) {
    return { allowed: false, reason: 'age-role-required' };
  }

  if (state.ageRole === 'minor-self') {
    return { allowed: false, reason: 'parental-consent-required' };
  }

  return { allowed: true };
}

export function canActivateMinorProfile(state: ProtectionConsentState): ConsentGateDecision {
  const protectionDecision = canActivateProtection(state);

  if (!protectionDecision.allowed) {
    return protectionDecision;
  }

  if (state.ageRole !== 'parent-guardian') {
    return { allowed: false, reason: 'parental-consent-required' };
  }

  return { allowed: true };
}
