import { describe, expect, it } from 'vitest';

import type { BrowserAdapter } from '../../../src/browser/adapters/browser-adapter';
import { createWebExtensionAdapter } from '../../../src/browser/adapters/webextension-adapter';
import { createFakeWebExtension } from '../../fixtures/fake-webextension';

async function rememberActiveTabUrl(adapter: BrowserAdapter): Promise<string | undefined> {
  const [activeTab] = await adapter.tabs.query({ active: true });
  if (activeTab?.url === undefined) {
    return undefined;
  }
  await adapter.storage.set({ lastVisitedUrl: activeTab.url });
  const stored = await adapter.storage.get(['lastVisitedUrl']);
  const value = stored['lastVisitedUrl'];
  return typeof value === 'string' ? value : undefined;
}

describe('a consumer that depends only on BrowserAdapter', () => {
  it('should persist the active tab url through the adapter surface', async () => {
    const fake = createFakeWebExtension();
    fake.setTabs([{ id: 10, url: 'https://news.example' }]);
    const adapter = createWebExtensionAdapter(fake.api);

    const result = await rememberActiveTabUrl(adapter);

    expect(result).toBe('https://news.example');
    expect(fake.store.get('lastVisitedUrl')).toBe('https://news.example');
  });

  it('should return undefined when the active tab has no url', async () => {
    const fake = createFakeWebExtension();
    fake.setTabs([{ id: 11 }]);
    const adapter = createWebExtensionAdapter(fake.api);

    expect(await rememberActiveTabUrl(adapter)).toBeUndefined();
  });
});
