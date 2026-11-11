import { describe, expect, it } from 'vitest';
import {
  createCircularArcPath,
  createCircularIndeterminateFrameReader,
  createCircularWaveArcPath,
  createLinearWavePath,
  getCircularIndeterminateState,
  getCircularTrackGapDegrees,
} from './progressIndicatorPath';

describe('progressIndicatorPath', () => {
  it('compensates circular centerline gap for SVG round caps', () => {
    const degrees = getCircularTrackGapDegrees(4, 4, 18);
    expect(degrees).toBeCloseTo((8 / 18) * (180 / Math.PI), 5);
  });

  it('ramps determinate circular gap down to zero at empty progress', () => {
    expect(getCircularTrackGapDegrees(4, 4, 18, 0)).toBe(0);
  });

  it('keeps different linear wave geometries distinct during a shared resize', () => {
    const base = [90, 10, 3, 30] as const;
    const alternatives = [
      [104, 10, 3, 30],
      [90, 14, 3, 30],
      [90, 10, 2, 30],
      [90, 10, 3, 23],
    ] as const;
    const basePath = createLinearWavePath(...base);

    for (const [width, height, amplitude, wavelength] of alternatives) {
      expect(createLinearWavePath(...base, true)).toBe(basePath);
      expect(createLinearWavePath(width, height, amplitude, wavelength, true)).toBe(
        createLinearWavePath(width, height, amplitude, wavelength),
      );
    }
    expect(createLinearWavePath(...base, true)).toBe(basePath);
  });

  it('uses each indicator’s elapsed time and geometry when reading paths in the same frame', () => {
    const flat = createCircularIndeterminateFrameReader(20, 18, 25);
    const wavy = createCircularIndeterminateFrameReader(20, 18, 25, { amplitude: 2, wavelength: 12 });
    const wideGap = createCircularIndeterminateFrameReader(20, 18, 32);
    const first = getCircularIndeterminateState(200);
    const second = getCircularIndeterminateState(530);

    expect(flat(200, true).active).toBe(createCircularArcPath(20, 18, first.startDegrees, first.endDegrees));
    expect(wavy(200, true).active).toBe(createCircularWaveArcPath(20, 18, first.startDegrees, first.endDegrees, 2, 12));
    expect(wideGap(200, true).track).toBe(
      createCircularArcPath(20, 18, first.endDegrees + 32, first.startDegrees + 328),
    );
    expect(flat(530, true).active).toBe(createCircularArcPath(20, 18, second.startDegrees, second.endDegrees));
    expect(flat(200, true).track).toBe(createCircularArcPath(20, 18, first.endDegrees + 25, first.startDegrees + 335));
  });
});
