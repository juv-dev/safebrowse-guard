export type KeywordCategory =
  | "pornography"
  | "explicit-sex"
  | "nudity"
  | "erotic"
  | "sexualized-content"
  | "hentai"
  | "ecchi"
  | "rule34"
  | "adult-content"
  | "uncensored"
  | "nsfw"
  | "explicit-images"
  | "explicit-video";

export type ProtectionLevel = "normal" | "strict" | "maximum";

export type KeywordLocation = "title" | "url-path" | "meta-description" | "og-metadata" | "tags" | "body-text";

export interface KeywordRule {
  readonly id: string;
  readonly pattern: string;
  readonly category: KeywordCategory;
  readonly riskWeight: number;
  readonly language: string;
  readonly locations: readonly KeywordLocation[];
  readonly protectionLevels: readonly ProtectionLevel[];
  readonly confidence: number;
}

export interface KeywordMatch {
  readonly rule: KeywordRule;
  readonly matchedText: string;
  readonly location: KeywordLocation;
}
