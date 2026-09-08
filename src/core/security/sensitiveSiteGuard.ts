export const SENSITIVE_HOST_RULESET_VERSION = '2026-09-08';

const SENSITIVE_HOSTS_BY_CATEGORY: Record<string, readonly string[]> = {
  banking: [
    'chase.com',
    'bankofamerica.com',
    'wellsfargo.com',
    'citibank.com',
    'capitalone.com',
    'usbank.com',
    'pnc.com',
    'hsbc.com',
    'barclays.co.uk',
    'santander.com',
    'bbva.com',
    'viabcp.com',
    'bcp.com.pe',
    'interbank.pe',
    'scotiabank.com.pe',
    'bn.com.pe',
  ],
  health: [
    'healthcare.gov',
    'mychart.com',
    'kaiserpermanente.org',
    'cigna.com',
    'anthem.com',
    'uhc.com',
    'essalud.gob.pe',
    'minsa.gob.pe',
  ],
  government: [
    'irs.gov',
    'ssa.gov',
    'login.gov',
    'gov.uk',
    'service-public.fr',
    'gob.pe',
    'sunat.gob.pe',
    'reniec.gob.pe',
  ],
  webmail: [
    'mail.google.com',
    'outlook.live.com',
    'outlook.office.com',
    'outlook.office365.com',
    'mail.yahoo.com',
    'mail.aol.com',
    'mail.zoho.com',
    'gmx.com',
  ],
  passwordManager: [
    '1password.com',
    'bitwarden.com',
    'lastpass.com',
    'dashlane.com',
    'keepersecurity.com',
    'nordpass.com',
    'proton.me',
  ],
};

const SENSITIVE_HOST_RULES: readonly string[] = Object.values(SENSITIVE_HOSTS_BY_CATEGORY).flat();

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.+$/, '');
}

export function isSensitiveHost(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  if (normalized === '') {
    return false;
  }

  return SENSITIVE_HOST_RULES.some((rule) => normalized === rule || normalized.endsWith(`.${rule}`));
}
