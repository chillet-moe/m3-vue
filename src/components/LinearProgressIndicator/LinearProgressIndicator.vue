<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';
import { clamp, createLinearWavePath } from '../progressIndicatorPath';
import { useProgressDisplayedValue } from '../progressIndicatorValue';

export type LinearProgressIndicatorProps = {
  /** Whether the progress value is unknown. */
  indeterminate?: boolean;

  /** Current progress value. */
  value?: number;

  /** Minimum progress value. */
  min?: number;

  /** Maximum progress value. */
  max?: number;

  /** Drawing direction for the visual indicator. */
  direction?: 'ltr' | 'rtl';

  /** Visual shape of the active indicator. */
  shape?: 'flat' | 'wavy';

  /** CSS length used for the track and active indicator thickness. */
  thickness?: string;

  /** CSS length used for the gap between active indicator and track. */
  trackGap?: string;

  /** Whether to draw the linear stop indicator at the track end. */
  stopIndicator?: boolean;

  /** CSS length used for the stop indicator size. */
  stopIndicatorSize?: string;

  /** CSS length used for the wavy active indicator amplitude. */
  waveAmplitude?: string;

  /** CSS length used for the determinate wavy active indicator wavelength. */
  wavelength?: string;

  /** CSS length used for the indeterminate wavy active indicator wavelength. */
  indeterminateWavelength?: string;

  /** Accessible label. */
  ariaLabel?: string;

  /** Accessible value text. Defaults to a percentage for determinate progress. */
  ariaValueText?: string;
};

const props = withDefaults(defineProps<LinearProgressIndicatorProps>(), {
  indeterminate: false,
  value: 0,
  min: 0,
  max: 1,
  direction: 'ltr',
  shape: 'flat',
  stopIndicator: true,
});

const isDeterminate = computed(() => !props.indeterminate);
const isWavy = computed(() => props.shape === 'wavy');

const clampedValue = computed(() => {
  if (!Number.isFinite(props.value)) {
    return props.min;
  }

  if (props.max <= props.min) {
    return props.min;
  }

  return clamp(props.value, props.min, props.max);
});

const progressRatio = computed(() => {
  const range = props.max - props.min;
  if (!Number.isFinite(range) || range <= 0) {
    return 0;
  }

  return clamp((clampedValue.value - props.min) / range, 0, 1);
});

const progressRatioDisplayed = useProgressDisplayedValue(progressRatio, isDeterminate);
const progressPercent = computed(() => progressRatio.value * 100);
const progressState = computed(() => {
  if (progressRatioDisplayed.value <= 0) {
    return 'empty';
  }

  if (progressRatioDisplayed.value >= 1) {
    return 'complete';
  }

  return 'partial';
});

const isTrackGapVisible = computed(() => isDeterminate.value && progressState.value === 'partial');
const isStopIndicatorVisible = computed(() => isDeterminate.value && props.stopIndicator);
const rootRef = useTemplateRef<HTMLDivElement>('root');
const layout = ref({
  width: 240,
  height: 4,
  thickness: 4,
  waveAmplitude: 3,
  wavelengthDeterminate: 40,
  wavelengthIndeterminate: 20,
});

let resizeObserver: ResizeObserver | null = null;

const parseCssLength = (value: string | undefined, fallback: number, fontSize = 16) => {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  const numericValue = Number.parseFloat(trimmed);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  if (trimmed.endsWith('rem') || trimmed.endsWith('em')) {
    return numericValue * fontSize;
  }

  return numericValue;
};

const readCssLength = (styles: CSSStyleDeclaration, token: string, propValue: string | undefined, fallback: number) => {
  const fontSize = parseCssLength(styles.fontSize, 16);
  return parseCssLength(propValue ?? styles.getPropertyValue(token), fallback, fontSize);
};

const syncLayout = () => {
  const root = rootRef.value;
  if (!root || typeof window === 'undefined') {
    return;
  }

  const styles = window.getComputedStyle(root);
  const thickness = readCssLength(styles, '--md-linear-progress-indicator-track-thickness', props.thickness, 4);
  const waveAmplitude = readCssLength(styles, '--md-linear-progress-indicator-wave-amplitude', props.waveAmplitude, 3);
  const wavelengthDeterminate = readCssLength(
    styles,
    '--md-linear-progress-indicator-wave-wavelength',
    props.wavelength,
    40,
  );
  const wavelengthIndeterminate = readCssLength(
    styles,
    '--md-linear-progress-indicator-indeterminate-wave-wavelength',
    props.indeterminateWavelength,
    20,
  );
  const rect = root.getBoundingClientRect();
  const width = Math.max(1, rect.width || root.clientWidth || layout.value.width);
  const height = isWavy.value ? Math.max(thickness + waveAmplitude * 2, 10) : thickness;

  layout.value = {
    width,
    height,
    thickness,
    waveAmplitude,
    wavelengthDeterminate,
    wavelengthIndeterminate,
  };
};

const ariaValueTextResolved = computed(() => {
  if (!isDeterminate.value) {
    return props.ariaValueText;
  }

  return props.ariaValueText ?? `${Math.round(progressPercent.value)}%`;
});

