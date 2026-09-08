import { isSensitiveHost } from '../security/sensitiveSiteGuard';

export interface PipelineContext {
  hostname: string;
  root: Element;
}

export interface PipelineEvent {
  hostname: string;
  outcome: 'analyzed';
}

export interface PipelineStages {
  scanDom: (context: PipelineContext) => void;
  scanVisual: (context: PipelineContext) => void;
  runProvider: (context: PipelineContext) => void;
  log: (event: PipelineEvent) => void;
}

export type PipelineOutcome =
  | { status: 'skipped'; reason: 'sensitive-host' }
  | { status: 'analyzed' };

export function runClassificationPipeline(
  context: PipelineContext,
  stages: PipelineStages,
): PipelineOutcome {
  if (isSensitiveHost(context.hostname)) {
    return { status: 'skipped', reason: 'sensitive-host' };
  }

  stages.scanDom(context);
  stages.scanVisual(context);
  stages.runProvider(context);
  stages.log({ hostname: context.hostname, outcome: 'analyzed' });

  return { status: 'analyzed' };
}
