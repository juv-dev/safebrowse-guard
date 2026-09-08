import { getSafeScanRoot } from '../privacy/privacyBoundary';

export type SafeElementVisitor = (element: Element) => void;

export function forEachSafeElement(root: Element, visit: SafeElementVisitor): void {
  for (const safeRoot of getSafeScanRoot(root)) {
    visitSubtree(safeRoot, visit);
  }
}

export function scanSafeElements(root: Element): Element[] {
  const collected: Element[] = [];
  forEachSafeElement(root, (element) => {
    collected.push(element);
  });
  return collected;
}

export function extractSafeText(root: Element): string {
  const chunks: string[] = [];
  forEachSafeElement(root, (element) => {
    for (const child of Array.from(element.childNodes)) {
      if (child instanceof Text) {
        const text = child.data.trim();
        if (text.length > 0) {
          chunks.push(text);
        }
      }
    }
  });
  return chunks.join(' ');
}

function visitSubtree(element: Element, visit: SafeElementVisitor): void {
  visit(element);
  for (const child of Array.from(element.children)) {
    visitSubtree(child, visit);
  }
}
