import { describe, expect, it, vi } from 'vitest';

import { classifyDomain } from '../../../src/core/domain-intelligence/domainIntelligence';
import { PRELOADED_ADULT_DOMAIN_METADATA } from '../../../src/core/domain-intelligence/preloadedAdultDomains';

describe('classifyDomain', () => {
  it('should prioritize local block rules before the preloaded domain list', () => {
    const result = classifyDomain('adult-example.test', [
      { hostname: 'adult-example.test', category: 'custom-local', createdAt: '2026-10-07T00:00:00.000Z' },
    ]);

    expect(result).toEqual({
      category: 'custom-local',
      confidence: 1,
      source: 'local-block-rule',
    });
  });

  it('should classify preloaded adult domains and subdomains', () => {
    expect(classifyDomain('www.hentai-example.test')).toEqual({
      category: 'adult-content',
      confidence: 0.95,
      source: 'preloaded-domain-list',
      metadata: PRELOADED_ADULT_DOMAIN_METADATA,
    });
  });

  it('should return null for normal domains', () => {
    expect(classifyDomain('github.com')).toBeNull();
  });

  it('should normalize hostnames before matching', () => {
    expect(classifyDomain('ADULT-EXAMPLE．TEST')?.source).toBe('preloaded-domain-list');
  });

  it('should short-circuit a downstream classifier when domain intelligence resolves', () => {
    const downstream = vi.fn();
    const result = classifyDomain('rule34-example.test');

    if (result === null) {
      downstream();
    }

    expect(result?.category).toBe('adult-content');
    expect(downstream).not.toHaveBeenCalled();
  });
});
