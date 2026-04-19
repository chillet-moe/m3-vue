<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

const linearWavePath = createHorizontalWavePath(100, 10, 3, 5);
const circularWavePath = createCircularWavePath(50, 50, 42, 3.5, 12, 8);
const circularTrackRadius = 42;
const circularTrackLength = 100;
const circularTrackGap = 2.5;

export type ProgressIndicatorProps = {
  /** Visual layout of the indicator. */
  variant?: 'linear' | 'circular';

  /** Whether the current progress value is known. */
  behavior?: 'determinate' | 'indeterminate';

  /** Visual style of the active indicator. */
  shape?: 'flat' | 'wavy';

  /** Minimum progress value. */
  min?: number;

  /** Maximum progress value. */
  max?: number;

  /** Current progress value. */
  value?: number;

  /** Track thickness. Numbers are treated as dp units. */
  thickness?: number | string;

  /** Circular indicator size. Numbers are treated as dp units. */
  size?: number | string;

  /** Whether to show the stop indicator for linear determinate progress. */
  stopIndicator?: boolean;

  /** Accessible label for assistive technology. */
  ariaLabel?: string;

  /** Accessible value text. Defaults to a percentage for determinate progress. */
  ariaValueText?: string;
};

const props = withDefaults(defineProps<ProgressIndicatorProps>(), {
  variant: 'linear',
  behavior: 'determinate',
  shape: 'flat',
  min: 0,
  max: 100,
  value: 0,
  thickness: 4,
  size: undefined,
  stopIndicator: true,
  ariaLabel: undefined,
  ariaValueText: undefined,
});

const isDeterminate = computed(() => props.behavior === 'determinate');

const normalizedMin = computed(() => (isFiniteNumber(props.min) ? props.min : 0));

const normalizedMax = computed(() => {
  const fallbackMax = normalizedMin.value + 1;

  if (!isFiniteNumber(props.max)) {
    return fallbackMax;
  }

  return props.max > normalizedMin.value ? props.max : fallbackMax;
});

const normalizedValue = computed(() => {
  const nextValue = isFiniteNumber(props.value) ? props.value : normalizedMin.value;
  return clamp(nextValue, normalizedMin.value, normalizedMax.value);
});

const progressRatio = computed(() => {
  const range = normalizedMax.value - normalizedMin.value;
  if (range <= 0) {
    return 0;
  }

  return (normalizedValue.value - normalizedMin.value) / range;
});

const progressPercent = computed(() => progressRatio.value * 100);

const linearGapSize = computed(() => {
  if (!isDeterminate.value || progressRatio.value <= 0 || progressRatio.value >= 1) {
    return '0px';
  }

  return 'var(--md-progress-indicator-linear-track-active-indicator-space)';
});

const resolvedThickness = computed(() => resolveLength(props.thickness));
const resolvedSize = computed(() => resolveLength(props.size));

const resolvedAriaValueText = computed(() => {
  if (props.ariaValueText) {
    return props.ariaValueText;
  }

  return `${Math.round(progressPercent.value)}%`;
});

const showStopIndicator = computed(() => props.variant === 'linear' && isDeterminate.value && props.stopIndicator);

const rootStyle = computed<CSSProperties>(() => {
  const style: Record<string, string> = {
    '--md-progress-indicator-active-ratio': progressRatio.value.toString(),
    '--md-progress-indicator-active-percent': `${progressPercent.value}%`,
    '--md-progress-indicator-linear-gap-size': linearGapSize.value,
  };

  if (resolvedThickness.value) {
    style['--md-progress-indicator-resolved-thickness'] = resolvedThickness.value;
  }

  if (resolvedSize.value) {
    style['--md-progress-indicator-resolved-size'] = resolvedSize.value;
  }

  return style as CSSProperties;
});

const circularActiveDasharray = computed(() => {
  const activeLength = progressPercent.value;
  const remainingLength = Math.max(circularTrackLength - activeLength, 0);

  if (remainingLength <= 0) {
    return `${circularTrackLength} 0`;
  }

  return `${activeLength} ${remainingLength}`;
});

const circularTrackDasharray = computed(() => {
  if (!isDeterminate.value) {
    return undefined;
  }

  const activeLength = progressPercent.value;
  const gapLength = activeLength > 0 && activeLength < circularTrackLength ? circularTrackGap : 0;
  const visibleTrackLength = Math.max(circularTrackLength - activeLength - gapLength, 0);

  if (visibleTrackLength <= 0) {
    return '0 100';
  }

  return `${visibleTrackLength} ${circularTrackLength - visibleTrackLength}`;
});

