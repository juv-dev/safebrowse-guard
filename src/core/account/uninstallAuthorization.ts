export interface TemporaryPasswordChallenge {
  requestId: string;
  passwordHash: string;
  expiresAt: number;
  used: boolean;
}

export interface UninstallFlowState {
  requestCreated: boolean;
  riskAcknowledged: boolean;
  challenge?: TemporaryPasswordChallenge;
}

export type UninstallStepResult =
  | { ok: true; state: UninstallFlowState }
  | {
      ok: false;
      reason:
        | 'request-required'
        | 'risk-acknowledgement-required'
        | 'challenge-required'
        | 'challenge-expired'
        | 'challenge-used'
        | 'invalid-temporary-password';
    };

export type HashPassword = (password: string) => string;

export function startUninstallRequest(state: UninstallFlowState = { requestCreated: false, riskAcknowledged: false }): UninstallStepResult {
  return { ok: true, state: { ...state, requestCreated: true } };
}

export function acknowledgeUninstallRisk(state: UninstallFlowState): UninstallStepResult {
  if (!state.requestCreated) {
    return { ok: false, reason: 'request-required' };
  }

  return { ok: true, state: { ...state, riskAcknowledged: true } };
}

export function attachTemporaryPasswordChallenge(
  state: UninstallFlowState,
  challenge: TemporaryPasswordChallenge,
): UninstallStepResult {
  if (!state.requestCreated) {
    return { ok: false, reason: 'request-required' };
  }

  if (!state.riskAcknowledged) {
    return { ok: false, reason: 'risk-acknowledgement-required' };
  }

  return { ok: true, state: { ...state, challenge: { ...challenge } } };
}

export function confirmUninstallAuthorization(
  state: UninstallFlowState,
  temporaryPassword: string,
  hashPassword: HashPassword,
  now: number,
): UninstallStepResult {
  if (!state.requestCreated) {
    return { ok: false, reason: 'request-required' };
  }

  if (!state.riskAcknowledged) {
    return { ok: false, reason: 'risk-acknowledgement-required' };
  }

  if (state.challenge === undefined) {
    return { ok: false, reason: 'challenge-required' };
  }

  if (state.challenge.used) {
    return { ok: false, reason: 'challenge-used' };
  }

  if (now > state.challenge.expiresAt) {
    return { ok: false, reason: 'challenge-expired' };
  }

  if (hashPassword(temporaryPassword) !== state.challenge.passwordHash) {
    return { ok: false, reason: 'invalid-temporary-password' };
  }

  return {
    ok: true,
    state: {
      ...state,
      challenge: {
        ...state.challenge,
        used: true,
      },
    },
  };
}
