import { describe, expect, it } from 'vitest';
import {
  pathAnimatableFourSidedCookie,
  pathAnimatableNineSidedCookie,
  pathAnimatableOval,
  pathAnimatablePentagon,
  pathAnimatablePill,
  pathAnimatableSoftBurst,
  pathAnimatableSunny,
} from '../../shapes/animatable';
import { getLoadingIndicatorFrame } from './loadingIndicatorPath';

describe('LoadingIndicator path geometry', () => {
  const keyframes = [
    pathAnimatableSoftBurst,
    pathAnimatableNineSidedCookie,
    pathAnimatablePentagon,
    pathAnimatablePill,
    pathAnimatableSunny,
    pathAnimatableFourSidedCookie,
    pathAnimatableOval,
  ];

  it.each(keyframes.map((path, index) => ({ path, index })))(
    'preserves the authored geometry at keyframe $index',
    ({ path, index }) => {
      const actual = getLoadingIndicatorFrame(index * 650)
        .path.slice(1, -2)
        .split(' ')
        .map(Number);
      const expected = path.slice(1, -2).split(' ').map(Number);

      expect(actual).toHaveLength(expected.length);
      for (let coordinate = 0; coordinate < expected.length; coordinate++) {
        // The generated path rounds each relative coordinate to three decimal places.
        expect(Math.abs(actual[coordinate] - expected[coordinate])).toBeLessThanOrEqual(0.000500000001);
      }
    },
  );

  it.each([NaN, Infinity, -Infinity, -1])('starts at the first frame for elapsed time %s', (elapsed) => {
    expect(getLoadingIndicatorFrame(elapsed)).toEqual(getLoadingIndicatorFrame(0));
  });
});
