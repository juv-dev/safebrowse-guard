import { describe, expect, it } from 'vitest';

import {
  createCustomKeywordEntry,
  evaluateCustomKeywords,
} from '../../../src/core/keywords/customKeywords';

const CREATED_AT = '2026-10-07T00:00:00.000Z';

describe('createCustomKeywordEntry', () => {
  it('should create a sanitized custom block entry', () => {
    expect(createCustomKeywordEntry(' HéntaI_Custom ', 'block', CREATED_AT)).toEqual({
      ok: true,
      entry: {
        pattern: 'hentai custom',
        type: 'block',
        createdAt: CREATED_AT,
      },
    });
  });

  it('should reject empty, oversized and unsafe patterns before saving', () => {
    expect(createCustomKeywordEntry('   ', 'block', CREATED_AT)).toEqual({ ok: false, reason: 'empty-pattern' });
    expect(createCustomKeywordEntry('a'.repeat(121), 'block', CREATED_AT)).toEqual({
      ok: false,
      reason: 'pattern-too-long',
    });
    expect(createCustomKeywordEntry('(a+)+$', 'block', CREATED_AT)).toEqual({
      ok: false,
      reason: 'unsafe-pattern',
    });
  });
});

describe('evaluateCustomKeywords', () => {
  it('should match sanitized custom entries against public text', () => {
    const entry = createCustomKeywordEntry('custom blocked phrase', 'block', CREATED_AT);
    expect(entry.ok).toBe(true);
    if (!entry.ok) {
      return;
    }

    expect(evaluateCustomKeywords('This contains a custom blocked phrase.', [entry.entry])).toEqual([
      entry.entry,
    ]);
  });

  it('should not persist URL query, fragments or private tokens as part of a keyword entry', () => {
    const entry = createCustomKeywordEntry('private-token', 'allow', CREATED_AT);

    expect(entry).toEqual({
      ok: true,
      entry: {
        pattern: 'private token',
        type: 'allow',
        createdAt: CREATED_AT,
      },
    });
  });
});
