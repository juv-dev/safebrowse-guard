import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const rootDir = fileURLToPath(new URL('../../', import.meta.url));

function fixture(name: string): string {
  return readFileSync(new URL(`../fixtures/csp-violations/${name}`, import.meta.url), 'utf8');
}

async function lintRuleIds(source: string): Promise<string[]> {
  const eslint = new ESLint({ cwd: rootDir });
  const [result] = await eslint.lintText(source, { filePath: `${rootDir}csp-lint-probe.js` });
  return (result?.messages ?? []).map((message) => message.ruleId ?? '');
}

describe('zero-remote-code lint policy', () => {
  it('should reject new Function, eval, string timers and remote or dynamic import()', async () => {
    const ruleIds = await lintRuleIds(fixture('remote-code.js'));

    expect(ruleIds).toContain('no-new-func');
    expect(ruleIds).toContain('no-eval');
    expect(ruleIds.filter((id) => id === 'no-restricted-syntax')).toHaveLength(4);
  });

  it('should reject a bare new Function(...) probe module', async () => {
    const ruleIds = await lintRuleIds('export const compiled = new Function("return 1");\n');

    expect(ruleIds).toContain('no-new-func');
  });

  it('should allow function-reference timers and a local dynamic import()', async () => {
    const ruleIds = await lintRuleIds(fixture('allowed-code.js'));

    expect(ruleIds).not.toContain('no-new-func');
    expect(ruleIds).not.toContain('no-eval');
    expect(ruleIds).not.toContain('no-implied-eval');
    expect(ruleIds).not.toContain('no-restricted-syntax');
  });

  it('should keep the policy rules declared in the committed eslint config', () => {
    const config = readFileSync(new URL('../../eslint.config.js', import.meta.url), 'utf8');

    for (const rule of ['no-eval', 'no-implied-eval', 'no-new-func', 'no-restricted-syntax']) {
      expect(config).toContain(rule);
    }
    expect(config).toContain('ImportExpression');
  });
});
