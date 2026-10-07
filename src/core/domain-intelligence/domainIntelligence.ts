import { normalizeHostname } from '../normalization/textNormalization';
import { PRELOADED_ADULT_DOMAINS, PRELOADED_ADULT_DOMAIN_METADATA } from './preloadedAdultDomains';

export interface LocalBlockRule {
  hostname: string;
  category?: string;
  createdAt: string;
}

export interface DomainClassification {
  category: string;
  confidence: number;
  source: 'local-block-rule' | 'preloaded-domain-list';
  metadata?: typeof PRELOADED_ADULT_DOMAIN_METADATA;
}

const PRELOADED_DOMAIN_SET = new Set(PRELOADED_ADULT_DOMAINS);

function hostMatchesRule(hostname: string, ruleHost: string): boolean {
  return hostname === ruleHost || hostname.endsWith(`.${ruleHost}`);
}

export function classifyDomain(
  hostname: string,
  localBlockRules: readonly LocalBlockRule[] = [],
): DomainClassification | null {
  const normalizedHostname = normalizeHostname(hostname);

  if (normalizedHostname === '') {
    return null;
  }

  for (const rule of localBlockRules) {
    const normalizedRuleHost = normalizeHostname(rule.hostname);
    if (normalizedRuleHost !== '' && hostMatchesRule(normalizedHostname, normalizedRuleHost)) {
      return {
        category: rule.category ?? 'local-blocked',
        confidence: 1,
        source: 'local-block-rule',
      };
    }
  }

  for (const listedDomain of PRELOADED_DOMAIN_SET) {
    if (hostMatchesRule(normalizedHostname, listedDomain)) {
      return {
        category: 'adult-content',
        confidence: 0.95,
        source: 'preloaded-domain-list',
        metadata: PRELOADED_ADULT_DOMAIN_METADATA,
      };
    }
  }

  return null;
}
