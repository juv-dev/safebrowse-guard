export interface HostSample {
  category: string;
  hostname: string;
}

export const sensitiveHostSamples: HostSample[] = [
  { category: 'banking', hostname: 'chase.com' },
  { category: 'banking', hostname: 'secure.bankofamerica.com' },
  { category: 'banking', hostname: 'www.viabcp.com' },
  { category: 'banking', hostname: 'bcp.com.pe' },
  { category: 'health', hostname: 'mychart.com' },
  { category: 'health', hostname: 'portal.essalud.gob.pe' },
  { category: 'government', hostname: 'www.irs.gov' },
  { category: 'government', hostname: 'sunat.gob.pe' },
  { category: 'webmail', hostname: 'mail.google.com' },
  { category: 'webmail', hostname: 'outlook.office.com' },
  { category: 'passwordManager', hostname: 'vault.bitwarden.com' },
  { category: 'passwordManager', hostname: 'account.proton.me' },
];

export const nonSensitiveHostSamples: string[] = [
  'example.com',
  'news.ycombinator.com',
  'en.wikipedia.org',
  'github.com',
  'www.google.com',
  'blog.cloudflare.com',
  'notchase.com',
  'chase.com.evil.example',
];
