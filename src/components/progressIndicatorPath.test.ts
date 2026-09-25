import { describe, expect, it } from 'vitest';
import { getCircularTrackGapDegrees } from './progressIndicatorPath';

describe('progressIndicatorPath', () => {
  it('compensates circular centerline gap for SVG round caps', () => {
    const degrees = getCircularTrackGapDegrees(4, 4, 18);
    expect(degrees).toBeCloseTo((8 / 18) * (180 / Math.PI), 5);
  });

  it('ramps determinate circular gap down to zero at empty progress', () => {
    expect(getCircularTrackGapDegrees(4, 4, 18, 0)).toBe(0);
  });
});
