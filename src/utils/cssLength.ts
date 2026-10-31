function parseCssLength(value: string | undefined, fallback: number, fontSize = 16, rootFontSize = 16) {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  const numericValue = Number.parseFloat(trimmed);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  if (trimmed.endsWith('rem')) {
    return numericValue * rootFontSize;
  }

  if (trimmed.endsWith('em')) {
    return numericValue * fontSize;
  }

  return numericValue;
}

export function readCssLength(
  styles: CSSStyleDeclaration,
  token: string,
  propValue: string | undefined,
  fallback: number,
  rootFontSize = 16,
) {
  const fontSize = parseCssLength(styles.fontSize, 16);
  return parseCssLength(propValue ?? styles.getPropertyValue(token), fallback, fontSize, rootFontSize);
}
