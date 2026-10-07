import { describe, expect, it } from 'vitest';

import { normalizeHostname, normalizeText } from '../../../src/core/normalization/textNormalization';

describe('normalizeText', () => {
  it('should lowercase, decode URL encoding, remove accents and collapse separators', () => {
    expect(normalizeText('H%C3%A9NT%C3%A1i___Rule+34')).toBe('hentai rule 34');
  });

  it('should normalize full-width characters', () => {
    expect(normalizeText('Ｆｕｌｌ－Ｗｉｄｔｈ')).toBe('full width');
  });

  it('should handle long hostile input without catastrophic runtime', () => {
    const startedAt = performance.now();
    const output = normalizeText(`${'a%20'.repeat(5_000)}é_Ｂ`);
    const elapsed = performance.now() - startedAt;

    expect(output.endsWith('e b')).toBe(true);
    expect(elapsed).toBeLessThan(250);
  });
});

describe('normalizeHostname', () => {
  it('should normalize hostnames with casing, accents and full-width characters', () => {
    expect(normalizeHostname(' Éxample．TEST ')).toBe('example.test');
  });

  it('should reject invalid hostnames', () => {
    expect(normalizeHostname('https://example.test/path')).toBe('');
    expect(normalizeHostname('example..test')).toBe('example.test');
    expect(normalizeHostname('-example.test')).toBe('');
    expect(normalizeHostname('')).toBe('');
  });
});
