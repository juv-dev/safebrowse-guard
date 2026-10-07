export interface DomainListMetadata {
  source: string;
  license: string;
  version: string;
  sha256: string;
  attribution: string;
}

export const PRELOADED_ADULT_DOMAIN_METADATA: DomainListMetadata = {
  source: 'SafeBrowse Guard curated development fixture list',
  license: 'Project test fixture only; replace with reviewed public source before production use',
  version: '2026-10-07',
  sha256: 'sha256:2f6baf8b8bd04e80e41a05dfdf6f6ca2f73f2f1a68a957516a476e31c8b2f424',
  attribution: 'Internal fixtures derived from non-resolving example hostnames for deterministic tests.',
};

export const PRELOADED_ADULT_DOMAINS = [
  'adult-example.test',
  'explicit-example.test',
  'hentai-example.test',
  'rule34-example.test',
] as const;
