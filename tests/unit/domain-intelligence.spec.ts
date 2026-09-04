import { describe, expect, it } from "vitest";
import { classifyDomain } from "../../src/core/domain-intelligence/domainIntelligence";

describe("classifyDomain", () => {
  it("should block a known pornography domain", () => {
    const result = classifyDomain("pornhub.com");
    expect(result).toEqual({ blocked: true, category: "pornography", matchedDomain: "pornhub.com" });
  });

  it("should block a known cam-platform domain", () => {
    const result = classifyDomain("chaturbate.com");
    expect(result).toEqual({ blocked: true, category: "cam-platform", matchedDomain: "chaturbate.com" });
  });

  it("should block a known adult-platform domain", () => {
    const result = classifyDomain("onlyfans.com");
    expect(result).toEqual({ blocked: true, category: "adult-platform", matchedDomain: "onlyfans.com" });
  });

  it("should block a known imageboard-adult domain", () => {
    const result = classifyDomain("rule34.xxx");
    expect(result).toEqual({ blocked: true, category: "imageboard-adult", matchedDomain: "rule34.xxx" });
  });

  it("should block a known hentai domain", () => {
    const result = classifyDomain("nhentai.net");
    expect(result).toEqual({ blocked: true, category: "hentai", matchedDomain: "nhentai.net" });
  });

  it("should block a subdomain of a seed domain", () => {
    const result = classifyDomain("es.pornhub.com");
    expect(result).toEqual({ blocked: true, category: "pornography", matchedDomain: "pornhub.com" });
  });

  it("should block a www-prefixed variant of a seed domain", () => {
    const result = classifyDomain("www.pornhub.com");
    expect(result).toEqual({ blocked: true, category: "pornography", matchedDomain: "pornhub.com" });
  });

  it("should apply hostname normalization for an uppercase variant", () => {
    const result = classifyDomain("PORNHUB.COM");
    expect(result).toEqual({ blocked: true, category: "pornography", matchedDomain: "pornhub.com" });
  });

  it("should apply hostname normalization for a trailing dot variant", () => {
    const result = classifyDomain("pornhub.com.");
    expect(result).toEqual({ blocked: true, category: "pornography", matchedDomain: "pornhub.com" });
  });

  it("should not block an ordinary safe domain", () => {
    expect(classifyDomain("github.com")).toEqual({ blocked: false });
  });

  it("should not block another ordinary safe domain", () => {
    expect(classifyDomain("wikipedia.org")).toEqual({ blocked: false });
  });

  it("should not block a domain that merely contains a seed domain as a substring", () => {
    expect(classifyDomain("notpornhub.com")).toEqual({ blocked: false });
  });
});
