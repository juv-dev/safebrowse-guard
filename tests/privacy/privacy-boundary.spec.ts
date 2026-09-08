// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import { getSafeScanRoot, isProtectedElement } from '../../src/core/privacy/privacyBoundary';

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

describe('isProtectedElement', () => {
  it('should flag native form controls as protected', () => {
    render(
      '<input id="a"><textarea id="b"></textarea><select id="c"><option id="d">x</option></select><form id="e"></form>',
    );

    for (const id of ['a', 'b', 'c', 'd', 'e']) {
      expect(isProtectedElement(byId(id))).toBe(true);
    }
  });

  it('should flag contenteditable hosts as protected', () => {
    render('<div id="edit" contenteditable="true">note</div>');

    expect(isProtectedElement(byId('edit'))).toBe(true);
  });

  it('should flag ARIA text widgets as protected', () => {
    render(
      '<div id="tb" role="textbox"></div><div id="sb" role="searchbox"></div><div id="cb" role="combobox"></div><div id="sp" role="spinbutton"></div>',
    );

    for (const id of ['tb', 'sb', 'cb', 'sp']) {
      expect(isProtectedElement(byId(id))).toBe(true);
    }
  });

  it('should flag descendants of a protected element as protected', () => {
    render('<div id="host" contenteditable="true"><span id="child"><b id="deep">hi</b></span></div>');

    expect(isProtectedElement(byId('child'))).toBe(true);
    expect(isProtectedElement(byId('deep'))).toBe(true);
  });

  it('should not flag ordinary content elements', () => {
    render('<article id="art"><h1 id="title">Title</h1><p id="p">Body copy</p></article>');

    for (const id of ['art', 'title', 'p']) {
      expect(isProtectedElement(byId(id))).toBe(false);
    }
  });
});

describe('getSafeScanRoot', () => {
  it('should return the root itself when the subtree has no protected node', () => {
    render('<article id="art"><p id="p">hello</p></article>');
    const root = byId('art');

    expect(getSafeScanRoot(root)).toEqual([root]);
  });

  it('should return an empty list when the root itself is protected', () => {
    render('<form id="f"><p id="inner">x</p></form>');

    expect(getSafeScanRoot(byId('f'))).toEqual([]);
  });

  it('should exclude protected nodes and their subtree while keeping safe siblings', () => {
    render(
      '<section id="root"><p id="safe1">visible one</p><form id="form"><input id="cred"><label id="lbl">Password</label></form><div id="safe2"><span id="safe2child">visible two</span></div></section>',
    );

    const roots = getSafeScanRoot(byId('root'));
    const ids = roots.map((el) => el.id);

    expect(ids).toContain('safe1');
    expect(ids).toContain('safe2');
    expect(ids).not.toContain('form');
    expect(ids).not.toContain('cred');
    expect(ids).not.toContain('lbl');

    for (const el of roots) {
      expect(el.querySelector('input, form')).toBeNull();
      expect(isProtectedElement(el)).toBe(false);
    }
  });

  it('should recurse through nested wrappers to reach safe leaves around protected nodes', () => {
    render(
      '<div id="root"><div id="wrap"><p id="safe">keep me</p><div id="editor" role="textbox">secret draft</div></div></div>',
    );

    const roots = getSafeScanRoot(byId('root'));

    expect(roots.map((el) => el.id)).toEqual(['safe']);
  });
});
