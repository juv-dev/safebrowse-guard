import type { BrowserAdapter } from '../browser/adapters';
import { detectBrowserEngine, selectBrowserAdapter } from '../browser/adapters';

function extractMessageType(message: unknown): string | undefined {
  if (typeof message !== 'object' || message === null || !('type' in message)) {
    return undefined;
  }
  const { type } = message;
  return typeof type === 'string' ? type : undefined;
}

export interface BackgroundHandle {
  seenMessageTypes: ReadonlySet<string>;
}

export function startBackground(adapter: BrowserAdapter = selectBrowserAdapter()): BackgroundHandle {
  const seenMessageTypes = new Set<string>();

  adapter.runtime.onMessage((message) => {
    const type = extractMessageType(message);
    if (type !== undefined) {
      seenMessageTypes.add(type);
    }
  });

  return { seenMessageTypes };
}

if (detectBrowserEngine() !== 'unknown') {
  startBackground();
}
