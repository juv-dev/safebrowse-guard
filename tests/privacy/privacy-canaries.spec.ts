// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import { getSafeScanRoot, isProtectedElement } from '../../src/core/privacy/privacyBoundary';

const PASSWORD_CANARY = 'SUPER_PRIVATE_PASSWORD_123';
const EMAIL_CANARY = 'test-private@example.invalid';
const CANARIES = [PASSWORD_CANARY, EMAIL_CANARY];

interface ScanSink {
  results: string[];
  logs: string[];
  storage: Record<string, string>;
}

function byId(id: string): Element {
  const el = document.getElementById(id);
  if (el === null) {
    throw new Error(`missing test element #${id}`);
  }
  return el;
}

function buildLoginPage(): void {
  document.body.innerHTML =
    '<main id="page"><h1>Account</h1><p id="copy">Update your credentials below.</p>' +
    '<form id="login"><input id="user" type="email"><input id="pass" type="password">' +
    '<div id="note" contenteditable="true"></div></form></main>';

  (byId('user') as HTMLInputElement).value = EMAIL_CANARY;
  (byId('pass') as HTMLInputElement).value = PASSWORD_CANARY;
  byId('note').textContent = `draft ${PASSWORD_CANARY}`;
}

function scanSafeSurface(): ScanSink {
  const sink: ScanSink = { results: [], logs: [], storage: {} };
  const safeRoots = getSafeScanRoot(byId('page'));

  for (const root of safeRoots) {
    sink.results.push(root.textContent ?? '');
  }
  sink.logs.push(`scanned ${String(safeRoots.length)} safe roots`);
  sink.storage['lastScan'] = sink.results.join('|');

  return sink;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('privacy canaries', () => {
  it('should never expose typed field values through results, logs or storage', () => {
    buildLoginPage();

    const sink = scanSafeSurface();
    const haystack = [...sink.results, ...sink.logs, ...Object.values(sink.storage)].join('\n');

    for (const canary of CANARIES) {
      expect(haystack).not.toContain(canary);
    }
  });

  it('should classify every credential field and its wrapper as protected', () => {
    buildLoginPage();

    for (const id of ['login', 'user', 'pass', 'note']) {
      expect(isProtectedElement(byId(id))).toBe(true);
    }
  });

  it('should break if a module reads an input value from within the safe surface', () => {
    buildLoginPage();

    const safeRoots = getSafeScanRoot(byId('page'));
    const leaked: string[] = [];

    for (const root of safeRoots) {
      if (isProtectedElement(root)) {
        leaked.push('protected-root-returned');
      }
      for (const field of Array.from(root.querySelectorAll('input, textarea, select'))) {
        leaked.push((field as HTMLInputElement).value);
      }
    }

    expect(leaked).toEqual([]);
  });
});
