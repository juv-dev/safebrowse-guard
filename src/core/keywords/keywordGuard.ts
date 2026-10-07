import { normalizeText } from '../normalization/textNormalization';

export type ProtectionLevel = 'NORMAL' | 'STRICT' | 'MAXIMUM';

export interface KeywordRule {
  id: string;
  pattern: RegExp;
  category: string;
  riskWeight: number;
  language: string;
  locations: readonly string[];
  protectionLevels: readonly ProtectionLevel[];
  confidence: number;
}

export interface KeywordMatch {
  ruleId: string;
  category: string;
  riskWeight: number;
  confidence: number;
}

export const KEYWORD_RULES: readonly KeywordRule[] = [
  {
    id: 'explicit-sex-en',
    pattern: /\b(?:explicit sex|xxx|porn(?:ography)?|hardcore)\b/iu,
    category: 'explicit-sex',
    riskWeight: 80,
    language: 'en',
    locations: ['title', 'metadata', 'public-text'],
    protectionLevels: ['NORMAL', 'STRICT', 'MAXIMUM'],
    confidence: 0.95,
  },
  {
    id: 'hentai-en',
    pattern: /\b(?:hentai|rule\s*34)\b/iu,
    category: 'hentai',
    riskWeight: 75,
    language: 'en',
    locations: ['title', 'metadata', 'public-text'],
    protectionLevels: ['NORMAL', 'STRICT', 'MAXIMUM'],
    confidence: 0.9,
  },
  {
    id: 'nudity-strict-en',
    pattern: /\b(?:nudity|erotic|uncensored)\b/iu,
    category: 'nudity',
    riskWeight: 45,
    language: 'en',
    locations: ['title', 'metadata', 'public-text'],
    protectionLevels: ['STRICT', 'MAXIMUM'],
    confidence: 0.7,
  },
];

const GENERIC_SINGLE_WORDS = new Set(['big', 'hand', 'maid', 'adult', 'sex', 'sexual']);

export function assertKeywordRulesAreSafe(rules: readonly KeywordRule[]): void {
  for (const rule of rules) {
    const source = rule.pattern.source.replace(/\\b|\(\?:|\)|\?|\+|\*/gu, '').trim().toLowerCase();
    if (GENERIC_SINGLE_WORDS.has(source)) {
      throw new Error(`Generic single-word keyword rule is not allowed: ${rule.id}`);
    }
  }
}

export function evaluateKeywords(
  text: string,
  level: ProtectionLevel,
  rules: readonly KeywordRule[] = KEYWORD_RULES,
): KeywordMatch[] {
  const normalized = normalizeText(text);

  return rules
    .filter((rule) => rule.protectionLevels.includes(level))
    .filter((rule) => rule.pattern.test(normalized))
    .map((rule) => ({
      ruleId: rule.id,
      category: rule.category,
      riskWeight: rule.riskWeight,
      confidence: rule.confidence,
    }));
}
