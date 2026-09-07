import type { BrowserAdapter } from '../adapters/browser-adapter';
import { createWebExtensionAdapter, isWebExtensionApi } from '../adapters/webextension-adapter';
import type { WebExtensionApi } from '../adapters/webextension-adapter';

export interface FirefoxScope {
  browser?: unknown;
}

function currentGlobalScope(): FirefoxScope {
  return globalThis as unknown as FirefoxScope;
}

function resolveBrowserApi(scope: FirefoxScope): WebExtensionApi {
  const candidate = scope.browser;
  if (!isWebExtensionApi(candidate)) {
    throw new Error(
      'browser.* WebExtensions API is unavailable; the Firefox adapter must run inside a Firefox extension context',
    );
  }
  return candidate;
}

export function createFirefoxBrowserAdapter(scope: FirefoxScope = currentGlobalScope()): BrowserAdapter {
  return createWebExtensionAdapter(resolveBrowserApi(scope));
}
