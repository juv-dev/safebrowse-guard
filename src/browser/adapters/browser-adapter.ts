import type { MessageSender } from '../../shared/messaging';

export type { MessageSender };

export interface BrowserStorage {
  get(keys: string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

export type MessageHandler = (message: unknown, sender: MessageSender) => void;

export interface BrowserRuntime {
  sendMessage(message: unknown): Promise<unknown>;
  onMessage(handler: MessageHandler): void;
}

export interface BrowserTab {
  id: number;
  url?: string;
}

export interface BrowserTabs {
  query(info: object): Promise<BrowserTab[]>;
}

export interface BrowserAdapter {
  storage: BrowserStorage;
  runtime: BrowserRuntime;
  tabs: BrowserTabs;
}
