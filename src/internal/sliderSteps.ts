export function isValidStep(step: number) {
  return Number.isFinite(step) && step > 0;
}

export function normalizeValuePrecision(value: number) {
  const normalized = Number(value.toPrecision(15));
  return Object.is(normalized, -0) ? 0 : normalized;
}

export function snapSliderValue(value: number, min: number, max: number, step: number) {
  const clampedValue = Math.min(max, Math.max(min, value));
  if (!isValidStep(step) || min === max) {
    return clampedValue;
  }

  const stepIndex = Math.round((clampedValue - min) / step);
  const steppedValue = normalizeValuePrecision(min + stepIndex * step);
  const steppedCandidate = Math.min(max, Math.max(min, steppedValue));

  // The upper endpoint is always selectable, even when the final interval is shorter than one step.
  return Math.abs(max - clampedValue) <= Math.abs(steppedCandidate - clampedValue) ? max : steppedCandidate;
}

// Count from the next grid point in the direction of travel, including a shortened final interval.
export function moveSliderSteps(value: number, count: number, min: number, max: number, step: number) {
  const current = Math.min(max, Math.max(min, value));
  if (!isValidStep(step) || min === max || count === 0) return current;

  const index = (current - min) / step;
  const base = count > 0 ? Math.floor(index + 1e-10) : Math.ceil(index - 1e-10);
  const next = normalizeValuePrecision(min + (base + count) * step);
  return Math.min(max, Math.max(min, next));
}
