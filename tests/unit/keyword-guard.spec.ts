import { describe, expect, it } from "vitest";
import { matchKeywords } from "../../src/core/keywords/keywordGuard";
import { ENGLISH_SEED_RULES } from "../../src/core/keywords/englishSeedRules";
import type { KeywordRule } from "../../src/core/keywords/types";

function buildRule(overrides: Partial<KeywordRule>): KeywordRule {
  return {
    id: "test-rule",
    pattern: "explicit sex scene",
    category: "explicit-sex",
    riskWeight: 90,
    language: "en",
    locations: ["body-text"],
    protectionLevels: ["normal"],
    confidence: 0.9,
    ...overrides,
  };
}

describe("matchKeywords", () => {
  it("should not match a rule that does not list the given location", () => {
    const rule = buildRule({ locations: ["title"] });
    const matches = matchKeywords("this contains explicit sex scene here", "body-text", "normal", [rule]);
    expect(matches).toEqual([]);
  });

  it("should match a rule when the given location is listed", () => {
    const rule = buildRule({ locations: ["body-text"] });
    const matches = matchKeywords("this contains explicit sex scene here", "body-text", "normal", [rule]);
    expect(matches).toHaveLength(1);
    expect(matches[0]?.rule).toBe(rule);
  });

  it("should not match a maximum-only rule under the normal protection level", () => {
    const rule = buildRule({ protectionLevels: ["maximum"] });
    const matches = matchKeywords("this contains explicit sex scene here", "body-text", "normal", [rule]);
    expect(matches).toEqual([]);
  });

  it("should match a maximum-only rule under the maximum protection level", () => {
    const rule = buildRule({ protectionLevels: ["maximum"] });
    const matches = matchKeywords("this contains explicit sex scene here", "body-text", "maximum", [rule]);
    expect(matches).toHaveLength(1);
  });

  it("should apply normalization for mixed case input before matching", () => {
    const rule = buildRule({ pattern: "explicit sex scene" });
    const matches = matchKeywords("Watch this EXPLICIT Sex Scene now", "body-text", "normal", [rule]);
    expect(matches).toHaveLength(1);
  });

  it("should apply normalization for accented input before matching", () => {
    const rule = buildRule({ pattern: "erotic massage video" });
    const matches = matchKeywords("an érôtîc mässage vidéo posted here", "body-text", "normal", [rule]);
    expect(matches).toHaveLength(1);
  });

  it("should apply normalization for separator-evasion variants before matching", () => {
    const rule = buildRule({ pattern: "explicit sex scene" });
    const matches = matchKeywords("this is explicit_sex-scene content", "body-text", "normal", [rule]);
    expect(matches).toHaveLength(1);
  });

  it("should not match a pattern embedded inside a larger unrelated word", () => {
    const rule = buildRule({ pattern: "sex" });
    const matches = matchKeywords("this article discusses middlesex county history", "body-text", "normal", [rule]);
    expect(matches).toEqual([]);
  });

  it("should return an empty array when no rule matches", () => {
    const rule = buildRule({ pattern: "explicit sex scene" });
    const matches = matchKeywords("a friendly neighborhood bakery", "body-text", "normal", [rule]);
    expect(matches).toEqual([]);
  });

  it("should not flag educational content that merely uses the word sexual", () => {
    const matches = matchKeywords(
      "this article covers sexual education for teenagers",
      "body-text",
      "normal",
      ENGLISH_SEED_RULES,
    );
    expect(matches).toEqual([]);
  });

  it("should flag content containing a specific explicit multi-word phrase", () => {
    const matches = matchKeywords(
      "watch explicit XXX sexual videos here",
      "body-text",
      "normal",
      ENGLISH_SEED_RULES,
    );
    expect(matches.length).toBeGreaterThan(0);
  });

  it("should never define a single generic word as a standalone pattern in the English seed rules", () => {
    for (const rule of ENGLISH_SEED_RULES) {
      expect(rule.pattern.trim()).toContain(" ");
    }
  });
});
