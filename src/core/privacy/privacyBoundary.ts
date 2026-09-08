const PROTECTED_SELECTOR = [
  'input',
  'textarea',
  'select',
  'option',
  'form',
  '[contenteditable]',
  '[role="textbox"]',
  '[role="searchbox"]',
  '[role="combobox"]',
  '[role="spinbutton"]',
].join(', ');

export function isProtectedElement(el: Element): boolean {
  return el.closest(PROTECTED_SELECTOR) !== null;
}

export function getSafeScanRoot(root: Element): Element[] {
  if (isProtectedElement(root)) {
    return [];
  }

  if (root.querySelector(PROTECTED_SELECTOR) === null) {
    return [root];
  }

  const safeRoots: Element[] = [];
  for (const child of Array.from(root.children)) {
    safeRoots.push(...getSafeScanRoot(child));
  }
  return safeRoots;
}
