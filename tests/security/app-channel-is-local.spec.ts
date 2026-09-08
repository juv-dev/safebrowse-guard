import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const channelRoot = fileURLToPath(new URL('../../src/core/app-channel', import.meta.url));

const forbiddenPatterns: Array<{ label: string; regex: RegExp }> = [
  { label: 'network fetch', regex: /\bfetch\s*\(/ },
  { label: 'WebSocket', regex: /\bWebSocket\b/ },
  { label: 'XMLHttpRequest', regex: /\bXMLHttpRequest\b/ },
  { label: 'EventSource', regex: /\bEventSource\b/ },
  { label: 'navigator.sendBeacon', regex: /\bsendBeacon\b/ },
  { label: 'an http/https/ws URL', regex: /\b(?:https?|wss?):\/\// },
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

describe('app channel is local-only', () => {
  it('should never open a network connection from the app channel', () => {
    const violations: string[] = [];

    for (const file of collectSourceFiles(channelRoot)) {
      const relativePath = relative(channelRoot, file).split('\\').join('/');
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

  it('should keep at least the app classification client under the channel folder', () => {
    expect(collectSourceFiles(channelRoot).length).toBeGreaterThan(0);
  });
});
