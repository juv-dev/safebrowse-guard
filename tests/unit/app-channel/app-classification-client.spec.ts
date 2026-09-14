import { afterEach, describe, expect, it, vi } from 'vitest';

import type {
  AppChannel,
  ClassifyRequest,
  ClassifyResponse,
  LocalClassifier,
} from '../../../src/core/app-channel/appClassificationClient';
import {
  classifyWithFallback,
  isClassifyRequest,
  requestAppClassification,
  validateClassifyResponse,
} from '../../../src/core/app-channel/appClassificationClient';

const REQUEST: ClassifyRequest = { type: 'classify', hostname: 'example.com', metadata: { path: '/a' } };
const APP_RESPONSE = { decision: 'block', riskScore: 87, categories: ['adult'] };
const EXPECTED_RESPONSE: ClassifyResponse = { decision: 'block', riskScore: 87, categories: ['adult'] };
const LOCAL_RESPONSE: ClassifyResponse = { decision: 'unknown', riskScore: 0, categories: [] };

interface FakeChannel extends AppChannel {
  sent: ClassifyRequest[];
  sendShouldThrow: boolean;
  emit(raw: unknown): void;
  emitDisconnect(): void;
}

function createFakeChannel(): FakeChannel {
  const messageHandlers: Array<(raw: unknown) => void> = [];
  const disconnectHandlers: Array<() => void> = [];
  const fake: FakeChannel = {
    sent: [],
    sendShouldThrow: false,
    send(message) {
      if (fake.sendShouldThrow) {
        throw new Error('channel closed');
      }
      fake.sent.push(message);
    },
    onMessage(handler) {
      messageHandlers.push(handler);
    },
    onDisconnect(handler) {
      disconnectHandlers.push(handler);
    },
    emit(raw) {
      for (const handler of messageHandlers) {
        handler(raw);
      }
    },
    emitDisconnect() {
      for (const handler of disconnectHandlers) {
        handler();
      }
    },
  };
  return fake;
}

