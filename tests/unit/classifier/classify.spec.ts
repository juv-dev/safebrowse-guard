import { afterEach, describe, expect, it, vi } from 'vitest';

import type {
  AppChannel,
  ClassifyRequest,
  ClassifyResponse,
} from '../../../src/core/app-channel/appClassificationClient';
import type { StandaloneEngine } from '../../../src/core/classifier/classify';
import {
  SAFE_CLASSIFICATION,
  classify,
  createStandaloneClassifier,
} from '../../../src/core/classifier/classify';

const REQUEST: ClassifyRequest = {
  type: 'classify',
  hostname: 'adult.example',
  metadata: { title: 'explicit content', path: '/x' },
};

const APP_RESPONSE = { decision: 'allow', riskScore: 2, categories: [] };
const BLOCK: ClassifyResponse = { decision: 'block', riskScore: 95, categories: ['adult'] };

interface FakeChannel extends AppChannel {
  sent: ClassifyRequest[];
  emit(raw: unknown): void;
  emitDisconnect(): void;
}

function createFakeChannel(): FakeChannel {
  const messageHandlers: Array<(raw: unknown) => void> = [];
  const disconnectHandlers: Array<() => void> = [];
  return {
    sent: [],
    send(message) {
      this.sent.push(message);
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
}

function deadChannel(): FakeChannel {
  const channel = createFakeChannel();
  const original = channel.onDisconnect.bind(channel);
  channel.onDisconnect = (handler) => {
    original(handler);
    channel.emitDisconnect();
  };
  return channel;
}

function blockingEngine(): StandaloneEngine {
  return {
    domainIntelligence: vi.fn(() => ({ category: 'adult', score: 0.9 })),
    keywordGuard: vi.fn(() => ({ categories: ['adult'], score: 0.8 })),
    riskEngine: vi.fn(() => ({ ...BLOCK })),
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('classify — standalone mode', () => {
  it('should keep blocking through the own engine when the local channel is disabled', async () => {
    const engine = blockingEngine();

    const outcome = await classify(REQUEST, { channel: deadChannel(), engine, timeoutMs: 20 });

    expect(outcome).toEqual({ source: 'standalone', response: BLOCK });
    expect(engine.riskEngine).toHaveBeenCalledWith({
      hostname: 'adult.example',
      domain: { category: 'adult', score: 0.9 },
      keyword: { categories: ['adult'], score: 0.8 },
    });
  });

  it('should fall back to the own engine when the channel times out', async () => {
    vi.useFakeTimers();
    const engine = blockingEngine();
    const channel = createFakeChannel();

    const pending = classify(REQUEST, { channel, engine, timeoutMs: 30 });
    await vi.advanceTimersByTimeAsync(30);
    const outcome = await pending;

    expect(outcome.source).toBe('standalone');
    expect(outcome.response).toEqual(BLOCK);
    expect(engine.domainIntelligence).toHaveBeenCalledWith('adult.example');
    expect(engine.keywordGuard).toHaveBeenCalledWith(REQUEST.metadata);
  });

  it('should use the app result and never run the own engine when the app answers', async () => {
    const engine = blockingEngine();
    const channel = createFakeChannel();

    const pending = classify(REQUEST, { channel, engine });
    channel.emit(APP_RESPONSE);
    const outcome = await pending;

    expect(outcome).toEqual({ source: 'app', response: { decision: 'allow', riskScore: 2, categories: [] } });
    expect(engine.domainIntelligence).not.toHaveBeenCalled();
    expect(engine.riskEngine).not.toHaveBeenCalled();
  });

  it('should degrade to a safe classification when the own engine throws', async () => {
    const engine: StandaloneEngine = {
      domainIntelligence: () => {
        throw new Error('domain intelligence unavailable');
      },
      keywordGuard: vi.fn(),
      riskEngine: vi.fn(),
    };

    const outcome = await classify(REQUEST, { channel: deadChannel(), engine });

    expect(outcome).toEqual({ source: 'standalone', response: SAFE_CLASSIFICATION });
  });

  it('should degrade to a safe classification when the own engine returns garbage', async () => {
    const engine: StandaloneEngine = {
      domainIntelligence: () => ({ category: null, score: 0 }),
      keywordGuard: () => ({ categories: [], score: 0 }),
      riskEngine: () => ({ decision: 'nuke', riskScore: 0, categories: [] }) as unknown as ClassifyResponse,
    };

    const outcome = await classify(REQUEST, { channel: deadChannel(), engine });

    expect(outcome.source).toBe('standalone');
    expect(outcome.response).toEqual(SAFE_CLASSIFICATION);
  });

  it('should never reject, even with a hostile channel and a throwing engine', async () => {
    const channel = createFakeChannel();
    channel.send = () => {
      throw new Error('pipe closed');
    };
    const engine: StandaloneEngine = {
      domainIntelligence: () => {
        throw new Error('boom');
      },
      keywordGuard: () => {
        throw new Error('boom');
      },
      riskEngine: () => {
        throw new Error('boom');
      },
    };

    await expect(classify(REQUEST, { channel, engine })).resolves.toEqual({
      source: 'standalone',
      response: SAFE_CLASSIFICATION,
    });
  });
});

describe('createStandaloneClassifier', () => {
  it('should compose domain intelligence, keyword guard and risk engine', () => {
    const engine = blockingEngine();
    const classifier = createStandaloneClassifier(engine);

    const response = classifier(REQUEST);

    expect(response).toEqual(BLOCK);
    expect(engine.domainIntelligence).toHaveBeenCalledWith('adult.example');
    expect(engine.keywordGuard).toHaveBeenCalledWith(REQUEST.metadata);
  });

  it('should return a fresh safe classification object on failure', () => {
    const classifier = createStandaloneClassifier({
      domainIntelligence: () => {
        throw new Error('down');
      },
      keywordGuard: vi.fn(),
      riskEngine: vi.fn(),
    });

    const first = classifier(REQUEST);
    first.categories.push('mutated');

    expect(classifier(REQUEST)).toEqual(SAFE_CLASSIFICATION);
  });
});
