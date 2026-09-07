import { describe, expect, it, vi } from 'vitest';

import {
  createWebExtensionAdapter,
  isWebExtensionApi,
} from '../../../src/browser/adapters/webextension-adapter';
import { createFakeWebExtension } from '../../fixtures/fake-webextension';

describe('createWebExtensionAdapter', () => {
  it('should read and write through storage.local', async () => {
    const fake = createFakeWebExtension();
    const adapter = createWebExtensionAdapter(fake.api);

    await adapter.storage.set({ enabled: true, threshold: 3 });
    const stored = await adapter.storage.get(['enabled', 'threshold', 'missing']);

    expect(stored).toEqual({ enabled: true, threshold: 3 });
    expect(fake.store.get('enabled')).toBe(true);
  });

  it('should forward runtime messages and resolve the response', async () => {
    const fake = createFakeWebExtension({ sendMessageResponse: { ok: true } });
    const adapter = createWebExtensionAdapter(fake.api);

    const response = await adapter.runtime.sendMessage({ type: 'ping' });

    expect(response).toEqual({ ok: true });
    expect(fake.sentMessages).toEqual([{ type: 'ping' }]);
  });

  it('should deliver incoming runtime messages to the registered handler', () => {
    const fake = createFakeWebExtension();
    const adapter = createWebExtensionAdapter(fake.api);
    const handler = vi.fn<(message: unknown) => void>();

    adapter.runtime.onMessage(handler);
    fake.emitMessage({ type: 'classified' });

    expect(handler).toHaveBeenCalledWith({ type: 'classified' });
  });

  it('should normalize tabs, dropping entries without a numeric id', async () => {
    const fake = createFakeWebExtension();
    fake.setTabs([
      { id: 1, url: 'https://example.com' },
      { id: 2 },
      { url: 'https://no-id.example' },
    ]);
    const adapter = createWebExtensionAdapter(fake.api);

    const tabs = await adapter.tabs.query({ active: true });

    expect(tabs).toEqual([{ id: 1, url: 'https://example.com' }, { id: 2 }]);
  });

  it('should omit the url property when the source tab has no url', async () => {
    const fake = createFakeWebExtension();
    fake.setTabs([{ id: 7 }]);
    const adapter = createWebExtensionAdapter(fake.api);

    const [tab] = await adapter.tabs.query({});

    expect(tab).toEqual({ id: 7 });
    expect(tab && 'url' in tab).toBe(false);
  });
});

describe('isWebExtensionApi', () => {
  it('should accept an object exposing the full required surface', () => {
    const fake = createFakeWebExtension();

    expect(isWebExtensionApi(fake.api)).toBe(true);
  });

  it('should reject values that are missing part of the surface', () => {
    const noop = (): void => undefined;
    const partialApis: unknown[] = [
      null,
      undefined,
      42,
      'chrome',
      {},
      { storage: {} },
      { storage: { local: {} }, runtime: {}, tabs: {} },
      { storage: { local: { get: noop, set: noop } }, runtime: {}, tabs: {} },
      { storage: { local: { get: noop, set: noop } }, runtime: { sendMessage: noop }, tabs: {} },
      {
        storage: { local: { get: noop, set: noop } },
        runtime: { sendMessage: noop, onMessage: {} },
        tabs: {},
      },
      {
        storage: { local: { get: noop, set: noop } },
        runtime: { sendMessage: noop, onMessage: { addListener: noop } },
        tabs: {},
      },
    ];

    for (const candidate of partialApis) {
      expect(isWebExtensionApi(candidate)).toBe(false);
    }
  });
});
