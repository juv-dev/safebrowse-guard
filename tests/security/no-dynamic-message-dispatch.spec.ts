import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const srcRoot = fileURLToPath(new URL('../../src', import.meta.url));

const forbiddenPatterns: Array<{ label: string; regex: RegExp }> = [
  { label: 'reads an .action field off a message', regex: /\b(message|msg|raw)\.action\b/ },
  {
    label: 'invokes a handler keyed by a message-derived name',
    regex: /\[\s*(message|msg|raw)\.[A-Za-z_$][\w$]*\s*\]\s*\(/,
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

describe('message dispatch safety', () => {
  it('should never dispatch a function by a name taken from the message', () => {
    const violations: string[] = [];

    for (const file of collectSourceFiles(srcRoot)) {
      const relativePath = relative(srcRoot, file).split('\\').join('/');
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
