import type { BrowserAdapter } from '../adapters/browser-adapter';

export const SAFARI_ADAPTER_STATUS = 'BLOCKED / REQUIRES EXTERNAL ENVIRONMENT';

export const SAFARI_STRATEGY_DOC = 'docs/SAFARI_STRATEGY.md';

export function createSafariBrowserAdapter(): BrowserAdapter {
  throw new Error(
    `Safari adapter is ${SAFARI_ADAPTER_STATUS}. It needs macOS, Xcode and an Apple Developer account. See ${SAFARI_STRATEGY_DOC}.`,
  );
}
