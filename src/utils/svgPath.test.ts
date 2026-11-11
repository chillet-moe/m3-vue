import { expect, it } from 'vitest';
import { formatCoordinate } from './svgPath';

it.each([
  [12.3, '12.3'],
  [120, '120'],
  [-0.00049, '0'],
  [-0.0006, '-0.001'],
  [1.2345, '1.234'],
  [1.2355, '1.236'],
  [1e20 + 16_384, '100000000000000020000'],
  [1e21, '1e+21'],
  [Infinity, 'Infinity'],
  [NaN, 'NaN'],
] as const)('formats SVG coordinate %s as %s', (coordinate, expected) => {
  expect(formatCoordinate(coordinate)).toBe(expected);
});
