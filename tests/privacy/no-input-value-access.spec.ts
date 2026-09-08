import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const srcRoot = fileURLToPath(new URL('../../src', import.meta.url));

const allowlist: string[] = [];

const forbiddenPatterns: Array<{ label: string; regex: RegExp }> = [
  { label: 'reads .value from a DOM node', regex: /\.value\b/ },
  { label: 'constructs or reads FormData', regex: /\bFormData\b/ },
  { label: 'reads HTMLFormElement.elements', regex: /\.elements\b/ },
  {
    label: 'registers a keyboard or clipboard listener',
    regex: /addEventListener\(\s*['"`](keydown|keyup|keypress|beforeinput|input|paste|copy|cut)['"`]/,
  },
  {
    label: 'assigns a keyboard or clipboard handler',
    regex: /\b(onkeydown|onkeyup|onkeypress|onbeforeinput|oninput|onpaste|oncopy|oncut)\s*=/,
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

describe('form field and input event isolation', () => {
  it('should not let any module read form field values or listen to typing', () => {
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
});
