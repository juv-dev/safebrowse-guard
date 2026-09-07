import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const srcRoot = fileURLToPath(new URL('../../src', import.meta.url));
const adapterRoot = join(srcRoot, 'browser');

const forbiddenPatterns: Array<{ label: string; regex: RegExp }> = [
  { label: 'direct chrome.* access', regex: /\bchrome\s*\./ },
  { label: 'direct browser.* access', regex: /\bbrowser\s*\./ },
  { label: "import of 'webextension-polyfill'", regex: /from\s+['"]webextension-polyfill['"]/ },
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

function isInsideAdapters(file: string): boolean {
  return file === adapterRoot || file.startsWith(adapterRoot + sep);
}

describe('WebExtension API isolation', () => {
  it('should not reference chrome.* or browser.* outside src/browser', () => {
    const violations: string[] = [];

    for (const file of collectSourceFiles(srcRoot)) {
      if (isInsideAdapters(file)) {
        continue;
      }
      const lines = readFileSync(file, 'utf8').split(/\r?\n/);
      lines.forEach((line, index) => {
        for (const pattern of forbiddenPatterns) {
          if (pattern.regex.test(line)) {
            violations.push(`${relative(srcRoot, file)}:${String(index + 1)} -> ${pattern.label}`);
          }
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('should still guard at least the browser entry points inside src/browser', () => {
    const adapterFiles = collectSourceFiles(adapterRoot).map((file) => relative(srcRoot, file));

    expect(adapterFiles.length).toBeGreaterThan(0);
  });
});
