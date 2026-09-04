import { describe, expect, it } from "vitest";
import { normalizeHostname, normalizeText } from "../../src/core/normalization/textNormalization";

describe("normalizeText", () => {
  it("should collapse full-width Unicode characters via NFKC", () => {
    expect(normalizeText("ＡＢＣ")).toBe("abc");
  });

  it("should collapse full-width digits via NFKC", () => {
    expect(normalizeText("１２３")).toBe("123");
  });

  it("should lowercase the input", () => {
    expect(normalizeText("HELLO World")).toBe("hello world");
  });

  it("should strip an acute accent from e", () => {
    expect(normalizeText("café")).toBe("cafe");
  });

  it("should strip a tilde from n", () => {
    expect(normalizeText("ñoño")).toBe("nono");
  });

  it("should strip an umlaut from u", () => {
    expect(normalizeText("güey")).toBe("guey");
  });

  it("should collapse runs of whitespace into a single space", () => {
    expect(normalizeText("hello    world\n\t  again")).toBe("hello world again");
  });

  it("should trim leading and trailing whitespace", () => {
    expect(normalizeText("   padded text   ")).toBe("padded text");
  });

  it("should normalize an underscore between word characters into a space", () => {
    expect(normalizeText("sex_video")).toBe("sex video");
  });

  it("should normalize a dash between word characters into a space", () => {
    expect(normalizeText("sex-video")).toBe("sex video");
  });

  it("should normalize a plus sign between word characters into a space", () => {
    expect(normalizeText("sex+video")).toBe("sex video");
  });

  it("should not strip a leading dash that is not between two word characters", () => {
    expect(normalizeText("-hello")).toBe("-hello");
  });

  it("should URL-decode percent-encoded input", () => {
    expect(normalizeText("sex%20video")).toBe("sex video");
  });

  it("should apply separator normalization to a URL-decoded separator", () => {
    expect(normalizeText("sex%5Fvideo")).toBe("sex video");
  });

  it("should not throw on malformed percent-encoding and should return a usable string", () => {
    expect(() => normalizeText("discount 100%")).not.toThrow();
    expect(normalizeText("discount 100%")).toBe("discount 100%");
  });

  it("should not throw on a lone surrogate code unit", () => {
    expect(() => normalizeText("abc\uD800def")).not.toThrow();
  });

  it("should not throw on embedded null bytes", () => {
    expect(() => normalizeText(`abc${String.fromCharCode(0)}def`)).not.toThrow();
  });

  it("should complete within a reasonable time on a pathological-length input", () => {
    const pathologicalInput = `${"a-b_c+d ".repeat(12500)}${"%zz".repeat(1000)}`;
    const start = Date.now();
    expect(() => normalizeText(pathologicalInput)).not.toThrow();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(500);
  });
});

describe("normalizeHostname", () => {
  it("should lowercase uppercase input", () => {
    expect(normalizeHostname("EXAMPLE.COM")).toBe("example.com");
  });

  it("should strip a leading www.", () => {
    expect(normalizeHostname("www.example.com")).toBe("example.com");
  });

  it("should strip a trailing dot", () => {
    expect(normalizeHostname("example.com.")).toBe("example.com");
  });

  it("should trim surrounding whitespace", () => {
    expect(normalizeHostname("  example.com  ")).toBe("example.com");
  });
});
