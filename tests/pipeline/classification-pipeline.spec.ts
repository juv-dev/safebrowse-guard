// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

import type { PipelineStages } from '../../src/core/pipeline/classificationPipeline';
import { runClassificationPipeline } from '../../src/core/pipeline/classificationPipeline';
import { nonSensitiveHostSamples, sensitiveHostSamples } from '../fixtures/sensitive-hosts';

function createSpyStages(): PipelineStages {
  return {
    scanDom: vi.fn(),
    scanVisual: vi.fn(),
    runProvider: vi.fn(),
    log: vi.fn(),
  };
}

describe('runClassificationPipeline', () => {
  it.each(sensitiveHostSamples)(
    'should short-circuit before every downstream stage on $hostname',
    ({ hostname }) => {
      const stages = createSpyStages();

      const outcome = runClassificationPipeline({ hostname, root: document.body }, stages);

      expect(outcome).toEqual({ status: 'skipped', reason: 'sensitive-host' });
      expect(stages.scanDom).not.toHaveBeenCalled();
      expect(stages.scanVisual).not.toHaveBeenCalled();
      expect(stages.runProvider).not.toHaveBeenCalled();
      expect(stages.log).not.toHaveBeenCalled();
    },
  );

  it.each(nonSensitiveHostSamples)('should run the full pipeline on %s', (hostname) => {
    const stages = createSpyStages();
    const context = { hostname, root: document.body };

    const outcome = runClassificationPipeline(context, stages);

    expect(outcome).toEqual({ status: 'analyzed' });
    expect(stages.scanDom).toHaveBeenCalledTimes(1);
    expect(stages.scanDom).toHaveBeenCalledWith(context);
    expect(stages.scanVisual).toHaveBeenCalledTimes(1);
    expect(stages.scanVisual).toHaveBeenCalledWith(context);
    expect(stages.runProvider).toHaveBeenCalledTimes(1);
    expect(stages.runProvider).toHaveBeenCalledWith(context);
    expect(stages.log).toHaveBeenCalledTimes(1);
    expect(stages.log).toHaveBeenCalledWith({ hostname, outcome: 'analyzed' });
  });

  it('should invoke the downstream stages in DOM, visual, provider, log order', () => {
    const calls: string[] = [];
    const stages: PipelineStages = {
      scanDom: vi.fn(() => calls.push('scanDom')),
      scanVisual: vi.fn(() => calls.push('scanVisual')),
      runProvider: vi.fn(() => calls.push('runProvider')),
      log: vi.fn(() => calls.push('log')),
    };

    runClassificationPipeline({ hostname: 'example.com', root: document.body }, stages);

    expect(calls).toEqual(['scanDom', 'scanVisual', 'runProvider', 'log']);
  });
});
