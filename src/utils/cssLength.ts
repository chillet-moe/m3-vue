const defaultFontSize = () => 16;

function parseCssLength(
  value: string | undefined,
  fallback: number,
  readFontSize = defaultFontSize,
  readRootFontSize = defaultFontSize,
) {
  if (!value) return fallback;

  const trimmed = value.trim();
  const numericValue = Number.parseFloat(trimmed);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  if (trimmed.endsWith('rem')) {
    return numericValue * readRootFontSize();
  }

  if (trimmed.endsWith('em')) {
    return numericValue * readFontSize();
  }

  return numericValue;
}

export function createCssLengthReader(element: Element) {
  const { defaultView, documentElement } = element.ownerDocument;
  const styles = defaultView!.getComputedStyle(element);
  let fontSize: number | undefined;
  let rootFontSize: number | undefined;

  const readFontSize = () => (fontSize ??= parseCssLength(styles.fontSize, defaultFontSize()));
  const readRootFontSize = () =>
    (rootFontSize ??= Number.parseFloat(defaultView!.getComputedStyle(documentElement).fontSize));

  return (token: string, propValue: string | undefined, fallback: number) =>
    parseCssLength(propValue ?? styles.getPropertyValue(token), fallback, readFontSize, readRootFontSize);
}
