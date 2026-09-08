import type { MessageSender } from '../../shared/messaging';
import type { BrowserAdapter, BrowserTab, MessageHandler } from './browser-adapter';

interface RawTab {
  id?: number;
  url?: string;
}

interface RawMessageSender {
  id?: string;
  url?: string;
  tab?: { id?: number };
}

export interface WebExtensionApi {
  storage: {
    local: {
      get(keys: string[]): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
    };
  };
  runtime: {
    sendMessage(message: unknown): Promise<unknown>;
    onMessage: {
      addListener(listener: (message: unknown, sender: RawMessageSender) => void): void;
    };
  };
  tabs: {
    query(info: object): Promise<readonly RawTab[]>;
  };
}

function isCallable(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;
}

export function isWebExtensionApi(candidate: unknown): candidate is WebExtensionApi {
  const root = asRecord(candidate);
  if (root === undefined) {
    return false;
  }

  const storageLocal = asRecord(asRecord(root['storage'])?.['local']);
  const runtime = asRecord(root['runtime']);
  const onMessage = asRecord(runtime?.['onMessage']);
  const tabs = asRecord(root['tabs']);

  return (
    isCallable(storageLocal?.['get']) &&
    isCallable(storageLocal?.['set']) &&
    isCallable(runtime?.['sendMessage']) &&
    isCallable(onMessage?.['addListener']) &&
    isCallable(tabs?.['query'])
  );
}

function toBrowserTab(rawTab: RawTab): BrowserTab | undefined {
  if (typeof rawTab.id !== 'number') {
    return undefined;
  }
  return rawTab.url === undefined ? { id: rawTab.id } : { id: rawTab.id, url: rawTab.url };
}

function toMessageSender(raw: RawMessageSender): MessageSender {
  const sender: MessageSender = {};
  if (typeof raw.id === 'string') {
    sender.id = raw.id;
  }
  if (typeof raw.url === 'string') {
    sender.url = raw.url;
  }
  if (raw.tab !== undefined && typeof raw.tab.id === 'number') {
    sender.tab = { id: raw.tab.id };
  }
  return sender;
}

export function createWebExtensionAdapter(api: WebExtensionApi): BrowserAdapter {
  return {
    storage: {
      get: (keys) => api.storage.local.get(keys),
      set: (items) => api.storage.local.set(items),
    },
    runtime: {
      sendMessage: (message) => api.runtime.sendMessage(message),
      onMessage: (handler: MessageHandler) => {
        api.runtime.onMessage.addListener((message, sender) => {
          handler(message, toMessageSender(sender));
        });
      },
    },
    tabs: {
      query: async (info) => {
        const rawTabs = await api.tabs.query(info);
        const tabs: BrowserTab[] = [];
        for (const rawTab of rawTabs) {
          const tab = toBrowserTab(rawTab);
          if (tab !== undefined) {
            tabs.push(tab);
          }
        }
        return tabs;
      },
    },
  };
}