const rootStyle = computed(() => {
  const style: Record<string, string> = {
    '--_progress': progressRatioDisplayed.value.toString(),
    '--_active-track-gap-size': isTrackGapVisible.value ? 'var(--_track-active-indicator-gap)' : '0px',
  };

  if (props.thickness) {
    style['--md-linear-progress-indicator-track-thickness'] = props.thickness;
  }

  if (props.trackGap) {
    style['--md-linear-progress-indicator-track-active-indicator-gap'] = props.trackGap;
  }

  if (props.stopIndicatorSize) {
    style['--md-linear-progress-indicator-stop-indicator-size'] = props.stopIndicatorSize;
  }

  if (props.waveAmplitude) {
    style['--md-linear-progress-indicator-wave-amplitude'] = props.waveAmplitude;
  }

  if (props.wavelength) {
    style['--md-linear-progress-indicator-wave-wavelength'] = props.wavelength;
  }

  if (props.indeterminateWavelength) {
    style['--md-linear-progress-indicator-indeterminate-wave-wavelength'] = props.indeterminateWavelength;
  }

  return style;
});

const wavePath = computed(() => {
  const currentLayout = layout.value;
  const wavelength = isDeterminate.value ? currentLayout.wavelengthDeterminate : currentLayout.wavelengthIndeterminate;
  return createLinearWavePath(currentLayout.width, currentLayout.height, currentLayout.waveAmplitude, wavelength);
});

const waveViewBox = computed(() => {
  return `0 0 ${layout.value.width} ${layout.value.height}`;
});

const waveSvgStyle = computed(() => {
  return {
    inlineSize: `${layout.value.width}px`,
    blockSize: `${layout.value.height}px`,
  };
});

watch(
  [
    () => props.shape,
    () => props.thickness,
    () => props.waveAmplitude,
    () => props.wavelength,
    () => props.indeterminateWavelength,
  ],
  async () => {
    await nextTick();
    syncLayout();
  },
);

onMounted(() => {
  syncLayout();
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    resizeObserver = new ResizeObserver(syncLayout);
    resizeObserver.observe(rootRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>

<template>
  <div
    ref="root"
    class="m3-linear-progress-indicator"
    data-scope="linear-progress-indicator"
    data-part="root"
    :data-indeterminate="indeterminate ? 'true' : 'false'"
    :data-direction="direction"
    :data-shape="shape"
    :data-progress-state="progressState"
    role="progressbar"
    :aria-label="ariaLabel"
    :aria-valuemin="isDeterminate ? min : undefined"
    :aria-valuemax="isDeterminate ? max : undefined"
    :aria-valuenow="isDeterminate ? clampedValue : undefined"
    :aria-valuetext="ariaValueTextResolved"
    :style="rootStyle"
  >
    <div
      class="m3-linear-progress-indicator-viewport"
      data-scope="linear-progress-indicator"
      data-part="viewport"
      aria-hidden="true"
    >
      <div class="m3-linear-progress-indicator-track" data-scope="linear-progress-indicator" data-part="track" />

      <template v-if="isDeterminate">
        <div
          class="m3-linear-progress-indicator-active m3-linear-progress-indicator-active-determinate"
          data-scope="linear-progress-indicator"
          data-part="active-indicator"
        >
          <span
            class="m3-linear-progress-indicator-active-flat"
            data-scope="linear-progress-indicator"
            data-part="active-indicator-flat"
          />
          <svg
            v-if="isWavy"
            class="m3-linear-progress-indicator-active-wavy"
            data-scope="linear-progress-indicator"
            data-part="active-indicator-wavy"
            :viewBox="waveViewBox"
            :width="layout.width"
            :height="layout.height"
            :style="waveSvgStyle"
            preserveAspectRatio="none"
            focusable="false"
            aria-hidden="true"
          >
            <path :d="wavePath" />
          </svg>
        </div>
      </template>

      <template v-else>
        <div
          class="m3-linear-progress-indicator-active m3-linear-progress-indicator-active-indeterminate m3-linear-progress-indicator-active-indeterminate-one"
          data-scope="linear-progress-indicator"
          data-part="active-indicator"
        >
          <span
            class="m3-linear-progress-indicator-active-flat"
            data-scope="linear-progress-indicator"
            data-part="active-indicator-flat"
          />
          <svg
            v-if="isWavy"
            class="m3-linear-progress-indicator-active-wavy"
            data-scope="linear-progress-indicator"
            data-part="active-indicator-wavy"
            :viewBox="waveViewBox"
            :width="layout.width"
            :height="layout.height"
            :style="waveSvgStyle"
            preserveAspectRatio="none"
            focusable="false"
            aria-hidden="true"
          >
            <path :d="wavePath" />
          </svg>
        </div>
        <div
          class="m3-linear-progress-indicator-active m3-linear-progress-indicator-active-indeterminate m3-linear-progress-indicator-active-indeterminate-two"
          data-scope="linear-progress-indicator"
          data-part="active-indicator"
        >
          <span
            class="m3-linear-progress-indicator-active-flat"
            data-scope="linear-progress-indicator"
            data-part="active-indicator-flat"
          />
          <svg
            v-if="isWavy"
            class="m3-linear-progress-indicator-active-wavy"
            data-scope="linear-progress-indicator"
            data-part="active-indicator-wavy"
            :viewBox="waveViewBox"
            :width="layout.width"
            :height="layout.height"
            :style="waveSvgStyle"
            preserveAspectRatio="none"
            focusable="false"
            aria-hidden="true"
          >
            <path :d="wavePath" />
          </svg>
        </div>
      </template>

      <div
        v-if="isStopIndicatorVisible"
        class="m3-linear-progress-indicator-stop-indicator"
        data-scope="linear-progress-indicator"
        data-part="stop-indicator"
      />
    </div>
  </div>
</template>

<style src="./LinearProgressIndicator.css"></style>
