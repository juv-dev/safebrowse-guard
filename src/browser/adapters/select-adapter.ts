import type { BrowserAdapter } from './browser-adapter';
import { createChromiumBrowserAdapter } from '../chromium/chromium-adapter';
import type { ChromiumScope } from '../chromium/chromium-adapter';
import { createFirefoxBrowserAdapter } from '../firefox/firefox-adapter';
import type { FirefoxScope } from '../firefox/firefox-adapter';
import { createSafariBrowserAdapter } from '../safari/safari-adapter';

export type BrowserEngine = 'chromium' | 'firefox' | 'safari' | 'unknown';

export interface DetectionScope extends ChromiumScope, FirefoxScope {
  navigator?: { userAgent?: string };
}

function hasObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null;
}

export function detectBrowserEngine(scope: DetectionScope = globalThis): BrowserEngine {
  const userAgent = scope.navigator?.userAgent ?? '';
  const hasChrome = hasObject(scope.chrome);
  const hasBrowser = hasObject(scope.browser);

  if (hasBrowser && /firefox/i.test(userAgent)) {
    return 'firefox';
  }
  if (hasBrowser && /safari/i.test(userAgent) && !/chrom(e|ium)/i.test(userAgent)) {
    return 'safari';
  }
  if (hasChrome) {
    return 'chromium';
  }
  if (hasBrowser) {
    return 'firefox';
  }
  return 'unknown';
}

export function selectBrowserAdapter(scope: DetectionScope = globalThis): BrowserAdapter {
  switch (detectBrowserEngine(scope)) {
    case 'chromium':
      return createChromiumBrowserAdapter(scope);
    case 'firefox':
      return createFirefoxBrowserAdapter(scope);
    case 'safari':
      return createSafariBrowserAdapter();
    default:
      throw new Error('No supported WebExtension engine detected (expected Chromium or Firefox)');
  }
}
