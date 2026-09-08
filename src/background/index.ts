import type { BrowserAdapter } from '../browser/adapters';
import { detectBrowserEngine, selectBrowserAdapter } from '../browser/adapters';
import type { Message } from '../shared/messaging';
import { validateMessage } from '../shared/messaging';

export interface BackgroundHandle {
  acceptedMessages: readonly Message[];
}

export function startBackground(adapter: BrowserAdapter = selectBrowserAdapter()): BackgroundHandle {
  const acceptedMessages: Message[] = [];

  adapter.runtime.onMessage((message, sender) => {
    const valid = validateMessage(message, sender);
    if (valid !== null) {
      acceptedMessages.push(valid);
    }
  });

  return { acceptedMessages };
}

if (detectBrowserEngine() !== 'unknown') {
  startBackground();
}
