import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('account privacy documentation', () => {
  it('should document the allowed account registration and account status fields', async () => {
    const doc = await readFile('docs/ACCOUNT_PRIVACY.md', 'utf8');

    expect(doc).toContain('email');
    expect(doc).toContain('explicit consent completion flag');
    expect(doc).toContain('verified');
    expect(doc).toContain('entitlements');
    expect(doc).toContain('expiresAt');
  });

  it('should prohibit Protection Engine data in account services', async () => {
    const doc = await readFile('docs/ACCOUNT_PRIVACY.md', 'utf8');

    expect(doc).toContain('browsing history');
    expect(doc).toContain('full URL or hostname');
    expect(doc).toContain('classification result');
    expect(doc).toContain('account services must not import or receive Protection Engine inputs or outputs');
  });

  it('should document the three ordered uninstall authorization steps', async () => {
    const doc = await readFile('docs/ACCOUNT_PRIVACY.md', 'utf8');

    expect(doc).toContain('Start an uninstall or deactivation request');
    expect(doc).toContain('Acknowledge the protection loss warning');
    expect(doc).toContain('Confirm with the temporary password');
    expect(doc).toContain('one-use and expires');
  });
});
