import { afterEach, describe, expect, it, vi } from 'vitest';

import { startBackground } from '../../../src/background/index';
import { createWebExtensionAdapter } from '../../../src/browser/adapters/webextension-adapter';
import { createFakeWebExtension } from '../../fixtures/fake-webextension';

const CONTENT_SENDER = { id: 'self', tab: { id: 4 } };
const PAGE_SENDER = { id: 'self', url: 'chrome-extension://self/popup.html' };

describe('startBackground', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('should record only messages that pass validateMessage', () => {
    const fake = createFakeWebExtension();
    const handle = startBackground(createWebExtensionAdapter(fake.api));

    fake.emitMessage({ type: 'scan:request', payload: { hostname: 'example.com' } }, CONTENT_SENDER);
    fake.emitMessage({ type: 'popup:status-request' }, PAGE_SENDER);

    expect(handle.acceptedMessages).toEqual([
      { type: 'scan:request', payload: { hostname: 'example.com' } },
      { type: 'popup:status-request' },
    ]);
  });

  it('should drop malformed, mistyped or wrongly-sent messages', () => {
    const fake = createFakeWebExtension();
    const handle = startBackground(createWebExtensionAdapter(fake.api));

    fake.emitMessage({ type: 'does:not:exist' }, PAGE_SENDER);
    fake.emitMessage({ type: 'scan:request', payload: { hostname: 'example.com' } }, PAGE_SENDER);
    fake.emitMessage({ type: 'scan:request', payload: { hostname: 'x' }, extra: 1 }, CONTENT_SENDER);
    fake.emitMessage('plain-string', CONTENT_SENDER);
    fake.emitMessage({ type: 'popup:status-request' }, { url: 'https://evil.example/' });

    expect(handle.acceptedMessages).toEqual([]);
  });

  it('should auto-start when a WebExtension engine is detected at load time', async () => {
    vi.resetModules();
    const fake = createFakeWebExtension();
    vi.stubGlobal('chrome', fake.api);

    const module = await import('../../../src/background/index');

    expect(typeof module.startBackground).toBe('function');
  });
});
