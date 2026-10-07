import { describe, expect, it } from 'vitest';

import { decideFromKeywordContext } from '../../../src/core/keywords/contextRules';
import { evaluateKeywords } from '../../../src/core/keywords/keywordGuard';

describe('decideFromKeywordContext', () => {
  it('should not block an isolated low-risk educational keyword', () => {
    const matches = evaluateKeywords('nudity education and health research', 'STRICT');

    expect(decideFromKeywordContext('nudity education and health research', matches)).toEqual({
      decision: 'allow',
      riskScore: 45,
      categories: ['nudity'],
      reasons: ['single-low-risk-educational-context'],
    });
  });

  it('should block explicit combined keyword signals', () => {
    const text = 'explicit XXX sexual videos hentai archive';
    const matches = evaluateKeywords(text, 'NORMAL');

    expect(decideFromKeywordContext(text, matches)).toEqual({
      decision: 'block',
      riskScore: 155,
      categories: ['explicit-sex', 'hentai'],
      reasons: ['keyword-risk-threshold-met'],
    });
  });

  it('should return unknown when keyword signal is insufficient', () => {
    expect(decideFromKeywordContext('ordinary news page', [])).toEqual({
      decision: 'unknown',
      riskScore: 0,
      categories: [],
      reasons: ['no-keyword-signal'],
    });
  });
});
