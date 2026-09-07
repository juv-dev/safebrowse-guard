import { describe, expect, it } from 'vitest';

import { createFirefoxBrowserAdapter } from '../../../src/browser/firefox/firefox-adapter';
import { createFakeWebExtension } from '../../fixtures/fake-webextension';

describe('createFirefoxBrowserAdapter', () => {
  it('should build an adapter backed by the browser global', async () => {
    const fake = createFakeWebExtension({ sendMessageResponse: 'pong' });

    const adapter = createFirefoxBrowserAdapter({ browser: fake.api });
    const response = await adapter.runtime.sendMessage('ping');

    expect(response).toBe('pong');
    expect(fake.sentMessages).toEqual(['ping']);
  });

  it('should throw when browser.* is not a usable WebExtensions API', () => {
    expect(() => createFirefoxBrowserAdapter({ browser: undefined })).toThrow(
      /browser\.\* WebExtensions API is unavailable/,
    );
    expect(() => createFirefoxBrowserAdapter({ browser: { storage: {} } })).toThrow();
  });

  it('should fall back to the global scope when no scope is passed', () => {
    expect(() => createFirefoxBrowserAdapter()).toThrow(/browser\.\* WebExtensions API is unavailable/);
  });
});
