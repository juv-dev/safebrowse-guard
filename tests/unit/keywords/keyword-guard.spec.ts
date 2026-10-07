import { describe, expect, it } from 'vitest';

import {
  assertKeywordRulesAreSafe,
  evaluateKeywords,
  KEYWORD_RULES,
  type KeywordRule,
} from '../../../src/core/keywords/keywordGuard';

describe('evaluateKeywords', () => {
  it('should match explicit categories in normal protection', () => {
    expect(evaluateKeywords('Explicit XXX sexual videos', 'NORMAL')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: 'explicit-sex', riskWeight: 80 }),
      ]),
    );
  });

  it('should match hentai and rule34 categories', () => {
    const matches = evaluateKeywords('Hentai gallery and rule 34 archive', 'NORMAL');

    expect(matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: 'hentai' }),
      ]),
    );
  });

  it('should apply strict-only categories only in strict and maximum levels', () => {
    expect(evaluateKeywords('uncensored erotic scene', 'NORMAL')).toEqual([]);
    expect(evaluateKeywords('uncensored erotic scene', 'STRICT')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: 'nudity' }),
      ]),
    );
  });

  it('should reject generic single-word keyword rules', () => {
    const unsafeRule: KeywordRule = {
      id: 'generic-sex',
      pattern: /sex/iu,
      category: 'explicit-sex',
      riskWeight: 10,
      language: 'en',
      locations: ['public-text'],
      protectionLevels: ['NORMAL'],
      confidence: 0.1,
    };

    expect(() => assertKeywordRulesAreSafe([...KEYWORD_RULES, unsafeRule])).toThrow(
      'Generic single-word keyword rule is not allowed',
    );
  });

  it('should accept the bundled structured keyword rules', () => {
    expect(() => assertKeywordRulesAreSafe(KEYWORD_RULES)).not.toThrow();
  });
});
