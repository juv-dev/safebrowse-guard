import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vitest';

const rootDir = fileURLToPath(new URL('../../', import.meta.url));
const scriptPath = join(rootDir, 'scripts', 'build-extension.mjs');
const distDir = join(rootDir, 'dist');

function readManifest(target: string): Record<string, unknown> {
  const raw = readFileSync(join(distDir, target, 'manifest.json'), 'utf8');
  return JSON.parse(raw) as Record<string, unknown>;
}

describe('build-extension script', () => {
  beforeAll(() => {
    rmSync(distDir, { recursive: true, force: true });
    execFileSync(process.execPath, [scriptPath], { cwd: rootDir, stdio: 'pipe' });
  }, 120_000);

  it('should emit a bundled chrome MV3 artifact', () => {
    expect(existsSync(join(distDir, 'chrome', 'background.js'))).toBe(true);

    const manifest = readManifest('chrome');
    expect(manifest['manifest_version']).toBe(3);
    expect(manifest['background']).toEqual({ service_worker: 'background.js' });

    const bundle = readFileSync(join(distDir, 'chrome', 'background.js'), 'utf8');
    expect(bundle.length).toBeGreaterThan(0);
  });

  it('should emit a bundled firefox MV3 artifact with gecko settings', () => {
    expect(existsSync(join(distDir, 'firefox', 'background.js'))).toBe(true);

    const manifest = readManifest('firefox');
    expect(manifest['manifest_version']).toBe(3);
    expect(manifest['background']).toEqual({ scripts: ['background.js'] });
    expect(manifest['browser_specific_settings']).toMatchObject({
      gecko: { id: 'safebrowse-guard@juv.dev' },
    });
  });

  it.each(['chrome', 'firefox'])('should ship a strict CSP in the %s manifest', (target) => {
    const manifest = readManifest(target);

    expect(manifest['content_security_policy']).toEqual({
      extension_pages: "script-src 'self'; object-src 'none'",
    });
  });
});
