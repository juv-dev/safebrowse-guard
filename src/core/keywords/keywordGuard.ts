import { normalizeText } from "../normalization/textNormalization";
import type { KeywordLocation, KeywordMatch, KeywordRule, ProtectionLevel } from "./types";

const WORD_CHARACTER_PATTERN = /[\p{L}\p{N}]/u;

function isWordCharacter(character: string | undefined): boolean {
  return character !== undefined && WORD_CHARACTER_PATTERN.test(character);
}

function hasWordBoundaryMatch(normalizedText: string, normalizedPattern: string): boolean {
  if (normalizedPattern.length === 0) {
    return false;
  }
  let searchStartIndex = 0;
  while (searchStartIndex <= normalizedText.length) {
    const matchIndex = normalizedText.indexOf(normalizedPattern, searchStartIndex);
    if (matchIndex === -1) {
      return false;
    }
    const beforeCharacter = normalizedText[matchIndex - 1];
    const afterCharacter = normalizedText[matchIndex + normalizedPattern.length];
    if (!isWordCharacter(beforeCharacter) && !isWordCharacter(afterCharacter)) {
      return true;
    }
    searchStartIndex = matchIndex + 1;
  }
  return false;
}

function ruleAppliesTo(rule: KeywordRule, location: KeywordLocation, protectionLevel: ProtectionLevel): boolean {
  return rule.locations.includes(location) && rule.protectionLevels.includes(protectionLevel);
}

export function matchKeywords(
  text: string,
  location: KeywordLocation,
  protectionLevel: ProtectionLevel,
  rules: readonly KeywordRule[],
): KeywordMatch[] {
  const normalizedText = normalizeText(text);
  const matches: KeywordMatch[] = [];
  for (const rule of rules) {
    if (!ruleAppliesTo(rule, location, protectionLevel)) {
      continue;
    }
    const normalizedPattern = normalizeText(rule.pattern);
    if (hasWordBoundaryMatch(normalizedText, normalizedPattern)) {
      matches.push({ rule, matchedText: normalizedPattern, location });
    }
  }
  return matches;
}
