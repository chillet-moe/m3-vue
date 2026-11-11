import { formatCoordinate } from '../utils/svgPath';

const WAVE_SMOOTHNESS = 0.48;

const CIRCULAR_TOTAL_DURATION_MS = 5400;
const CIRCULAR_EXPAND_DURATION_MS = 667;
const CIRCULAR_COLLAPSE_DURATION_MS = 667;
const CIRCULAR_EXPAND_DELAYS_MS = [0, 1350, 2700, 4050];
const CIRCULAR_COLLAPSE_DELAYS_MS = [667, 2017, 3367, 4717];
const CIRCULAR_TAIL_DEGREES_OFFSET = -20;
const CIRCULAR_EXTRA_DEGREES_PER_CYCLE = 250;
const CIRCULAR_CONSTANT_ROTATION_DEGREES = 1520;

export type CircularIndeterminateState = {
  startDegrees: number;
  endDegrees: number;
};

type CircularIndeterminateFrame = { elapsed: number; active: string; track: string };
const circularIndeterminateFrames = new Map<string, CircularIndeterminateFrame>();

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function pointToString(point: Point) {
  return `${formatCoordinate(point.x)} ${formatCoordinate(point.y)}`;
}

type Point = {
  x: number;
  y: number;
};

function getFractionInRange(playtime: number, delay: number, duration: number) {
  return clamp((playtime - delay) / duration, 0, 1);
}

function cubicBezier(controlX1: number, controlY1: number, controlX2: number, controlY2: number, x: number) {
  const sampleCurveX = (t: number) => {
    const inverseT = 1 - t;
    return 3 * inverseT * inverseT * t * controlX1 + 3 * inverseT * t * t * controlX2 + t * t * t;
  };
  const sampleCurveY = (t: number) => {
    const inverseT = 1 - t;
    return 3 * inverseT * inverseT * t * controlY1 + 3 * inverseT * t * t * controlY2 + t * t * t;
  };
  const sampleCurveDerivativeX = (t: number) => {
    const inverseT = 1 - t;
    return (
      3 * inverseT * inverseT * controlX1 + 6 * inverseT * t * (controlX2 - controlX1) + 3 * t * t * (1 - controlX2)
    );
  };

  let t = x;
  for (let i = 0; i < 8; i++) {
    const xEstimate = sampleCurveX(t) - x;
    const derivative = sampleCurveDerivativeX(t);
    if (Math.abs(xEstimate) < 0.000001 || Math.abs(derivative) < 0.000001) {
      return sampleCurveY(t);
    }
    t -= xEstimate / derivative;
  }

  let lower = 0;
  let upper = 1;
  t = x;
  while (lower < upper) {
    const xEstimate = sampleCurveX(t);
    if (Math.abs(xEstimate - x) < 0.000001) {
      return sampleCurveY(t);
    }
    if (x > xEstimate) {
      lower = t;
    } else {
      upper = t;
    }
    t = (upper + lower) / 2;
  }
  return sampleCurveY(t);
}

function fastOutSlowIn(progress: number) {
  if (progress === 0 || progress === 1) return progress;
  return cubicBezier(0.4, 0, 0.2, 1, progress);
}

let lastLinearWave: { width: number; height: number; amplitude: number; wavelength: number; path: string } | undefined;

export function createLinearWavePath(
  width: number,
  height: number,
  amplitude: number,
  wavelength: number,
  hasPeers = false,
) {
  const trackLength = Math.max(1, width);
  const centerY = height / 2;

  if (amplitude <= 0 || wavelength <= 0) {
    const y = formatCoordinate(centerY);
    return `M 0 ${y} L ${formatCoordinate(trackLength)} ${y}`;
  }

  const last = hasPeers ? lastLinearWave : undefined;
  if (
    last &&
    last.width === trackLength &&
    last.height === height &&
    last.amplitude === amplitude &&
    last.wavelength === wavelength
  ) {
    return last.path;
  }

  const cycleCount = Math.max(1, Math.floor(trackLength / wavelength));
  const adjustedWavelength = trackLength / cycleCount;
  const halfWavelength = adjustedWavelength / 2;
  const control = halfWavelength * WAVE_SMOOTHNESS;
  const startY = formatCoordinate(centerY + amplitude);
  const midY = formatCoordinate(centerY - amplitude);
  const commands = [`M 0 ${startY}`];

  for (let i = 0; i < cycleCount; i++) {
    const cycleStart = i * adjustedWavelength;
    const cycleMid = cycleStart + halfWavelength;
    const cycleEnd = cycleStart + adjustedWavelength;
    commands.push(
      ` C ${formatCoordinate(cycleStart + control)} ${startY} ${formatCoordinate(cycleMid - control)} ${midY} ${formatCoordinate(cycleMid)} ${midY}`,
      ` C ${formatCoordinate(cycleMid + control)} ${midY} ${formatCoordinate(cycleEnd - control)} ${startY} ${formatCoordinate(cycleEnd)} ${startY}`,
    );
  }

  // Release the individual command strings when the computed path is cached.
  const path = commands.join('');
  if (!hasPeers) return path;

  if (last) {
    last.width = trackLength;
    last.height = height;
    last.amplitude = amplitude;
    last.wavelength = wavelength;
    last.path = path;
  } else {
    // Keep the latest path only while the current group of updates is delivered.
    lastLinearWave = { width: trackLength, height, amplitude, wavelength, path };
    queueMicrotask(() => {
      lastLinearWave = undefined;
    });
  }
  return path;
}

