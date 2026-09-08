import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build, initialize, stop } from 'esbuild-wasm';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const entryPoint = join(rootDir, 'src', 'background', 'index.ts');

const KNOWN_TARGETS = ['chrome', 'firefox'];

function log(message) {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

let ready;
function ensureEsbuild() {
  if (ready === undefined) {
    ready = initialize({ worker: false });
  }
  return ready;
}

async function readManifestVersion() {
  const raw = await readFile(join(rootDir, 'package.json'), 'utf8');
  const parsed = JSON.parse(raw);
  return typeof parsed.version === 'string' ? parsed.version : '0.0.0';
}

function createManifest(target, version) {
  const base = {
    manifest_version: 3,
    name: 'SafeBrowse Guard',
    version,
    description:
      'Detects, restricts and blocks pornographic, sexually explicit and sexualized content while browsing.',
    permissions: ['storage', 'tabs'],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'none'",
    },
  };

  if (target === 'firefox') {
    return {
      ...base,
      background: { scripts: ['background.js'] },
      browser_specific_settings: {
        gecko: { id: 'safebrowse-guard@juv.dev', strict_min_version: '128.0' },
      },
    };
  }

  return {
    ...base,
    background: { service_worker: 'background.js' },
  };
}

async function buildTarget(target, version) {
  const outDir = join(distDir, target);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  await ensureEsbuild();
  await build({
    entryPoints: [entryPoint],
    outfile: join(outDir, 'background.js'),
    bundle: true,
    format: 'iife',
    target: 'es2022',
    platform: 'browser',
    minify: true,
    legalComments: 'none',
    define: { 'process.env.NODE_ENV': '"production"' },
  });

  const manifest = createManifest(target, version);
  await writeFile(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  log(`built ${target} -> dist/${target}`);
}

async function main() {
  const requested = process.argv.slice(2);
  const targets = requested.length > 0 ? requested : KNOWN_TARGETS;
  const unknown = targets.filter((target) => !KNOWN_TARGETS.includes(target));

  if (unknown.length > 0) {
    fail(`unknown build target(s): ${unknown.join(', ')}. Known targets: ${KNOWN_TARGETS.join(', ')}`);
    return;
  }

  const version = await readManifestVersion();
  for (const target of targets) {
    await buildTarget(target, version);
  }
}

try {
  await main();
} catch (error) {
  fail(error instanceof Error ? error.stack ?? error.message : String(error));
} finally {
  await stop();
}
