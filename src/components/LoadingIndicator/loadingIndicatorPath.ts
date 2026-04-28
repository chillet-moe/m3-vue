import {
  pathAnimatableFourSidedCookie,
  pathAnimatableNineSidedCookie,
  pathAnimatableOval,
  pathAnimatablePentagon,
  pathAnimatablePill,
  pathAnimatableSoftBurst,
  pathAnimatableSunny,
} from '../../shapes/animatable';

export type LoadingIndicatorFrame = {
  path: string;
  rotation: number;
};

const DURATION_PER_SHAPE_MS = 650;
const CONSTANT_ROTATION_PER_SHAPE_DEGREES = 50;
const EXTRA_ROTATION_PER_SHAPE_DEGREES = 90;
const NUMBER_PATTERN = /-?\d+(?:\.\d+)?/g;

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
  parts: string[];
  numbers: number[];
};

const formatNumber = (value: number) => {
  const safeValue = Math.abs(value) < 0.0001 ? 0 : value;
  return Number(safeValue.toFixed(3)).toString();
};

const parsePath = (path: string): ParsedPath => {
  const parts: string[] = [];
  const numbers: number[] = [];
  let previousIndex = 0;

  for (const match of path.matchAll(NUMBER_PATTERN)) {
    parts.push(path.slice(previousIndex, match.index));
    numbers.push(Number(match[0]));
    previousIndex = (match.index ?? 0) + match[0].length;
  }

  parts.push(path.slice(previousIndex));

  return { parts, numbers };
};

const parsedShapes = shapes.map(parsePath);

const interpolatePath = (from: ParsedPath, to: ParsedPath, amount: number) => {
  if (from.numbers.length !== to.numbers.length || from.parts.length !== to.parts.length) {
    return amount < 0.5 ? shapes[0] : shapes[1];
  }

  let path = '';

  for (let index = 0; index < from.numbers.length; index++) {
    path += from.parts[index];
    path += formatNumber(mix(from.numbers[index], to.numbers[index], amount));
  }

  return path + from.parts[from.parts.length - 1];
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

export const getStaticLoadingIndicatorFrame = (): LoadingIndicatorFrame => ({
  path: shapes[0],
  rotation: 0,
});

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
