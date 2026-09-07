import { describe, expect, it } from 'vitest';

import { createChromiumBrowserAdapter } from '../../../src/browser/chromium/chromium-adapter';
import { createFakeWebExtension } from '../../fixtures/fake-webextension';

describe('createChromiumBrowserAdapter', () => {
  it('should build an adapter backed by the chrome global', async () => {
    const fake = createFakeWebExtension();

    const adapter = createChromiumBrowserAdapter({ chrome: fake.api });
    await adapter.storage.set({ locale: 'es' });

    expect(fake.store.get('locale')).toBe('es');
  });

  it('should throw when chrome.* is not a usable WebExtension API', () => {
    expect(() => createChromiumBrowserAdapter({ chrome: undefined })).toThrow(/chrome\.\* WebExtension API is unavailable/);
    expect(() => createChromiumBrowserAdapter({ chrome: {} })).toThrow();
  });

  it('should fall back to the global scope when no scope is passed', () => {
    expect(() => createChromiumBrowserAdapter()).toThrow(/chrome\.\* WebExtension API is unavailable/);
  });
});
