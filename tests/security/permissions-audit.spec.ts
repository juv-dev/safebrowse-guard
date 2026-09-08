import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const buildScript = readFileSync(
  fileURLToPath(new URL('../../scripts/build-extension.mjs', import.meta.url)),
  'utf8',
);
const auditDoc = readFileSync(
  fileURLToPath(new URL('../../docs/PERMISSIONS_AUDIT.md', import.meta.url)),
  'utf8',
);

const SENSITIVE_PERMISSIONS = [
  'cookies',
  'history',
  'identity',
  'clipboardRead',
  'clipboardWrite',
  'downloads',
  'management',
  'webRequestBlocking',
];

function declaredPermissions(source: string): string[] {
  const found = new Set<string>();
  for (const key of ['permissions', 'optional_permissions', 'host_permissions']) {
    const match = new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`).exec(source);
    const body = match?.[1];
    if (body === undefined) {
      continue;
    }
    for (const raw of body.split(',')) {
      const value = raw.trim().replace(/^['"]|['"]$/g, '');
      if (value !== '') {
        found.add(value);
      }
    }
  }
  return [...found];
}

function auditedIdentifiers(doc: string): Set<string> {
  const ids = new Set<string>();
  for (const match of doc.matchAll(/^###\s+`([^`]+)`/gm)) {
    const id = match[1];
    if (id !== undefined) {
      ids.add(id);
    }
  }
  return ids;
}

function isJustified(doc: string, permission: string): boolean {
  const section = new RegExp(`###\\s+\`${permission}\`([\\s\\S]*?)(?=\\n### |$)`).exec(doc);
  return section?.[1]?.includes('JUSTIFICADO') ?? false;
}

const declared = declaredPermissions(buildScript);
const audited = auditedIdentifiers(auditDoc);

describe('permissions audit', () => {
  it('should keep the manifest at the minimal known permission set', () => {
    expect(declared.sort()).toEqual(['storage', 'tabs']);
  });

  it('should back every declared permission with an audit entry', () => {
    for (const permission of declared) {
      expect(audited.has(permission), `missing audit entry for "${permission}"`).toBe(true);
    }
  });

  it.each(SENSITIVE_PERMISSIONS)('should not declare "%s" without an explicit justification', (permission) => {
    const present = declared.includes(permission);

    expect(present && !isJustified(auditDoc, permission)).toBe(false);
  });

  it.each(SENSITIVE_PERMISSIONS)('should address "%s" explicitly in the audit doc', (permission) => {
    expect(auditDoc).toContain(permission);
  });

  it('should analyse <all_urls> and justify it whenever the manifest requests it', () => {
    expect(auditDoc).toMatch(/all_urls/i);

    if (/<all_urls>/.test(buildScript)) {
      expect(/all_urls[\s\S]*JUSTIFICAC/i.test(auditDoc)).toBe(true);
    }
  });
});
