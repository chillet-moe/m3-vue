export function formatCoordinate(value: number) {
  if (Math.abs(value) < 1e12) return formatBoundedCoordinate(value);

  // A very large number's shortest spelling can differ from its fixed decimal.
  return Number(value.toFixed(3)).toString();
}

/** Formats coordinates known to be smaller than 1e12 in magnitude. */
export function formatBoundedCoordinate(value: number) {
  if (Math.abs(value) < 0.0001) return '0';

  const fixed = value.toFixed(3);
  if (fixed === '-0.000') return '0';

  let end = fixed.length;
  while (fixed[end - 1] === '0') end--;
  if (fixed[end - 1] === '.') end--;
  return end === fixed.length ? fixed : fixed.slice(0, end);
}
