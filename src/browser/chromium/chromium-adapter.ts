import type { BrowserAdapter } from '../adapters/browser-adapter';
import { createWebExtensionAdapter, isWebExtensionApi } from '../adapters/webextension-adapter';
import type { WebExtensionApi } from '../adapters/webextension-adapter';

export interface ChromiumScope {
  chrome?: unknown;
}

function currentGlobalScope(): ChromiumScope {
  return globalThis as unknown as ChromiumScope;
}

function resolveChromeApi(scope: ChromiumScope): WebExtensionApi {
  const candidate = scope.chrome;
  if (!isWebExtensionApi(candidate)) {
    throw new Error(
      'chrome.* WebExtension API is unavailable; the Chromium adapter must run inside a Chromium extension context',
    );
  }
  return candidate;
}

export function createChromiumBrowserAdapter(scope: ChromiumScope = currentGlobalScope()): BrowserAdapter {
  return createWebExtensionAdapter(resolveChromeApi(scope));
}
