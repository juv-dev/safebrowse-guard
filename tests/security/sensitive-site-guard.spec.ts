import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  SENSITIVE_HOST_RULESET_VERSION,
  isSensitiveHost,
} from '../../src/core/security/sensitiveSiteGuard';
import { nonSensitiveHostSamples, sensitiveHostSamples } from '../fixtures/sensitive-hosts';

describe('isSensitiveHost', () => {
  it.each(sensitiveHostSamples)('should flag $hostname as sensitive ($category)', ({ hostname }) => {
    expect(isSensitiveHost(hostname)).toBe(true);
  });

  it.each(nonSensitiveHostSamples)('should not flag %s as sensitive', (hostname) => {
    expect(isSensitiveHost(hostname)).toBe(false);
  });

  it('should match subdomains of a sensitive host but not lookalike suffixes', () => {
    expect(isSensitiveHost('online.chase.com')).toBe(true);
    expect(isSensitiveHost('notchase.com')).toBe(false);
    expect(isSensitiveHost('chase.com.attacker.example')).toBe(false);
  });

  it('should normalize casing, whitespace and trailing dots', () => {
    expect(isSensitiveHost('  Secure.CHASE.com.  ')).toBe(true);
    expect(isSensitiveHost('MAIL.GOOGLE.COM')).toBe(true);
  });

  it('should return false for empty or whitespace-only input', () => {
    expect(isSensitiveHost('')).toBe(false);
    expect(isSensitiveHost('   ')).toBe(false);
    expect(isSensitiveHost('.')).toBe(false);
  });
});

describe('sensitive host ruleset', () => {
  it('should carry a local version identifier', () => {
    expect(SENSITIVE_HOST_RULESET_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should be resolved from a local module without any network access', () => {
    const source = readFileSync(
      fileURLToPath(new URL('../../src/core/security/sensitiveSiteGuard.ts', import.meta.url)),
      'utf8',
    );

    for (const forbidden of [/\bfetch\s*\(/, /XMLHttpRequest/, /\bimport\s*\(/, /https?:\/\//]) {
      expect(source).not.toMatch(forbidden);
    }
  });
});