const circularTrackDashoffset = computed(() => {
  if (!isDeterminate.value) {
    return undefined;
  }

  const activeLength = progressPercent.value;
  const gapLength = activeLength > 0 && activeLength < circularTrackLength ? circularTrackGap : 0;

  if (gapLength <= 0) {
    return undefined;
  }

  return `-${activeLength + gapLength}`;
});

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function resolveLength(value: number | string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value / 16}rem`;
  }

  return typeof value === 'string' ? value : undefined;
}

function createHorizontalWavePath(width: number, height: number, amplitude: number, waves: number) {
  const centerY = height / 2;
  const waveWidth = width / waves;
  let path = `M 0 ${centerY}`;

  for (let index = 0; index < waves; index += 1) {
    const startX = index * waveWidth;
    const midX = startX + waveWidth / 2;
    const endX = startX + waveWidth;
    const quarterWidth = waveWidth / 4;

    path += ` C ${startX + quarterWidth} ${centerY - amplitude} ${midX - quarterWidth} ${centerY - amplitude} ${midX} ${centerY}`;
    path += ` C ${midX + quarterWidth} ${centerY + amplitude} ${endX - quarterWidth} ${centerY + amplitude} ${endX} ${centerY}`;
  }

  return path;
}

function createCircularWavePath(
  centerX: number,
  centerY: number,
  radius: number,
  amplitude: number,
  waves: number,
  segmentsPerWave: number,
) {
  const totalSegments = waves * segmentsPerWave;
  let path = '';

  for (let index = 0; index <= totalSegments; index += 1) {
    const progress = index / totalSegments;
    const angle = progress * Math.PI * 2;
    const pointRadius = radius + Math.sin(angle * waves) * amplitude;
    const x = centerX + Math.cos(angle) * pointRadius;
    const y = centerY + Math.sin(angle) * pointRadius;
    path += `${index === 0 ? 'M' : ' L'} ${x.toFixed(3)} ${y.toFixed(3)}`;
  }

  return `${path} Z`;
}
</script>

<template>
  <div
    class="m3-progress-indicator"
    data-scope="progress-indicator"
    data-part="root"
    :data-variant="variant"
    :data-behavior="behavior"
    :data-shape="shape"
    :style="rootStyle"
    role="progressbar"
    :aria-label="ariaLabel"
    :aria-valuemin="isDeterminate ? normalizedMin : undefined"
    :aria-valuemax="isDeterminate ? normalizedMax : undefined"
    :aria-valuenow="isDeterminate ? normalizedValue : undefined"
    :aria-valuetext="isDeterminate ? resolvedAriaValueText : undefined"
    :aria-busy="isDeterminate ? undefined : 'true'"
  >
    <div
      v-if="variant === 'linear'"
      class="m3-progress-indicator-linear"
      data-scope="progress-indicator"
      data-part="linear"
    >
      <div class="m3-progress-indicator-linear-line" data-scope="progress-indicator" data-part="line">
        <div
          class="m3-progress-indicator-linear-track"
          aria-hidden="true"
          data-scope="progress-indicator"
          data-part="track"
        />
        <div
          v-if="isDeterminate"
          class="m3-progress-indicator-linear-active"
          data-scope="progress-indicator"
          data-part="active-indicator"
        >
          <div
            v-if="shape === 'flat'"
            class="m3-progress-indicator-linear-active-flat"
            data-scope="progress-indicator"
            data-part="active-indicator-graphic"
          />
          <svg
            v-else
            class="m3-progress-indicator-linear-active-wavy"
            data-scope="progress-indicator"
            data-part="active-indicator-graphic"
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path :d="linearWavePath" />
          </svg>
        </div>
        <div
          v-else
          class="m3-progress-indicator-linear-active m3-progress-indicator-linear-active-indeterminate m3-progress-indicator-linear-active-indeterminate-secondary"
          data-scope="progress-indicator"
          data-part="active-indicator"
        >
          <div
            v-if="shape === 'flat'"
            class="m3-progress-indicator-linear-active-flat"
            data-scope="progress-indicator"
            data-part="active-indicator-graphic"
          />
          <svg
            v-else
            class="m3-progress-indicator-linear-active-wavy"
            data-scope="progress-indicator"
            data-part="active-indicator-graphic"
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path :d="linearWavePath" />
          </svg>
        </div>
        <span
          v-if="showStopIndicator"
          class="m3-progress-indicator-stop-indicator"
          aria-hidden="true"
          data-scope="progress-indicator"
          data-part="stop-indicator"
        />
      </div>
    </div>

    <div v-else class="m3-progress-indicator-circular" data-scope="progress-indicator" data-part="circular">
      <svg
        class="m3-progress-indicator-circular-svg"
        data-scope="progress-indicator"
        data-part="graphic"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          class="m3-progress-indicator-circular-track"
          data-scope="progress-indicator"
          data-part="track"
          cx="50"
          cy="50"
          :r="circularTrackRadius"
          :pathLength="circularTrackLength"
          :stroke-dasharray="circularTrackDasharray"
          :stroke-dashoffset="circularTrackDashoffset"
        />
        <circle
          v-if="shape === 'flat'"
          class="m3-progress-indicator-circular-active"
          :class="{
            'm3-progress-indicator-circular-active-indeterminate': !isDeterminate,
          }"
          data-scope="progress-indicator"
          data-part="active-indicator"
          cx="50"
          cy="50"
          :r="circularTrackRadius"
          :pathLength="circularTrackLength"
          :stroke-dasharray="isDeterminate ? circularActiveDasharray : undefined"
        />
        <path
          v-else
          class="m3-progress-indicator-circular-active m3-progress-indicator-circular-active-wavy"
          :class="{
            'm3-progress-indicator-circular-active-indeterminate': !isDeterminate,
          }"
          data-scope="progress-indicator"
          data-part="active-indicator"
          :d="circularWavePath"
          :pathLength="circularTrackLength"
          :stroke-dasharray="isDeterminate ? circularActiveDasharray : undefined"
        />
      </svg>
    </div>
  </div>
</template>

<style src="./ProgressIndicator.css"></style>
