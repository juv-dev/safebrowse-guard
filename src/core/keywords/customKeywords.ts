import { normalizeText } from '../normalization/textNormalization';

export interface CustomKeywordEntry {
  pattern: string;
  type: 'block' | 'allow';
  createdAt: string;
}

export type CustomKeywordValidation =
  | { ok: true; entry: CustomKeywordEntry }
  | { ok: false; reason: 'empty-pattern' | 'pattern-too-long' | 'unsafe-pattern' };

const UNSAFE_REGEX_SHAPES = [
  /\([^)]*[+*][^)]*\)[+*]/u,
  /\([^)]*\|[^)]*\)[+*]/u,
  /\[[^\]]+\][+*]\{\d+,?\d*\}/u,
];

function isUnsafePattern(pattern: string): boolean {
  return UNSAFE_REGEX_SHAPES.some((shape) => shape.test(pattern));
}

export function createCustomKeywordEntry(
  pattern: string,
  type: 'block' | 'allow',
  createdAt: string,
): CustomKeywordValidation {
  const normalizedPattern = normalizeText(pattern);

  if (normalizedPattern.length === 0) {
    return { ok: false, reason: 'empty-pattern' };
  }

  if (normalizedPattern.length > 120) {
    return { ok: false, reason: 'pattern-too-long' };
  }

  if (isUnsafePattern(pattern) || isUnsafePattern(normalizedPattern)) {
    return { ok: false, reason: 'unsafe-pattern' };
  }

  return {
    ok: true,
    entry: {
      pattern: normalizedPattern,
      type,
      createdAt,
    },
  };
}

export function evaluateCustomKeywords(text: string, entries: readonly CustomKeywordEntry[]): CustomKeywordEntry[] {
  const normalizedText = normalizeText(text);
  return entries.filter((entry) => normalizedText.includes(entry.pattern));
}
