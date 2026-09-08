import { describe, expect, it } from 'vitest';

import type { MessageSender } from '../../../src/shared/messaging';
import { MAX_MESSAGE_BYTES, validateMessage } from '../../../src/shared/messaging';

const CONTENT_SENDER: MessageSender = { id: 'self', tab: { id: 7 } };
const PAGE_SENDER: MessageSender = { id: 'self', url: 'chrome-extension://self/popup.html' };

describe('validateMessage', () => {
  it('should return the normalized message for a well-formed request', () => {
    const raw = { type: 'scan:request', payload: { hostname: 'example.com' } };

    expect(validateMessage(raw, CONTENT_SENDER)).toEqual({
      type: 'scan:request',
      payload: { hostname: 'example.com' },
    });
  });

  it('should return the message for a payload-less type from an extension page', () => {
    expect(validateMessage({ type: 'popup:status-request' }, PAGE_SENDER)).toEqual({
      type: 'popup:status-request',
    });
  });

  it('should return the normalized message for a well-formed scan:result', () => {
    const raw = { type: 'scan:result', payload: { hostname: 'example.com', blocked: true } };

    expect(validateMessage(raw, PAGE_SENDER)).toEqual({
      type: 'scan:result',
      payload: { hostname: 'example.com', blocked: true },
    });
  });

  it('should reject a message carrying an unknown property', () => {
    const raw = { type: 'scan:request', payload: { hostname: 'example.com' }, action: 'run' };

    expect(validateMessage(raw, CONTENT_SENDER)).toBeNull();
  });

  it('should reject an unknown property nested in the payload', () => {
    const raw = { type: 'scan:request', payload: { hostname: 'example.com', depth: 2 } };

    expect(validateMessage(raw, CONTENT_SENDER)).toBeNull();
  });

  it('should reject an oversized payload', () => {
    const raw = { type: 'scan:request', payload: { hostname: 'a'.repeat(MAX_MESSAGE_BYTES + 1) } };

    expect(validateMessage(raw, CONTENT_SENDER)).toBeNull();
  });

  it('should reject a non-existent message type', () => {
    expect(validateMessage({ type: 'scan:everything' }, CONTENT_SENDER)).toBeNull();
  });

  it('should reject an unrecognized sender', () => {
    const raw = { type: 'scan:request', payload: { hostname: 'example.com' } };

    expect(validateMessage(raw, { url: 'https://evil.example/' })).toBeNull();
    expect(validateMessage(raw, {})).toBeNull();
    expect(validateMessage(raw, null as unknown as MessageSender)).toBeNull();
    expect(validateMessage(raw, { tab: { id: 'x' } } as unknown as MessageSender)).toBeNull();
  });

  it('should reject a valid type delivered from the wrong sender kind', () => {
    const raw = { type: 'scan:request', payload: { hostname: 'example.com' } };

    expect(validateMessage(raw, PAGE_SENDER)).toBeNull();
  });

  it('should reject non-object, non-string-type and malformed payloads', () => {
    expect(validateMessage('scan:request', CONTENT_SENDER)).toBeNull();
    expect(validateMessage(null, CONTENT_SENDER)).toBeNull();
    expect(validateMessage(['scan:request'], CONTENT_SENDER)).toBeNull();
    expect(validateMessage({ type: 42 }, CONTENT_SENDER)).toBeNull();
    expect(validateMessage({ type: 'scan:request' }, CONTENT_SENDER)).toBeNull();
    expect(validateMessage({ type: 'scan:request', payload: { hostname: '' } }, CONTENT_SENDER)).toBeNull();
    expect(
      validateMessage({ type: 'scan:result', payload: { hostname: 'x', blocked: 'yes' } }, PAGE_SENDER),
    ).toBeNull();
    expect(
      validateMessage({ type: 'popup:status-request', payload: {} }, PAGE_SENDER),
    ).toBeNull();
  });

  it('should reject a message that cannot be serialized for size checking', () => {
    const circular: Record<string, unknown> = { type: 'scan:request' };
    circular['self'] = circular;

    expect(validateMessage(circular, CONTENT_SENDER)).toBeNull();
  });
});
