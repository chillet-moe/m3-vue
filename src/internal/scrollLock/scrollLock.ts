type SavedScrollStyles = {
  bodyOverflow: string;
  bodyOverscrollBehavior: string;
  bodyPosition: string;
  bodyTop: string;
  bodyWidth: string;
  documentOverflow: string;
  documentOverscrollBehavior: string;
  documentScrollbarGutter: string;
  scrollY: number;
};

let lockCount = 0;
let savedStyles: SavedScrollStyles | undefined;

export function lockPageScroll() {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const body = document.body;
  const documentElement = document.documentElement;

  if (!body || !documentElement) {
    return () => {};
  }

  if (lockCount === 0) {
    const scrollY = typeof window === 'undefined' ? 0 : window.scrollY;

    savedStyles = {
      bodyOverflow: body.style.overflow,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      documentOverflow: documentElement.style.overflow,
      documentOverscrollBehavior: documentElement.style.overscrollBehavior,
      documentScrollbarGutter: documentElement.style.scrollbarGutter,
      scrollY,
    };

    documentElement.style.scrollbarGutter = 'stable';
    documentElement.style.overflow = 'hidden';
    documentElement.style.overscrollBehavior = 'none';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    body.style.position = 'fixed';
    body.style.top = `${-scrollY}px`;
    body.style.width = '100%';
  }

  lockCount += 1;
  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    lockCount = Math.max(0, lockCount - 1);

    if (lockCount > 0 || !savedStyles) {
      return;
    }

    documentElement.style.overflow = savedStyles.documentOverflow;
    documentElement.style.overscrollBehavior = savedStyles.documentOverscrollBehavior;
    documentElement.style.scrollbarGutter = savedStyles.documentScrollbarGutter;
    body.style.overflow = savedStyles.bodyOverflow;
    body.style.overscrollBehavior = savedStyles.bodyOverscrollBehavior;
    body.style.position = savedStyles.bodyPosition;
    body.style.top = savedStyles.bodyTop;
    body.style.width = savedStyles.bodyWidth;

    const scrollY = savedStyles.scrollY;
    savedStyles = undefined;

    if (scrollY > 0 && typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, scrollY);
    }
  };
}
