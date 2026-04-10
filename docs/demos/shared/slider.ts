export const numericFormatter = {
  valueToText: (value: number) => `${value}`,
  textToValue: (text?: string) => (text ? Number(text) : undefined),
};

export function createStops(min: number, max: number, step: number) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(step) || step <= 0 || max < min) {
    return undefined;
  }

  const length = Math.floor((max - min) / step) + 1;

  return Array.from({ length }, (_, index) => {
    return Number((min + index * step).toFixed(4));
  });
}