function circularPoint(center: number, radius: number, degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  return {
    x: center + radius * Math.sin(radians),
    y: center - radius * Math.cos(radians),
  };
}

function circularWavePoint(
  center: number,
  radius: number,
  degrees: number,
  cycleDegrees: number,
  amplitude: number,
): Point {
  const phase = degrees / cycleDegrees;
  const offset = amplitude * (1 - Math.cos(phase * Math.PI * 2));
  return circularPoint(center, Math.max(0, radius - offset), degrees);
}

function circularWaveTangent(
  center: number,
  radius: number,
  degrees: number,
  cycleDegrees: number,
  amplitude: number,
): Point {
  const before = circularWavePoint(center, radius, degrees - 0.1, cycleDegrees, amplitude);
  const after = circularWavePoint(center, radius, degrees + 0.1, cycleDegrees, amplitude);
  const dx = after.x - before.x;
  const dy = after.y - before.y;
  const length = Math.hypot(dx, dy) || 1;

  return {
    x: dx / length,
    y: dy / length,
  };
}

export function createCircularArcPath(center: number, radius: number, startDegrees: number, endDegrees: number) {
  const span = endDegrees - startDegrees;
  if (span <= 0 || radius <= 0) {
    return '';
  }

  const arcRadius = formatCoordinate(radius);

  if (span >= 359.999) {
    const firstEnd = startDegrees + 180;
    const secondEnd = startDegrees + 359.999;
    const start = circularPoint(center, radius, startDegrees);
    const middle = circularPoint(center, radius, firstEnd);
    const end = circularPoint(center, radius, secondEnd);
    return `M ${pointToString(start)} A ${arcRadius} ${arcRadius} 0 1 1 ${pointToString(
      middle,
    )} A ${arcRadius} ${arcRadius} 0 1 1 ${pointToString(end)}`;
  }

  const start = circularPoint(center, radius, startDegrees);
  const end = circularPoint(center, radius, endDegrees);
  const largeArc = span > 180 ? 1 : 0;

  return `M ${pointToString(start)} A ${arcRadius} ${arcRadius} 0 ${largeArc} 1 ${pointToString(end)}`;
}

export function createCircularWaveArcPath(
  center: number,
  radius: number,
  startDegrees: number,
  endDegrees: number,
  amplitude: number,
  wavelength: number,
) {
  const span = endDegrees - startDegrees;
  if (span <= 0 || radius <= 0) {
    return '';
  }
  if (amplitude <= 0 || wavelength <= 0) {
    return createCircularArcPath(center, radius, startDegrees, endDegrees);
  }

  const circumference = 2 * Math.PI * radius;
  const cycleCount = Math.max(3, Math.floor(circumference / wavelength));
  const cycleDegrees = 360 / cycleCount;
  const halfCycleDegrees = cycleDegrees / 2;
  let nextAnchor = Math.floor(startDegrees / halfCycleDegrees) * halfCycleDegrees + halfCycleDegrees;
  let previousDegrees = startDegrees;
  let previous = circularWavePoint(center, radius, previousDegrees, cycleDegrees, amplitude);
  let previousTangent = circularWaveTangent(center, radius, previousDegrees, cycleDegrees, amplitude);
  let d = `M ${pointToString(previous)}`;

  while (true) {
    const hasInteriorAnchor = nextAnchor < endDegrees;
    const currentDegrees = hasInteriorAnchor ? nextAnchor : endDegrees;
    const current = circularWavePoint(center, radius, currentDegrees, cycleDegrees, amplitude);
    const currentTangent = circularWaveTangent(center, radius, currentDegrees, cycleDegrees, amplitude);
    const segmentLength = (circumference * (currentDegrees - previousDegrees)) / 360;
    const controlLength = segmentLength * WAVE_SMOOTHNESS;
    const control1 = {
      x: previous.x + previousTangent.x * controlLength,
      y: previous.y + previousTangent.y * controlLength,
    };
    const control2 = {
      x: current.x - currentTangent.x * controlLength,
      y: current.y - currentTangent.y * controlLength,
    };

    d += ` C ${pointToString(control1)} ${pointToString(control2)} ${pointToString(current)}`;
    if (!hasInteriorAnchor) return d;

    previousDegrees = currentDegrees;
    previous = current;
    previousTangent = currentTangent;
    nextAnchor += halfCycleDegrees;
  }
}

