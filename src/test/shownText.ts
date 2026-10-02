/** Text a child sees in an element, with each in-play picture read back as the emoji it replaces (`<Emoji>` renders an `<img data-emoji>`, which has no textContent). */
export function shownText(element: Element | null): string {
  if (!element) return '';
  return [...element.childNodes]
    .map((node) => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
      if (!(node instanceof Element)) return '';
      return node.getAttribute('data-emoji') ?? shownText(node);
    })
    .join('');
}
