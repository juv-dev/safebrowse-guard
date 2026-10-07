import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { PRELOADED_ADULT_DOMAIN_METADATA } from '../../src/core/domain-intelligence/preloadedAdultDomains';

describe('domain list documentation', () => {
  it('should document the fixture metadata embedded in code', async () => {
    const doc = await readFile('docs/DOMAIN_LISTS.md', 'utf8');

    expect(doc).toContain(PRELOADED_ADULT_DOMAIN_METADATA.source);
    expect(doc).toContain(PRELOADED_ADULT_DOMAIN_METADATA.license);
    expect(doc).toContain(PRELOADED_ADULT_DOMAIN_METADATA.version);
    expect(doc).toContain(PRELOADED_ADULT_DOMAIN_METADATA.sha256);
    expect(doc).toContain(PRELOADED_ADULT_DOMAIN_METADATA.attribution);
  });

  it('should forbid runtime remote rule execution', async () => {
    const doc = await readFile('docs/DOMAIN_LISTS.md', 'utf8');

    expect(doc).toContain('Runtime code must not download remote rules or execute remote code');
    expect(doc).toContain('embedded at build time');
  });
});
