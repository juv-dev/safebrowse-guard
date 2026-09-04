export type SensitiveSiteCategory =
  | "bank"
  | "financial"
  | "payment"
  | "wallet"
  | "webmail"
  | "auth"
  | "password-manager"
  | "government"
  | "health"
  | "tax"
  | "payroll"
  | "hr"
  | "account-admin";

interface SensitiveSitePattern {
  readonly category: SensitiveSiteCategory;
  readonly hosts: readonly string[];
}

const SENSITIVE_SITE_PATTERNS: readonly SensitiveSitePattern[] = [
  {
    category: "bank",
    hosts: ["bankofamerica.com", "chase.com", "wellsfargo.com", "hsbc.com", "santander.com"],
  },
  {
    category: "financial",
    hosts: ["fidelity.com", "vanguard.com", "schwab.com", "etrade.com"],
  },
  {
    category: "payment",
    hosts: ["paypal.com", "stripe.com", "squareup.com", "venmo.com"],
  },
  {
    category: "wallet",
    hosts: ["coinbase.com", "binance.com", "blockchain.com", "metamask.io"],
  },
  {
    category: "webmail",
    hosts: ["mail.google.com", "outlook.com", "mail.yahoo.com", "protonmail.com"],
  },
  {
    category: "auth",
    hosts: ["accounts.google.com", "login.microsoftonline.com", "okta.com", "auth0.com"],
  },
  {
    category: "password-manager",
    hosts: ["1password.com", "lastpass.com", "bitwarden.com", "dashlane.com"],
  },
  {
    category: "government",
    hosts: ["irs.gov", "usa.gov", "ssa.gov", "gov.uk"],
  },
  {
    category: "health",
    hosts: ["mychart.com", "cvs.com", "webmd.com", "nhs.uk"],
  },
  {
    category: "tax",
    hosts: ["turbotax.com", "hrblock.com", "taxact.com"],
  },
  {
    category: "payroll",
    hosts: ["adp.com", "gusto.com", "paychex.com"],
  },
  {
    category: "hr",
    hosts: ["workday.com", "bamboohr.com", "successfactors.com"],
  },
  {
    category: "account-admin",
    hosts: ["myaccount.google.com", "account.microsoft.com", "appleid.apple.com"],
  },
];

function normalizeHostname(hostname: string): string {
  let normalized = hostname.trim().toLowerCase();
  if (normalized.endsWith(".")) {
    normalized = normalized.slice(0, -1);
  }
  if (normalized.startsWith("www.")) {
    normalized = normalized.slice(4);
  }
  return normalized;
}

function matchesHost(hostname: string, seed: string): boolean {
  return hostname === seed || hostname.endsWith(`.${seed}`);
}

function looksLikeGovernmentTld(hostname: string): boolean {
  return hostname.endsWith(".gov") || hostname.includes(".gov.");
}

export function classifySensitiveHost(hostname: string): SensitiveSiteCategory | null {
  const normalized = normalizeHostname(hostname);
  for (const pattern of SENSITIVE_SITE_PATTERNS) {
    if (pattern.hosts.some((seed) => matchesHost(normalized, seed))) {
      return pattern.category;
    }
  }
  if (looksLikeGovernmentTld(normalized)) {
    return "government";
  }
  return null;
}
