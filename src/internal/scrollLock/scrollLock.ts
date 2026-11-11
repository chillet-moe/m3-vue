type Restore = () => void;
type PaddingProperty = 'padding-left' | 'padding-right';

const LOCK_ATTRIBUTE = 'data-m3-scroll-lock';
const noop = () => {};

const locks = new WeakMap<Document, { count: number; restore: Restore }>();

function setStyles(element: HTMLElement, styles: Record<string, string>): Restore {
  const previousStyles = Object.entries(styles).map(([property, value]) => {
    const previous = {
      property,
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority(property),
    };
    element.style.setProperty(property, value);
    return previous;
  });

  return () => {
    for (const { property, value, priority } of previousStyles) {
      element.style.setProperty(property, value, priority);
    }
  };
}

function getPaddingProperty(documentElement: HTMLElement): PaddingProperty {
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;

  return scrollbarX ? 'padding-left' : 'padding-right';
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
  const restoreScrollbarWidth = setStyles(documentElement, { '--scrollbar-width': `${scrollbarWidth}px` });
  const paddingProperty = getPaddingProperty(documentElement);
  const scrollbarSidePadding = window.getComputedStyle(body).getPropertyValue(paddingProperty) || '0px';

  const restoreBodyStyle = isIOS(window)
    ? lockIOSScroll(body, window, paddingProperty, scrollbarSidePadding, scrollbarWidth)
    : lockStandardScroll(body, paddingProperty, scrollbarSidePadding, scrollbarWidth);

  return () => {
    restoreScrollbarWidth();
    restoreBodyStyle();
    body.removeAttribute(LOCK_ATTRIBUTE);
  };
}

function lockStandardScroll(
  body: HTMLElement,
  paddingProperty: PaddingProperty,
  scrollbarSidePadding: string,
  scrollbarWidth: number,
) {
  return setStyles(body, {
    'overflow-x': 'hidden',
    'overflow-y': 'hidden',
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
  const restoreStyle = setStyles(body, {
    position: 'fixed',
    'overflow-x': 'hidden',
    'overflow-y': 'hidden',
    top: `${-(scrollY - Math.floor(offsetTop))}px`,
    left: `${-(scrollX - Math.floor(offsetLeft))}px`,
    right: '0',
    [paddingProperty]: `calc(${scrollbarSidePadding} + ${scrollbarWidth}px)`,
  });

  return () => {
    restoreStyle();
    window.scrollTo(scrollX, scrollY);
  };
}

export function lockPageScroll(documentToLock?: Document) {
  const document = documentToLock ?? (typeof globalThis.document === 'undefined' ? undefined : globalThis.document);
  const window = document?.defaultView;

  if (!document || !window) {
    return noop;
  }

  let lock = locks.get(document);
  if (!lock) {
    const restore = createScrollLock(document, window);
    if (!restore) return noop;
    const releaseAll = () => {
      window.removeEventListener('pagehide', onPageHide);
      restore();
      locks.delete(document);
    };
    const onPageHide = (event: PageTransitionEvent) => {
      if (!event.persisted) releaseAll();
    };
    lock = { count: 0, restore: releaseAll };
    locks.set(document, lock);
    window.addEventListener('pagehide', onPageHide);
  }
  lock.count += 1;
  let released = false;
  return () => {
    if (released || locks.get(document) !== lock) return;
    released = true;
    if (--lock.count > 0) return;
    lock.restore();
  };
}
