import { describe, expect, it } from 'vitest';

import {
  detectBrowserEngine,
  selectBrowserAdapter,
} from '../../../src/browser/adapters/select-adapter';
import { createFakeWebExtension } from '../../fixtures/fake-webextension';

const FIREFOX_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0';
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

describe('detectBrowserEngine', () => {
  it('should detect firefox from the browser global and a Firefox user agent', () => {
    const fake = createFakeWebExtension();

    expect(
      detectBrowserEngine({ browser: fake.api, navigator: { userAgent: FIREFOX_UA } }),
    ).toBe('firefox');
  });

  it('should detect safari from the browser global and a Safari-only user agent', () => {
    const fake = createFakeWebExtension();

    expect(
      detectBrowserEngine({ browser: fake.api, navigator: { userAgent: SAFARI_UA } }),
    ).toBe('safari');
  });

  it('should detect chromium when the chrome global is present', () => {
    const fake = createFakeWebExtension();

    expect(
      detectBrowserEngine({ chrome: fake.api, browser: fake.api, navigator: { userAgent: CHROME_UA } }),
    ).toBe('chromium');
  });

  it('should fall back to firefox when only the browser global is present', () => {
    const fake = createFakeWebExtension();

    expect(detectBrowserEngine({ browser: fake.api })).toBe('firefox');
  });

  it('should return unknown when no WebExtension global is present', () => {
    expect(detectBrowserEngine({ navigator: { userAgent: CHROME_UA } })).toBe('unknown');
  });
});

describe('selectBrowserAdapter', () => {
  it('should return a working chromium adapter', async () => {
    const fake = createFakeWebExtension();

    const adapter = selectBrowserAdapter({ chrome: fake.api, navigator: { userAgent: CHROME_UA } });
    await adapter.storage.set({ picked: 'chromium' });

    expect(fake.store.get('picked')).toBe('chromium');
  });

  it('should return a working firefox adapter', async () => {
    const fake = createFakeWebExtension();

    const adapter = selectBrowserAdapter({ browser: fake.api, navigator: { userAgent: FIREFOX_UA } });
    await adapter.storage.set({ picked: 'firefox' });

    expect(fake.store.get('picked')).toBe('firefox');
  });

  it('should throw for a Safari environment because the adapter is blocked', () => {
    const fake = createFakeWebExtension();

    expect(() =>
      selectBrowserAdapter({ browser: fake.api, navigator: { userAgent: SAFARI_UA } }),
    ).toThrow(/SAFARI_STRATEGY\.md/);
  });

  it('should throw when no supported engine is detected', () => {
    expect(() => selectBrowserAdapter({})).toThrow(/No supported WebExtension engine detected/);
  });
});
