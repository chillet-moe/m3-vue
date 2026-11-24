export const defaultSourceColor = '#655789';
export const isSourceColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
