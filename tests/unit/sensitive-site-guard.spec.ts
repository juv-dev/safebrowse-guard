import { describe, expect, it } from "vitest";
import {
  classifySensitiveHost,
  type SensitiveSiteCategory,
} from "../../src/core/security/sensitiveSiteGuard";

const SEED_DOMAINS_BY_CATEGORY: Record<SensitiveSiteCategory, string> = {
  bank: "bankofamerica.com",
  financial: "fidelity.com",
  payment: "paypal.com",
  wallet: "coinbase.com",
  webmail: "mail.google.com",
  auth: "okta.com",
  "password-manager": "1password.com",
  government: "irs.gov",
  health: "mychart.com",
  tax: "turbotax.com",
  payroll: "adp.com",
  hr: "workday.com",
  "account-admin": "myaccount.google.com",
};

describe("classifySensitiveHost", () => {
  for (const [category, domain] of Object.entries(SEED_DOMAINS_BY_CATEGORY)) {
    it(`should classify ${domain} as ${category}`, () => {
      expect(classifySensitiveHost(domain)).toBe(category);
    });
  }

  it("should return null for an unrelated ordinary domain", () => {
    expect(classifySensitiveHost("github.com")).toBeNull();
  });

  it("should return null for another unrelated ordinary domain", () => {
    expect(classifySensitiveHost("example.com")).toBeNull();
  });

  it("should classify a generic .gov TLD as government", () => {
    expect(classifySensitiveHost("randomcity.gov")).toBe("government");
  });

  it("should normalize uppercase input before matching", () => {
    expect(classifySensitiveHost("PAYPAL.COM")).toBe("payment");
  });

  it("should normalize a leading www. before matching", () => {
    expect(classifySensitiveHost("www.paypal.com")).toBe("payment");
  });

  it("should normalize a trailing dot before matching", () => {
    expect(classifySensitiveHost("paypal.com.")).toBe("payment");
  });

  it("should match a subdomain of a seed domain", () => {
    expect(classifySensitiveHost("secure.chase.com")).toBe("bank");
  });
});
