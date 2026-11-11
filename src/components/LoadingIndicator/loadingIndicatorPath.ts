import {
  pathAnimatableFourSidedCookie,
  pathAnimatableNineSidedCookie,
  pathAnimatableOval,
  pathAnimatablePentagon,
  pathAnimatablePill,
  pathAnimatableSoftBurst,
  pathAnimatableSunny,
} from '../../shapes/animatable';
import { formatBoundedCoordinate } from '../../utils/svgPath';

export type LoadingIndicatorFrame = {
  path: string;
  rotation: number;
};

const DURATION_PER_SHAPE_MS = 650;
const CONSTANT_ROTATION_PER_SHAPE_DEGREES = 50;
const EXTRA_ROTATION_PER_SHAPE_DEGREES = 90;

const positiveModulo = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;

const shapes = [
  pathAnimatableSoftBurst,
  pathAnimatableNineSidedCookie,
  pathAnimatablePentagon,
  pathAnimatablePill,
  pathAnimatableSunny,
  pathAnimatableFourSidedCookie,
  pathAnimatableOval,
] as const;

const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

type ParsedPath = {
  coordinates: number[];
  restingPath?: string;
};

// The morph assets share one relative move, implicit line segments and a close command.
const parsedShapes: ParsedPath[] = shapes.map((path) => ({
  coordinates: path.slice(1, -2).split(' ').map(Number),
}));

const interpolatePath = (from: ParsedPath, to: ParsedPath, amount: number) => {
  if (from.coordinates.length !== to.coordinates.length) {
    return amount < 0.5 ? shapes[0] : shapes[1];
  }

  // The clamped spring holds its endpoint while rotation continues.
  if (amount === 0 && from.restingPath !== undefined) return from.restingPath;

  let path = 'm' + formatBoundedCoordinate(mix(from.coordinates[0], to.coordinates[0], amount));
  for (let index = 1; index < from.coordinates.length; index++) {
    path += ' ' + formatBoundedCoordinate(mix(from.coordinates[index], to.coordinates[index], amount));
  }
  path += ' z';
  if (amount === 0) from.restingPath = path;
  return path;
};

const springEase = (value: number) => {
  if (value <= 0) {
    return 0;
  }

  if (value >= 1) {
    return 1;
  }

  return Math.min(1, Math.max(0, 1 - Math.exp(-6 * value) * Math.cos(10 * value)));
};

const createLoadingIndicatorPath = (morphFraction: number) => {
  const shapeMorphFraction = Math.floor(morphFraction);
  const shapeIndex = positiveModulo(shapeMorphFraction, parsedShapes.length);
  const nextShapeIndex = (shapeIndex + 1) % parsedShapes.length;
  const fractionPerShape = morphFraction - shapeMorphFraction;

  return interpolatePath(parsedShapes[shapeIndex], parsedShapes[nextShapeIndex], fractionPerShape);
};

export const staticLoadingIndicatorFrame = {
  path: shapes[0],
  rotation: 0,
} as const;

export const getLoadingIndicatorFrame = (elapsedMs: number): LoadingIndicatorFrame => {
  const elapsed = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
  const shapeIndex = Math.floor(elapsed / DURATION_PER_SHAPE_MS);
  const timeFactorPerShape = (elapsed - shapeIndex * DURATION_PER_SHAPE_MS) / DURATION_PER_SHAPE_MS;
  const morphFactorPerShape = springEase(timeFactorPerShape);
  const morphFraction = shapeIndex + morphFactorPerShape;
  const rotation =
    (shapeIndex * (CONSTANT_ROTATION_PER_SHAPE_DEGREES + EXTRA_ROTATION_PER_SHAPE_DEGREES) +
      CONSTANT_ROTATION_PER_SHAPE_DEGREES * timeFactorPerShape +
      EXTRA_ROTATION_PER_SHAPE_DEGREES * morphFactorPerShape) %
    360;

  return {
    path: createLoadingIndicatorPath(morphFraction),
    rotation,
  };
};
