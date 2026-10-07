import type { KeywordMatch } from './keywordGuard';

export interface KeywordDecision {
  decision: 'allow' | 'block' | 'unknown';
  riskScore: number;
  categories: string[];
  reasons: string[];
}

const EDUCATIONAL_CONTEXT = /\b(?:education|educational|medical|health|biology|news|research)\b/iu;

export function decideFromKeywordContext(text: string, matches: readonly KeywordMatch[]): KeywordDecision {
  const riskScore = matches.reduce((total, match) => total + match.riskWeight, 0);
  const categories = [...new Set(matches.map((match) => match.category))];

  if (matches.length === 0) {
    return { decision: 'unknown', riskScore: 0, categories: [], reasons: ['no-keyword-signal'] };
  }

  if (matches.length === 1 && riskScore < 60 && EDUCATIONAL_CONTEXT.test(text)) {
    return {
      decision: 'allow',
      riskScore,
      categories,
      reasons: ['single-low-risk-educational-context'],
    };
  }

  if (riskScore >= 70 || matches.some((match) => match.confidence >= 0.9 && match.riskWeight >= 70)) {
    return {
      decision: 'block',
      riskScore,
      categories,
      reasons: ['keyword-risk-threshold-met'],
    };
  }

  return {
    decision: 'unknown',
    riskScore,
    categories,
    reasons: ['keyword-signal-insufficient'],
  };
}
