import { describe, expect, it } from 'vitest';

import {
  SAFARI_ADAPTER_STATUS,
  SAFARI_STRATEGY_DOC,
  createSafariBrowserAdapter,
} from '../../../src/browser/safari/safari-adapter';

describe('createSafariBrowserAdapter', () => {
  it('should be marked as blocked and require an external environment', () => {
    expect(SAFARI_ADAPTER_STATUS).toBe('BLOCKED / REQUIRES EXTERNAL ENVIRONMENT');
    expect(SAFARI_STRATEGY_DOC).toBe('docs/SAFARI_STRATEGY.md');
  });

  it('should throw an error that points to the strategy document', () => {
    expect(() => createSafariBrowserAdapter()).toThrow(/docs\/SAFARI_STRATEGY\.md/);
    expect(() => createSafariBrowserAdapter()).toThrow(/macOS, Xcode and an Apple Developer account/);
  });
});
