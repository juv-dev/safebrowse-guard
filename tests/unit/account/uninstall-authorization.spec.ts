import { describe, expect, it } from 'vitest';

import {
  acknowledgeUninstallRisk,
  attachTemporaryPasswordChallenge,
  confirmUninstallAuthorization,
  startUninstallRequest,
  type TemporaryPasswordChallenge,
  type UninstallFlowState,
} from '../../../src/core/account/uninstallAuthorization';

const hashPassword = (password: string): string => `hash:${password}`;
const NOW = 1_800_000_000_000;

function challenge(overrides: Partial<TemporaryPasswordChallenge> = {}): TemporaryPasswordChallenge {
  return {
    requestId: 'uninstall-request-1',
    passwordHash: hashPassword('123456'),
    expiresAt: NOW + 60_000,
    used: false,
    ...overrides,
  };
}

describe('uninstall authorization flow', () => {
  it('should require a request before the risk acknowledgement step', () => {
    const state: UninstallFlowState = { requestCreated: false, riskAcknowledged: false };

    expect(acknowledgeUninstallRisk(state)).toEqual({ ok: false, reason: 'request-required' });
  });

  it('should require acknowledgement before attaching the temporary password challenge', () => {
    const started = startUninstallRequest();

    expect(started.ok).toBe(true);
    if (!started.ok) {
      return;
    }

    expect(attachTemporaryPasswordChallenge(started.state, challenge())).toEqual({
      ok: false,
      reason: 'risk-acknowledgement-required',
    });
  });

  it('should confirm only after request, acknowledgement and valid temporary password', () => {
    const started = startUninstallRequest();
    expect(started.ok).toBe(true);
    if (!started.ok) {
      return;
    }

    const acknowledged = acknowledgeUninstallRisk(started.state);
    expect(acknowledged.ok).toBe(true);
    if (!acknowledged.ok) {
      return;
    }

    const withChallenge = attachTemporaryPasswordChallenge(acknowledged.state, challenge());
    expect(withChallenge.ok).toBe(true);
    if (!withChallenge.ok) {
      return;
    }

    const confirmed = confirmUninstallAuthorization(withChallenge.state, '123456', hashPassword, NOW);

    expect(confirmed).toEqual({
      ok: true,
      state: {
        requestCreated: true,
        riskAcknowledged: true,
        challenge: {
          requestId: 'uninstall-request-1',
          passwordHash: hashPassword('123456'),
          expiresAt: NOW + 60_000,
          used: true,
        },
      },
    });
  });

  it('should reject an expired temporary password', () => {
    const state: UninstallFlowState = {
      requestCreated: true,
      riskAcknowledged: true,
      challenge: challenge({ expiresAt: NOW - 1 }),
    };

    expect(confirmUninstallAuthorization(state, '123456', hashPassword, NOW)).toEqual({
      ok: false,
      reason: 'challenge-expired',
    });
  });

  it('should reject an already used temporary password', () => {
    const state: UninstallFlowState = {
      requestCreated: true,
      riskAcknowledged: true,
      challenge: challenge({ used: true }),
    };

    expect(confirmUninstallAuthorization(state, '123456', hashPassword, NOW)).toEqual({
      ok: false,
      reason: 'challenge-used',
    });
  });

  it('should reject an incorrect temporary password', () => {
    const state: UninstallFlowState = {
      requestCreated: true,
      riskAcknowledged: true,
      challenge: challenge(),
    };

    expect(confirmUninstallAuthorization(state, '000000', hashPassword, NOW)).toEqual({
      ok: false,
      reason: 'invalid-temporary-password',
    });
  });
});
