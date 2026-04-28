type Restore = () => void;
type PaddingProperty = 'paddingLeft' | 'paddingRight';

const LOCK_ATTRIBUTE = 'data-m3-scroll-lock';
const noop = () => {};

let lockCount = 0;
let restoreScrollLock: Restore | undefined;

function assignStyle(
  element: HTMLElement | null | undefined,
  style: Partial<CSSStyleDeclaration>,
): Restore | undefined {
  if (!element) {
    return undefined;
  }

  const previousStyle = element.style.cssText;
  Object.assign(element.style, style);

  return () => {
    element.style.cssText = previousStyle;
  };
}

function setCSSProperty(element: HTMLElement | null | undefined, property: string, value: string): Restore | undefined {
  if (!element) {
    return undefined;
  }

  const previousValue = element.style.getPropertyValue(property);
  element.style.setProperty(property, value);

  return () => {
    if (previousValue) {
      element.style.setProperty(property, previousValue);
      return;
    }

    element.style.removeProperty(property);
  };
}

function getPaddingProperty(documentElement: HTMLElement): PaddingProperty {
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;

  return scrollbarX ? 'paddingLeft' : 'paddingRight';
}

function isIOS(window: Window) {
  const { maxTouchPoints, platform, userAgent } = window.navigator;

  return (
    /iP(ad|hone|od)/.test(platform) ||
    (platform === 'MacIntel' && maxTouchPoints > 1) ||
    /iP(ad|hone|od)/.test(userAgent)
  );
}

function createScrollLock(document: Document, window: Window): Restore | undefined {
  const { body, documentElement } = document;

  if (!body || !documentElement) {
    return undefined;
  }

  if (body.hasAttribute(LOCK_ATTRIBUTE)) {
    return undefined;
  }

  body.setAttribute(LOCK_ATTRIBUTE, '');

  const scrollbarWidth = Math.max(0, window.innerWidth - documentElement.clientWidth);
  const restoreScrollbarWidth = setCSSProperty(documentElement, '--scrollbar-width', `${scrollbarWidth}px`);
  const paddingProperty = getPaddingProperty(documentElement);
  const scrollbarSidePadding = window.getComputedStyle(body)[paddingProperty] || '0px';

  const restoreBodyStyle = isIOS(window)
    ? lockIOSScroll(body, window, paddingProperty, scrollbarSidePadding, scrollbarWidth)
    : lockStandardScroll(body, paddingProperty, scrollbarSidePadding, scrollbarWidth);

  return () => {
    restoreScrollbarWidth?.();
    restoreBodyStyle?.();
    body.removeAttribute(LOCK_ATTRIBUTE);
  };
}

function lockStandardScroll(
  body: HTMLElement,
  paddingProperty: PaddingProperty,
  scrollbarSidePadding: string,
  scrollbarWidth: number,
) {
  return assignStyle(body, {
    overflow: 'hidden',
    [paddingProperty]: `calc(${scrollbarSidePadding} + ${scrollbarWidth}px)`,
  });
}

function lockIOSScroll(
  body: HTMLElement,
  window: Window,
  paddingProperty: PaddingProperty,
  scrollbarSidePadding: string,
  scrollbarWidth: number,
) {
  const { scrollX, scrollY, visualViewport } = window;
  const offsetLeft = visualViewport?.offsetLeft ?? 0;
  const offsetTop = visualViewport?.offsetTop ?? 0;
  const restoreStyle = assignStyle(body, {
    position: 'fixed',
    overflow: 'hidden',
    top: `${-(scrollY - Math.floor(offsetTop))}px`,
    left: `${-(scrollX - Math.floor(offsetLeft))}px`,
    right: '0',
    [paddingProperty]: `calc(${scrollbarSidePadding} + ${scrollbarWidth}px)`,
  });

  return () => {
    restoreStyle?.();
    window.scrollTo(scrollX, scrollY);
  };
}

export function lockPageScroll(documentToLock?: Document) {
  const document = documentToLock ?? (typeof globalThis.document === 'undefined' ? undefined : globalThis.document);
  const window = document?.defaultView ?? (typeof globalThis.window === 'undefined' ? undefined : globalThis.window);

  if (!document || !window) {
    return noop;
  }

  if (lockCount === 0) {
    restoreScrollLock = createScrollLock(document, window);

    if (!restoreScrollLock) {
      return noop;
    }
  }

  lockCount += 1;
  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    lockCount = Math.max(0, lockCount - 1);

    if (lockCount > 0) {
      return;
    }

    restoreScrollLock?.();
    restoreScrollLock = undefined;
  };
}
