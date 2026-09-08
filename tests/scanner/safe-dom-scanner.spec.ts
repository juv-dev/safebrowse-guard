// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import { extractSafeText, forEachSafeElement, scanSafeElements } from '../../src/core/scanner/safeDomScanner';

const SENSITIVE_CANARY = 'SUPER_PRIVATE_PASSWORD_123';

function render(html: string): void {
  document.body.innerHTML = html;
}

function byId(id: string): Element {
  const el = document.getElementById(id);
  if (el === null) {
    throw new Error(`missing test element #${id}`);
  }
  return el;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('scanSafeElements', () => {
  it('should return only the public region when a form holds sensitive text', () => {
    render(
      `<section id="root">
        <form id="secret">
          <label id="lbl">Password</label>
          <input id="field" value="${SENSITIVE_CANARY}">
        </form>
        <div id="public"><p id="copy">Public article body</p></div>
      </section>`,
    );

    const scanned = scanSafeElements(byId('root'));
    const ids = scanned.map((el) => el.id);

    expect(ids).toEqual(['public', 'copy']);
    expect(scanned.some((el) => el.id === 'secret')).toBe(false);
    expect(scanned.some((el) => el.tagName === 'INPUT')).toBe(false);
  });

  it('should exclude a contenteditable nested inside a public region', () => {
    render(
      `<div id="root">
        <article id="public">
          <p id="keep">visible copy</p>
          <div id="editor" contenteditable="true">draft ${SENSITIVE_CANARY}</div>
        </article>
      </div>`,
    );

    const ids = scanSafeElements(byId('root')).map((el) => el.id);

    expect(ids).toEqual(['keep']);
    expect(ids).not.toContain('editor');
  });

  it('should exclude nested textbox, searchbox and combobox roles inside a public region', () => {
    render(
      `<div id="root">
        <section id="public">
          <p id="keep">keep this</p>
          <div id="tb" role="textbox">typed</div>
          <div id="sb" role="searchbox">query</div>
          <div id="cb" role="combobox">choice</div>
        </section>
      </div>`,
    );

    const ids = scanSafeElements(byId('root')).map((el) => el.id);

    expect(ids).toEqual(['keep']);
    for (const excluded of ['tb', 'sb', 'cb']) {
      expect(ids).not.toContain(excluded);
    }
  });

  it('should return an empty list when the whole subtree is protected', () => {
    render('<form id="root"><input id="field"></form>');

    expect(scanSafeElements(byId('root'))).toEqual([]);
  });
});

describe('forEachSafeElement', () => {
  it('should never visit a protected element or its descendants', () => {
    render(
      `<div id="root">
        <p id="a">alpha</p>
        <form id="f"><fieldset id="fs"><input id="i"></fieldset></form>
        <div id="b"><span id="c">gamma</span></div>
      </div>`,
    );

    const visited: string[] = [];
    forEachSafeElement(byId('root'), (element) => {
      visited.push(element.id);
    });

    expect(visited).toContain('a');
    expect(visited).toContain('b');
    expect(visited).toContain('c');
    for (const forbidden of ['f', 'fs', 'i']) {
      expect(visited).not.toContain(forbidden);
    }
  });
});

describe('extractSafeText', () => {
  it('should collect public text and never sensitive field content', () => {
    render(
      `<main id="root">
        <article id="pub">
          <h1 id="title">Account settings</h1>
          <p id="help">Read the docs for help</p>
        </article>
        <form id="login">
          <input id="user" value="${SENSITIVE_CANARY}">
          <div id="note" contenteditable="true">${SENSITIVE_CANARY}</div>
        </form>
      </main>`,
    );

    (byId('user') as HTMLInputElement).value = SENSITIVE_CANARY;

    const text = extractSafeText(byId('root'));

    expect(text).toContain('Account settings');
    expect(text).toContain('Read the docs for help');
    expect(text).not.toContain(SENSITIVE_CANARY);
  });

  it('should return an empty string when every readable region is protected', () => {
    render(
      `<form id="root">
        <input id="user" value="${SENSITIVE_CANARY}">
      </form>`,
    );

    expect(extractSafeText(byId('root'))).toBe('');
  });
});
