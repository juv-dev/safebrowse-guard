import { describe, expect, it } from "vitest";
import {
  assertNoForbiddenData,
  containsForbiddenData,
  looksLikeCreditCard,
  looksLikeEmail,
  looksLikeIban,
  looksLikeJwt,
  looksLikeSecretMarker,
} from "../../src/core/privacy/privacyBoundary";

const VALID_VISA_TEST_NUMBER = "4111111111111111";
const CANARY_EMAIL = "test-private@example.invalid";
const CANARY_SECRET = "SUPER_PRIVATE_PASSWORD_123";
const JWT_FIXTURE =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
const IBAN_FIXTURE = "DE89370400440532013000";

describe("looksLikeCreditCard", () => {
  it("should detect a Luhn-valid card number without separators", () => {
    expect(looksLikeCreditCard(VALID_VISA_TEST_NUMBER)).toBe(true);
  });

  it("should detect a Luhn-valid card number with spaces and dashes", () => {
    expect(looksLikeCreditCard("4111-1111-1111-1111")).toBe(true);
  });

  it("should not flag a Luhn-invalid long digit sequence", () => {
    expect(looksLikeCreditCard("1234567890123456")).toBe(false);
  });

  it("should not flag ordinary short numbers", () => {
    expect(looksLikeCreditCard("2024")).toBe(false);
  });
});

describe("looksLikeJwt", () => {
  it("should detect a JWT-shaped token", () => {
    expect(looksLikeJwt(JWT_FIXTURE)).toBe(true);
  });

  it("should not flag a plain sentence", () => {
    expect(looksLikeJwt("this is not a token at all")).toBe(false);
  });
});

describe("looksLikeSecretMarker", () => {
  it("should detect the SUPER_PRIVATE_PASSWORD_123 canary", () => {
    expect(looksLikeSecretMarker(CANARY_SECRET)).toBe(true);
  });

  it("should detect lowercase secret markers", () => {
    expect(looksLikeSecretMarker("my api_key value")).toBe(true);
  });

  it("should not flag unrelated text", () => {
    expect(looksLikeSecretMarker("One Piece is a great anime")).toBe(false);
  });
});

describe("looksLikeEmail", () => {
  it("should detect the test-private canary email", () => {
    expect(looksLikeEmail(CANARY_EMAIL)).toBe(true);
  });

  it("should not flag a plain product description", () => {
    expect(looksLikeEmail("One Piece is an action anime series")).toBe(false);
  });
});

describe("looksLikeIban", () => {
  it("should detect an IBAN-shaped fixture", () => {
    expect(looksLikeIban(IBAN_FIXTURE)).toBe(true);
  });

  it("should not flag a plain genre string", () => {
    expect(looksLikeIban("Action")).toBe(false);
  });
});

describe("containsForbiddenData", () => {
  it("should catch the email canary nested inside an object", () => {
    expect(containsForbiddenData({ contact: { email: CANARY_EMAIL } })).toBe(true);
  });

  it("should catch the secret canary nested inside an array", () => {
    expect(containsForbiddenData(["safe", { note: CANARY_SECRET }])).toBe(true);
  });

  it("should catch a Luhn-valid card number nested deeply", () => {
    expect(
      containsForbiddenData({ payment: { history: [{ card: VALID_VISA_TEST_NUMBER }] } }),
    ).toBe(true);
  });

  it("should catch a JWT-shaped token nested inside an object", () => {
    expect(containsForbiddenData({ session: { token: JWT_FIXTURE } })).toBe(true);
  });

  it("should catch an IBAN-shaped value nested inside an array", () => {
    expect(containsForbiddenData([{ account: IBAN_FIXTURE }])).toBe(true);
  });

  it("should not flag an ordinary product description string", () => {
    expect(containsForbiddenData("A thrilling anime about pirates and adventure")).toBe(false);
  });

  it("should not flag an ordinary plain object", () => {
    expect(containsForbiddenData({ title: "One Piece", genre: "Action" })).toBe(false);
  });

  it("should not flag numbers, booleans, and null", () => {
    expect(containsForbiddenData({ count: 12, active: true, note: null })).toBe(false);
  });
});

describe("assertNoForbiddenData", () => {
  it("should not throw for safe data", () => {
    expect(() => {
      assertNoForbiddenData({ title: "One Piece", genre: "Action" });
    }).not.toThrow();
  });

  it("should throw for forbidden data", () => {
    expect(() => {
      assertNoForbiddenData({ email: CANARY_EMAIL });
    }).toThrow();
  });

  it("should include the given context in the error message without leaking the match", () => {
    expect(() => {
      assertNoForbiddenData({ email: CANARY_EMAIL }, "classification result");
    }).toThrow(/classification result/);
  });

  it("should not leak the matched forbidden substring in the error message", () => {
    try {
      assertNoForbiddenData({ email: CANARY_EMAIL }, "classification result");
      throw new Error("expected assertNoForbiddenData to throw");
    } catch (error) {
      expect((error as Error).message).not.toContain(CANARY_EMAIL);
    }
  });
});
