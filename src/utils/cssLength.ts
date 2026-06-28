export function parseCssLength(value: string | undefined, fallback: number, fontSize = 16) {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  const numericValue = Number.parseFloat(trimmed);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  if (trimmed.endsWith('rem') || trimmed.endsWith('em')) {
    return numericValue * fontSize;
  }

  return numericValue;
}

export function readCssLength(
  styles: CSSStyleDeclaration,
  token: string,
  propValue: string | undefined,
  fallback: number,
) {
  const fontSize = parseCssLength(styles.fontSize, 16);
  return parseCssLength(propValue ?? styles.getPropertyValue(token), fallback, fontSize);
}

export function readCssToken(styles: CSSStyleDeclaration, token: string) {
  const value = styles.getPropertyValue(token).trim();
  return value && value !== 'initial' ? value : undefined;
}
