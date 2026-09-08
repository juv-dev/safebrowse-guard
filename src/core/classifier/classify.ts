import type {
  AppChannel,
  ClassifyRequest,
  ClassifyResponse,
  LocalClassifier,
} from '../app-channel/appClassificationClient';
import { classifyWithFallback, validateClassifyResponse } from '../app-channel/appClassificationClient';

export const SAFE_CLASSIFICATION: ClassifyResponse = {
  decision: 'unknown',
  riskScore: 0,
  categories: [],
};

function safeClassification(): ClassifyResponse {
  return { ...SAFE_CLASSIFICATION, categories: [] };
}

export interface DomainSignal {
  category: string | null;
  score: number;
}

export interface KeywordSignal {
  categories: string[];
  score: number;
}

export interface StandaloneEngine {
  domainIntelligence: (hostname: string) => DomainSignal;
  keywordGuard: (metadata: Record<string, unknown>) => KeywordSignal;
  riskEngine: (input: {
    hostname: string;
    domain: DomainSignal;
    keyword: KeywordSignal;
  }) => ClassifyResponse;
}

export interface ClassificationDeps {
  channel: AppChannel;
  engine: StandaloneEngine;
  timeoutMs?: number;
}

export interface ClassificationOutcome {
  source: 'app' | 'standalone';
  response: ClassifyResponse;
}

export function createStandaloneClassifier(engine: StandaloneEngine): LocalClassifier {
  return (request) => {
    try {
      const domain = engine.domainIntelligence(request.hostname);
      const keyword = engine.keywordGuard(request.metadata);
      const raw = engine.riskEngine({ hostname: request.hostname, domain, keyword });
      return validateClassifyResponse(raw) ?? safeClassification();
    } catch {
      return safeClassification();
    }
  };
}

export async function classify(
  request: ClassifyRequest,
  deps: ClassificationDeps,
): Promise<ClassificationOutcome> {
  const standalone = createStandaloneClassifier(deps.engine);
  const options = deps.timeoutMs === undefined ? {} : { timeoutMs: deps.timeoutMs };

  const result = await classifyWithFallback(request, deps.channel, standalone, options);

  return {
    source: result.source === 'app' ? 'app' : 'standalone',
    response: result.response,
  };
}
