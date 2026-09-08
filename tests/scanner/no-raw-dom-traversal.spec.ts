import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const srcRoot = fileURLToPath(new URL('../../src', import.meta.url));

const allowlist = ['core/privacy/privacyBoundary.ts', 'core/scanner/safeDomScanner.ts'];

const forbiddenPatterns: Array<{ label: string; regex: RegExp }> = [
  { label: 'querySelector / querySelectorAll', regex: /\.querySelector(All)?\s*\(/ },
  { label: 'getElementsByTagName / ClassName / Name', regex: /\.getElementsBy(TagName|ClassName|Name)\s*\(/ },
  { label: 'TreeWalker / NodeIterator', regex: /\.create(TreeWalker|NodeIterator)\s*\(/ },
  {
    label: 'child traversal',
    regex: /\.(childNodes|children|firstChild|firstElementChild|lastChild|lastElementChild)\b/,
  },
  {
    label: 'sibling traversal',
    regex: /\.(nextSibling|nextElementSibling|previousSibling|previousElementSibling)\b/,
  },
];

function collectSourceFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('DOM traversal isolation', () => {
  it('should route every DOM walk through getSafeScanRoot', () => {
    const violations: string[] = [];

    for (const file of collectSourceFiles(srcRoot)) {
      const relativePath = relative(srcRoot, file).split('\\').join('/');
      if (allowlist.includes(relativePath)) {
        continue;
      }

      const lines = readFileSync(file, 'utf8').split(/\r?\n/);
      lines.forEach((line, index) => {
        for (const pattern of forbiddenPatterns) {
          if (pattern.regex.test(line)) {
            violations.push(`${relativePath}:${String(index + 1)} -> ${pattern.label}`);
          }
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('should keep safeDomScanner as the only sanctioned traversal helper', () => {
    const scanner = join(srcRoot, 'core', 'scanner', 'safeDomScanner.ts');
    const source = readFileSync(scanner, 'utf8');

    expect(source).toMatch(/getSafeScanRoot/);
    expect(source).toMatch(/from '\.\.\/privacy\/privacyBoundary'/);
  });
});
