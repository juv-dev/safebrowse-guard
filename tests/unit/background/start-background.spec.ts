import { afterEach, describe, expect, it, vi } from 'vitest';

import { startBackground } from '../../../src/background/index';
import { createWebExtensionAdapter } from '../../../src/browser/adapters/webextension-adapter';
import { createFakeWebExtension } from '../../fixtures/fake-webextension';

describe('startBackground', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('should record string message types received through the adapter', () => {
    const fake = createFakeWebExtension();
    const handle = startBackground(createWebExtensionAdapter(fake.api));

    fake.emitMessage({ type: 'classify-request' });
    fake.emitMessage({ type: 'classify-request' });
    fake.emitMessage({ type: 'settings-updated' });

    expect([...handle.seenMessageTypes]).toEqual(['classify-request', 'settings-updated']);
  });

  it('should ignore messages without a string type', () => {
    const fake = createFakeWebExtension();
    const handle = startBackground(createWebExtensionAdapter(fake.api));

    fake.emitMessage({ type: 42 });
    fake.emitMessage('plain');
    fake.emitMessage(null);

    expect(handle.seenMessageTypes.size).toBe(0);
  });

  it('should auto-start when a WebExtension engine is detected at load time', async () => {
    vi.resetModules();
    const fake = createFakeWebExtension();
    vi.stubGlobal('chrome', fake.api);

    const module = await import('../../../src/background/index');

    expect(typeof module.startBackground).toBe('function');
  });
});