function localStub(): LocalClassifier {
  return vi.fn<LocalClassifier>(() => ({ ...LOCAL_RESPONSE }));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('requestAppClassification', () => {
  it('should resolve the validated app response and forward the request once', async () => {
    const channel = createFakeChannel();

    const pending = requestAppClassification(REQUEST, channel);
    channel.emit(APP_RESPONSE);

    await expect(pending).resolves.toEqual(EXPECTED_RESPONSE);
    expect(channel.sent).toEqual([REQUEST]);
  });

  it('should accept a valid frame that arrives after an invalid one', async () => {
    const channel = createFakeChannel();

    const pending = requestAppClassification(REQUEST, channel, { timeoutMs: 1000 });
    channel.emit({ decision: 'nope', riskScore: 1, categories: [] });
    channel.emit(APP_RESPONSE);

    await expect(pending).resolves.toEqual(EXPECTED_RESPONSE);
  });

  it('should resolve null when the app stays silent past the timeout', async () => {
    vi.useFakeTimers();
    const channel = createFakeChannel();

    const pending = requestAppClassification(REQUEST, channel, { timeoutMs: 40 });
    await vi.advanceTimersByTimeAsync(40);

    await expect(pending).resolves.toBeNull();
  });

  it('should ignore a response that arrives after the timeout', async () => {
    vi.useFakeTimers();
    const channel = createFakeChannel();

    const pending = requestAppClassification(REQUEST, channel, { timeoutMs: 10 });
    await vi.advanceTimersByTimeAsync(10);
    channel.emit(APP_RESPONSE);

    await expect(pending).resolves.toBeNull();
  });

  it('should resolve null when the channel disconnects first', async () => {
    const channel = createFakeChannel();

    const pending = requestAppClassification(REQUEST, channel);
    channel.emitDisconnect();

    await expect(pending).resolves.toBeNull();
  });

  it('should resolve null when sending on the channel throws', async () => {
    const channel = createFakeChannel();
    channel.sendShouldThrow = true;

    await expect(requestAppClassification(REQUEST, channel)).resolves.toBeNull();
    expect(channel.sent).toEqual([]);
  });

  it.each<[string, unknown]>([
    ['a wrong type', { type: 'analyze', hostname: 'x', metadata: {} }],
    ['an empty hostname', { type: 'classify', hostname: '', metadata: {} }],
    ['a non-string hostname', { type: 'classify', hostname: 7, metadata: {} }],
    ['missing metadata', { type: 'classify', hostname: 'x' }],
    ['an extra key', { type: 'classify', hostname: 'x', metadata: {}, urgent: true }],
  ])('should reject %s without sending anything', async (_label, bad) => {
    const channel = createFakeChannel();

    await expect(requestAppClassification(bad as ClassifyRequest, channel)).resolves.toBeNull();
    expect(channel.sent).toEqual([]);
  });

  it('should reject a structurally valid but oversized request', async () => {
    const channel = createFakeChannel();
    const huge: ClassifyRequest = {
      type: 'classify',
      hostname: 'example.com',
      metadata: { blob: 'y'.repeat(9000) },
    };

    await expect(requestAppClassification(huge, channel)).resolves.toBeNull();
    expect(channel.sent).toEqual([]);
  });
});

describe('classifyWithFallback', () => {
  it('should use the app response and never touch the local classifier', async () => {
    const channel = createFakeChannel();
    const local = localStub();

    const pending = classifyWithFallback(REQUEST, channel, local);
    channel.emit(APP_RESPONSE);

    await expect(pending).resolves.toEqual({ source: 'app', response: EXPECTED_RESPONSE });
    expect(local).not.toHaveBeenCalled();
  });

  it('should fall back to the local classifier after the timeout', async () => {
    vi.useFakeTimers();
    const channel = createFakeChannel();
    const local = localStub();

    const pending = classifyWithFallback(REQUEST, channel, local, { timeoutMs: 30 });
    await vi.advanceTimersByTimeAsync(30);

    await expect(pending).resolves.toEqual({ source: 'local', response: LOCAL_RESPONSE });
    expect(local).toHaveBeenCalledTimes(1);
    expect(local).toHaveBeenCalledWith(REQUEST);
  });

  it('should fall back when the channel disconnects', async () => {
    const channel = createFakeChannel();
    const local = localStub();

    const pending = classifyWithFallback(REQUEST, channel, local);
    channel.emitDisconnect();

    await expect(pending).resolves.toEqual({ source: 'local', response: LOCAL_RESPONSE });
    expect(local).toHaveBeenCalledTimes(1);
  });

  it.each<[string, unknown]>([
    ['an unknown key', { decision: 'allow', riskScore: 1, categories: [], extra: 1 }],
    ['a non-string decision', { decision: 1, riskScore: 1, categories: [] }],
    ['a decision outside the enum', { decision: 'maybe', riskScore: 1, categories: [] }],
    ['a non-number riskScore', { decision: 'allow', riskScore: 'high', categories: [] }],
    ['a non-finite riskScore', { decision: 'allow', riskScore: Number.POSITIVE_INFINITY, categories: [] }],
    ['a non-array categories', { decision: 'allow', riskScore: 1, categories: 'adult' }],
    ['a non-string category', { decision: 'allow', riskScore: 1, categories: ['ok', 2] }],
    ['a non-object frame', 'block'],
  ])('should fall back to local when the app replies with %s', async (_label, bad) => {
    vi.useFakeTimers();
    const channel = createFakeChannel();
    const local = localStub();

    const pending = classifyWithFallback(REQUEST, channel, local, { timeoutMs: 20 });
    channel.emit(bad);
    await vi.advanceTimersByTimeAsync(20);

    await expect(pending).resolves.toEqual({ source: 'local', response: LOCAL_RESPONSE });
    expect(local).toHaveBeenCalledTimes(1);
  });
});

describe('validateClassifyResponse', () => {
  it('should return the normalized response for every valid decision', () => {
    expect(validateClassifyResponse({ decision: 'allow', riskScore: 0, categories: [] })).toEqual({
      decision: 'allow',
      riskScore: 0,
      categories: [],
    });
    expect(
      validateClassifyResponse({ decision: 'unknown', riskScore: 50.5, categories: ['a', 'b'] }),
    ).toEqual({ decision: 'unknown', riskScore: 50.5, categories: ['a', 'b'] });
  });

  it('should reject null, oversized and unserializable frames', () => {
    expect(validateClassifyResponse(null)).toBeNull();
    expect(
      validateClassifyResponse({ decision: 'allow', riskScore: 0, categories: ['x'.repeat(9000)] }),
    ).toBeNull();

    const circular: Record<string, unknown> = { decision: 'allow', riskScore: 0, categories: [] };
    circular['self'] = circular;
    expect(validateClassifyResponse(circular)).toBeNull();
  });
});

describe('isClassifyRequest', () => {
  it('should accept a well-formed request and reject malformed ones', () => {
    expect(isClassifyRequest(REQUEST)).toBe(true);
    expect(isClassifyRequest({ type: 'classify', hostname: 'x', metadata: {} })).toBe(true);
    expect(isClassifyRequest({ type: 'classify', hostname: 'x', metadata: null })).toBe(false);
    expect(isClassifyRequest('classify')).toBe(false);
  });
});
