export const MAX_MESSAGE_BYTES = 8 * 1024;

export interface MessageSender {
  id?: string;
  url?: string;
  tab?: { id: number };
}

export type Message =
  | { type: 'scan:request'; payload: { hostname: string } }
  | { type: 'scan:result'; payload: { hostname: string; blocked: boolean } }
  | { type: 'popup:status-request' };

export type MessageType = Message['type'];

type SenderKind = 'content-script' | 'extension-page';

type MessageSchema =
  | { readonly sender: SenderKind; readonly hasPayload: false }
  | {
      readonly sender: SenderKind;
      readonly hasPayload: true;
      readonly payloadKeys: readonly string[];
      isValidPayload(payload: Record<string, unknown>): boolean;
    };

const EXTENSION_URL = /^(chrome-extension|moz-extension|safari-web-extension):\/\//;

const SCHEMAS: Record<MessageType, MessageSchema> = {
  'scan:request': {
    sender: 'content-script',
    hasPayload: true,
    payloadKeys: ['hostname'],
    isValidPayload: (payload) => typeof payload['hostname'] === 'string' && payload['hostname'] !== '',
  },
  'scan:result': {
    sender: 'extension-page',
    hasPayload: true,
    payloadKeys: ['hostname', 'blocked'],
    isValidPayload: (payload) =>
      typeof payload['hostname'] === 'string' &&
      payload['hostname'] !== '' &&
      typeof payload['blocked'] === 'boolean',
  },
  'popup:status-request': {
    sender: 'extension-page',
    hasPayload: false,
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function withinSizeLimit(raw: unknown): boolean {
  try {
    return new TextEncoder().encode(JSON.stringify(raw)).length <= MAX_MESSAGE_BYTES;
  } catch {
    return false;
  }
}

function senderKind(sender: unknown): SenderKind | undefined {
  if (!isPlainObject(sender)) {
    return undefined;
  }
  const tab = sender['tab'];
  if (isPlainObject(tab) && typeof tab['id'] === 'number') {
    return 'content-script';
  }
  if (typeof sender['url'] === 'string' && EXTENSION_URL.test(sender['url'])) {
    return 'extension-page';
  }
  return undefined;
}

function isKnownType(value: unknown): value is MessageType {
  return typeof value === 'string' && Object.hasOwn(SCHEMAS, value);
}

function hasOnlyKeys(object: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(object).every((key) => allowed.includes(key));
}

export function validateMessage(raw: unknown, sender: MessageSender): Message | null {
  if (!withinSizeLimit(raw) || !isPlainObject(raw) || !isKnownType(raw['type'])) {
    return null;
  }

  const schema = SCHEMAS[raw['type']];

  if (senderKind(sender) !== schema.sender) {
    return null;
  }

  if (!schema.hasPayload) {
    return hasOnlyKeys(raw, ['type']) ? ({ type: raw['type'] } as Message) : null;
  }

  const payload = raw['payload'];
  if (
    !hasOnlyKeys(raw, ['type', 'payload']) ||
    !isPlainObject(payload) ||
    !hasOnlyKeys(payload, schema.payloadKeys) ||
    !schema.isValidPayload(payload)
  ) {
    return null;
  }

  return { type: raw['type'], payload } as Message;
}
