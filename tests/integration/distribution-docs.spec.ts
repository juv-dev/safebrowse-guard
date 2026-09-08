import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const distributionDoc = readFileSync(
  fileURLToPath(new URL('../../docs/DISTRIBUTION.md', import.meta.url)),
  'utf8',
);
const readme = readFileSync(fileURLToPath(new URL('../../README.md', import.meta.url)), 'utf8');

describe('single-package distribution docs', () => {
  it('should state the single-package principle and the no-standalone rule', () => {
    expect(distributionDoc).toMatch(/un solo producto/i);
    expect(distributionDoc).toMatch(/no se (descarga|instala).*por separado/is);
    expect(distributionDoc).toMatch(/Chrome Web Store/);
    expect(distributionDoc).toMatch(/addons\.mozilla\.org|AMO/);
    expect(distributionDoc).toMatch(/no hay.*listado\s+independiente/is);
  });

  it('should cover browser detection and per-OS registration for desktop', () => {
    for (const os of ['Windows', 'macOS', 'Linux']) {
      expect(distributionDoc).toContain(os);
    }
    expect(distributionDoc).toMatch(/Chromium/);
    expect(distributionDoc).toMatch(/Firefox/);
    expect(distributionDoc).toMatch(/External Extensions|external_extensions/);
    expect(distributionDoc).toMatch(/policies\.json|ExtensionSettings/);
  });

  it('should cover the mobile instructions / deep-link path', () => {
    expect(distributionDoc).toMatch(/Android/);
    expect(distributionDoc).toMatch(/iOS/);
    expect(distributionDoc).toMatch(/deep-link/i);
  });

  it('should make the README point at the distribution doc and repeat the no-standalone rule', () => {
    expect(readme).toContain('docs/DISTRIBUTION.md');
    expect(readme).toMatch(/un solo producto/i);
    expect(readme).toMatch(/no se (descarga|instala).*por separado/is);
    expect(readme).toMatch(/no existe.*listado\s+independiente/is);
  });
});
