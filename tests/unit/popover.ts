const openAttribute = 'data-test-popover-open';
let installed = false;

export function isPopoverOpen(element: Element | null) {
  return element?.hasAttribute(openAttribute) ?? false;
}

export function installPopoverPolyfill() {
  if (installed) return;
  installed = true;

  // jsdom applies the closed popover stylesheet but does not implement the Popover API.
  const style = document.createElement('style');
  style.textContent = `[popover][${openAttribute}] { display: block; }`;
  document.head.append(style);

  const matches = Element.prototype.matches;
  Element.prototype.matches = function (this: Element, selector: string) {
    return selector === ':popover-open' ? isPopoverOpen(this) : matches.call(this, selector);
  } as typeof matches;

  function dispatchToggle(element: HTMLElement, type: 'beforetoggle' | 'toggle', opening: boolean) {
    const event = new Event(type, { cancelable: type === 'beforetoggle' && opening });
    Object.defineProperties(event, {
      oldState: { value: opening ? 'closed' : 'open' },
      newState: { value: opening ? 'open' : 'closed' },
    });
    return element.dispatchEvent(event);
  }

  Object.defineProperties(HTMLElement.prototype, {
    showPopover: {
      configurable: true,
      value(this: HTMLElement, options?: { source?: HTMLElement }) {
        if (isPopoverOpen(this) || !dispatchToggle(this, 'beforetoggle', true)) return;

        const source = options?.source;
        if (source) {
          this.dataset.popoverSourceId =
            source.id || source.textContent?.trim() || source.getAttribute('aria-label') || 'source';
        }
        this.setAttribute(openAttribute, '');
        dispatchToggle(this, 'toggle', true);
      },
    },
    hidePopover: {
      configurable: true,
      value(this: HTMLElement) {
        if (!isPopoverOpen(this)) return;

        dispatchToggle(this, 'beforetoggle', false);
        this.removeAttribute(openAttribute);
        delete this.dataset.popoverSourceId;
        dispatchToggle(this, 'toggle', false);
      },
    },
  });
}
