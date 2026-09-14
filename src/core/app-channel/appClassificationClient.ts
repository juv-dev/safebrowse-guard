import { MAX_MESSAGE_BYTES } from '../../shared/messaging';

export const APP_RESPONSE_TIMEOUT_MS = 250;

export interface ClassifyRequest {
  type: 'classify';
  hostname: string;
  metadata: Record<string, unknown>;
}

export interface ClassifyResponse {
  decision: 'allow' | 'block' | 'unknown';
  riskScore: number;
  categories: string[];
}

export interface AppChannel {
  send(message: ClassifyRequest): void;
  onMessage(handler: (raw: unknown) => void): void;
  onDisconnect(handler: () => void): void;
}

export type LocalClassifier = (request: ClassifyRequest) => ClassifyResponse;

export interface AppClassificationOptions {
  timeoutMs?: number;
}

const DECISIONS: readonly ClassifyResponse['decision'][] = ['allow', 'block', 'unknown'];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function withinSizeLimit(value: unknown): boolean {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length <= MAX_MESSAGE_BYTES;
  } catch {
    return false;
  }
}

function hasOnlyKeys(object: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(object).every((key) => allowed.includes(key));
}

export function isClassifyRequest(value: unknown): value is ClassifyRequest {
  return (
    isPlainObject(value) &&
    hasOnlyKeys(value, ['type', 'hostname', 'metadata']) &&
    value['type'] === 'classify' &&
    typeof value['hostname'] === 'string' &&
    value['hostname'] !== '' &&
    isPlainObject(value['metadata'])
  );
}

export function validateClassifyResponse(raw: unknown): ClassifyResponse | null {
  if (!withinSizeLimit(raw) || !isPlainObject(raw)) {
    return null;
  }
  if (!hasOnlyKeys(raw, ['decision', 'riskScore', 'categories'])) {
    return null;
  }

  const decision = raw['decision'];
  const riskScore = raw['riskScore'];
  const categories = raw['categories'];

  if (typeof decision !== 'string' || !DECISIONS.includes(decision as ClassifyResponse['decision'])) {
    return null;
  }
  if (typeof riskScore !== 'number' || !Number.isFinite(riskScore)) {
    return null;
  }
  if (!Array.isArray(categories) || categories.some((entry) => typeof entry !== 'string')) {
    return null;
  }

  return {
    decision: decision as ClassifyResponse['decision'],
    riskScore,
    categories: [...(categories as string[])],
  };
}

export async function requestAppClassification(
  request: ClassifyRequest,
  channel: AppChannel,
  options: AppClassificationOptions = {},
): Promise<ClassifyResponse | null> {
  if (!isClassifyRequest(request) || !withinSizeLimit(request)) {
    return null;
  }

  return new Promise<ClassifyResponse | null>((resolve) => {
    let settled = false;

    const finish = (result: ClassifyResponse | null): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish(null);
    }, options.timeoutMs ?? APP_RESPONSE_TIMEOUT_MS);

    channel.onDisconnect(() => {
      finish(null);
    });

    channel.onMessage((raw) => {
      const response = validateClassifyResponse(raw);
      if (response !== null) {
        finish(response);
      }
    });

    try {
      channel.send(request);
    } catch {
      finish(null);
    }
  });
}

export async function classifyWithFallback(
  request: ClassifyRequest,
  channel: AppChannel,
  localClassifier: LocalClassifier,
  options: AppClassificationOptions = {},
): Promise<{ source: 'app' | 'local'; response: ClassifyResponse }> {
  const fromApp = await requestAppClassification(request, channel, options);
  if (fromApp !== null) {
    return { source: 'app', response: fromApp };
  }
  return { source: 'local', response: localClassifier(request) };
}