export function getCircularIndeterminateState(elapsedMs: number): CircularIndeterminateState {
  const animationFraction = (elapsedMs % CIRCULAR_TOTAL_DURATION_MS) / CIRCULAR_TOTAL_DURATION_MS;
  const playtime = animationFraction * CIRCULAR_TOTAL_DURATION_MS;
  let startDegrees = CIRCULAR_CONSTANT_ROTATION_DEGREES * animationFraction + CIRCULAR_TAIL_DEGREES_OFFSET;
  let endDegrees = CIRCULAR_CONSTANT_ROTATION_DEGREES * animationFraction;

  for (let cycleIndex = 0; cycleIndex < 4; cycleIndex++) {
    const expandFraction = getFractionInRange(
      playtime,
      CIRCULAR_EXPAND_DELAYS_MS[cycleIndex],
      CIRCULAR_EXPAND_DURATION_MS,
    );
    endDegrees += fastOutSlowIn(expandFraction) * CIRCULAR_EXTRA_DEGREES_PER_CYCLE;

    const collapseFraction = getFractionInRange(
      playtime,
      CIRCULAR_COLLAPSE_DELAYS_MS[cycleIndex],
      CIRCULAR_COLLAPSE_DURATION_MS,
    );
    startDegrees += fastOutSlowIn(collapseFraction) * CIRCULAR_EXTRA_DEGREES_PER_CYCLE;
  }

  return {
    startDegrees,
    endDegrees,
  };
}

export function createCircularIndeterminateFrameReader(
  center: number,
  radius: number,
  gapDegrees: number,
  wave?: { amplitude: number; wavelength: number },
) {
  const geometry = `${center}:${radius}:${gapDegrees}${wave ? `:${wave.amplitude}:${wave.wavelength}` : ''}`;

  return (elapsed: number, hasPeers: boolean) => {
    const cached = hasPeers ? circularIndeterminateFrames.get(geometry) : undefined;
    if (cached?.elapsed === elapsed) return cached;

    const { startDegrees, endDegrees } = getCircularIndeterminateState(elapsed);
    const active = wave
      ? createCircularWaveArcPath(center, radius, startDegrees, endDegrees, wave.amplitude, wave.wavelength)
      : createCircularArcPath(center, radius, startDegrees, endDegrees);
    const track = createCircularArcPath(center, radius, endDegrees + gapDegrees, startDegrees + 360 - gapDegrees);

    const frame = { elapsed, active, track };
    if (hasPeers) {
      // The shared frame and resize callbacks deliver peers synchronously. Keep only
      // the latest paths for each geometry until that delivery finishes.
      if (circularIndeterminateFrames.size === 0) queueMicrotask(() => circularIndeterminateFrames.clear());
      circularIndeterminateFrames.set(geometry, frame);
    }
    return frame;
  };
}

export function getCircularTrackGapDegrees(gap: number, strokeWidth: number, radius: number, progress = 1) {
  if (radius <= 0 || progress <= 0) {
    return 0;
  }

  const gapRampDownThreshold = 0.01;
  const adjustedGap = Math.max(0, gap) * (clamp(progress, 0, gapRampDownThreshold) / gapRampDownThreshold);
  const centerlineGap = adjustedGap + Math.max(0, strokeWidth);
  return (centerlineGap / radius) * (180 / Math.PI);
}
