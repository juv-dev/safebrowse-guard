import type { BrowserAdapter } from '../../src/browser/adapters/browser-adapter';
import { createWebExtensionAdapter } from '../../src/browser/adapters/webextension-adapter';
import type { WebExtensionApi } from '../../src/browser/adapters/webextension-adapter';

interface RawTab {
  id?: number;
  url?: string;
}

interface RawMessageSender {
  id?: string;
  url?: string;
  tab?: { id?: number };
}

export interface FakeWebExtension {
  api: WebExtensionApi;
  store: Map<string, unknown>;
  sentMessages: unknown[];
  emitMessage(message: unknown, sender?: RawMessageSender): void;
  setTabs(tabs: RawTab[]): void;
}

export function createFakeWebExtension(options: { sendMessageResponse?: unknown } = {}): FakeWebExtension {
  const store = new Map<string, unknown>();
  const sentMessages: unknown[] = [];
  const listeners: Array<(message: unknown, sender: RawMessageSender) => void> = [];
  let tabs: RawTab[] = [];

  const api: WebExtensionApi = {
    storage: {
      local: {
        get: (keys) => {
          const result: Record<string, unknown> = {};
          for (const key of keys) {
            if (store.has(key)) {
              result[key] = store.get(key);
            }
          }
          return Promise.resolve(result);
        },
        set: (items) => {
          for (const [key, value] of Object.entries(items)) {
            store.set(key, value);
          }
          return Promise.resolve();
        },
      },
    },
    runtime: {
      sendMessage: (message) => {
        sentMessages.push(message);
        return Promise.resolve(options.sendMessageResponse);
      },
      onMessage: {
        addListener: (listener) => {
          listeners.push(listener);
        },
      },
    },
    tabs: {
      query: () => Promise.resolve(tabs.slice()),
    },
  };

  return {
    api,
    store,
    sentMessages,
    emitMessage: (message, sender = {}) => {
      for (const listener of listeners) {
        listener(message, sender);
      }
    },
    setTabs: (next) => {
      tabs = next.slice();
    },
  };
}

export function createInMemoryBrowserAdapter(): BrowserAdapter {
  return createWebExtensionAdapter(createFakeWebExtension().api);
}
