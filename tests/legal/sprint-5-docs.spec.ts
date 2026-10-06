import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

async function readText(path: string): Promise<string> {
  return readFile(path, 'utf8');
}

describe('Sprint 5 legal and research documents', () => {
  it('should state that account and email data are not sold or shared for advertising', async () => {
    const policy = await readText('docs/legal/PRIVACY_POLICY.md');

    expect(policy).toContain('does not sell account data, email addresses');
    expect(policy).toContain('does not share account data, email addresses');
    expect(policy).toContain('for advertising, ad targeting, cross-context behavioral advertising');
  });

  it('should keep Utah, Louisiana and Texas in legal counsel required status', async () => {
    const research = await readText('docs/legal/APP_STORE_ACCOUNTABILITY_ACTS.md');

    expect(research).toContain('| Utah | LEGAL COUNSEL REQUIRED |');
    expect(research).toContain('| Louisiana | LEGAL COUNSEL REQUIRED |');
    expect(research).toContain('| Texas | LEGAL COUNSEL REQUIRED |');
  });

  it('should require real Bitdefender coexistence evidence before compatibility claims', async () => {
    const plan = await readText('docs/BITDEFENDER_COHABITATION.md');

    expect(plan).toContain('REQUIRES REAL DEVICE TESTING');
    expect(plan).toContain('Do not claim that SafeBrowse Guard is compatible with Bitdefender Total Security');
    expect(plan).toContain('Windows Filtering Platform');
    expect(plan).toContain('Network Extension content filter');
  });
});
