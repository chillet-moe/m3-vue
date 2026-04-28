<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';
import {
  clamp,
  createCircularArcPath,
  createCircularWaveArcPath,
  getCircularIndeterminateState,
  getCircularTrackGapDegrees,
  type CircularIndeterminateState,
} from '../progressIndicatorPath';
import { useProgressDisplayedValue } from '../progressIndicatorValue';

export type CircularProgressIndicatorProps = {
  /** Whether the progress value is unknown. */
  indeterminate?: boolean;

  /** Current progress value. */
  value?: number;

  /** Minimum progress value. */
  min?: number;

  /** Maximum progress value. */
  max?: number;

  /** Direction used to draw the active indicator. */
  direction?: 'clockwise' | 'counterclockwise';

  /** Visual shape of the active indicator. */
  shape?: 'flat' | 'wavy';

  /** CSS length used for the component size. */
  size?: string;

  /** CSS length used for the track and active indicator thickness. */
  thickness?: string;

  /** CSS length used for the gap between active indicator and track. */
  trackGap?: string;

  /** CSS length used for the wavy active indicator amplitude. */
  waveAmplitude?: string;

  /** CSS length used for the wavy active indicator wavelength. */
  wavelength?: string;

  /** Accessible label. */
  ariaLabel?: string;

  /** Accessible value text. Defaults to a percentage for determinate progress. */
  ariaValueText?: string;
};

const props = withDefaults(defineProps<CircularProgressIndicatorProps>(), {
  indeterminate: false,
  value: 0,
  min: 0,
  max: 1,
  direction: 'clockwise',
  shape: 'flat',
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

const rootRef = useTemplateRef<HTMLDivElement>('root');
const layout = ref({
  size: 40,
  thickness: 4,
  trackGap: 4,
  waveAmplitude: 1.6,
  wavelength: 15,
});
const indeterminateState = ref<CircularIndeterminateState>(getCircularIndeterminateState(0));

let resizeObserver: ResizeObserver | null = null;
let animationFrame = 0;
let animationStartTime = 0;

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
  const fallbackSize = isWavy.value ? 48 : 40;
  const size = readCssLength(styles, '--md-circular-progress-indicator-current-size', props.size, fallbackSize);
  const thickness = readCssLength(styles, '--md-circular-progress-indicator-track-thickness', props.thickness, 4);
  const trackGap = readCssLength(
    styles,
    '--md-circular-progress-indicator-track-active-indicator-gap',
    props.trackGap,
    4,
  );
  const waveAmplitude = readCssLength(
    styles,
    '--md-circular-progress-indicator-wave-amplitude',
    props.waveAmplitude,
    1.6,
  );
  const wavelength = readCssLength(styles, '--md-circular-progress-indicator-wave-wavelength', props.wavelength, 15);

  layout.value = {
    size,
    thickness,
    trackGap,
    waveAmplitude,
    wavelength,
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
    '--md-circular-progress-indicator-progress': progressRatioDisplayed.value.toString(),
  };

  if (props.size) {
    style['--md-circular-progress-indicator-size'] = props.size;
  }

  if (props.thickness) {
    style['--md-circular-progress-indicator-track-thickness'] = props.thickness;
  }

  if (props.size) {
    style['--md-circular-progress-indicator-current-size'] = props.size;
  }

  if (props.trackGap) {
    style['--md-circular-progress-indicator-track-active-indicator-gap'] = props.trackGap;
  }

  if (props.waveAmplitude) {
    style['--md-circular-progress-indicator-wave-amplitude'] = props.waveAmplitude;
  }

  if (props.wavelength) {
    style['--md-circular-progress-indicator-wave-wavelength'] = props.wavelength;
  }

  return style;
});

const center = computed(() => layout.value.size / 2);
const radius = computed(() => Math.max(1, (layout.value.size - layout.value.thickness) / 2));
const viewBox = computed(() => `0 0 ${layout.value.size} ${layout.value.size}`);
const activeStartDegrees = computed(() => (isDeterminate.value ? 0 : indeterminateState.value.startDegrees));
const activeEndDegrees = computed(() =>
  isDeterminate.value ? progressRatioDisplayed.value * 360 : indeterminateState.value.endDegrees,
);
const activePath = computed(() => {
  if (isDeterminate.value && progressRatioDisplayed.value <= 0) {
    return '';
  }

  if (isWavy.value) {
    return createCircularWaveArcPath(
      center.value,
      radius.value,
      activeStartDegrees.value,
      activeEndDegrees.value,
      layout.value.waveAmplitude,
      layout.value.wavelength,
    );
  }

  return createCircularArcPath(center.value, radius.value, activeStartDegrees.value, activeEndDegrees.value);
});
const trackPath = computed(() => {
  if (isDeterminate.value) {
    if (progressRatioDisplayed.value >= 1) {
      return '';
    }

    const gapDegrees = getCircularTrackGapDegrees(
      layout.value.trackGap,
      layout.value.thickness,
      radius.value,
      progressRatioDisplayed.value,
    );
    const startDegrees = progressRatioDisplayed.value * 360 + gapDegrees;
    const endDegrees = 360 - gapDegrees;
    return createCircularArcPath(center.value, radius.value, startDegrees, endDegrees);
  }

  const gapDegrees = getCircularTrackGapDegrees(layout.value.trackGap, layout.value.thickness, radius.value);
  const startDegrees = activeEndDegrees.value + gapDegrees;
  const endDegrees = activeStartDegrees.value + 360 - gapDegrees;
  return createCircularArcPath(center.value, radius.value, startDegrees, endDegrees);
});

const stopAnimation = () => {
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }
  animationStartTime = 0;
};

const animationStep = (timestamp: number) => {
  if (!animationStartTime) {
    animationStartTime = timestamp;
  }

  indeterminateState.value = getCircularIndeterminateState(timestamp - animationStartTime);
  animationFrame = window.requestAnimationFrame(animationStep);
};

const syncAnimation = () => {
  if (typeof window === 'undefined') {
    return;
  }

  stopAnimation();
  if (props.indeterminate) {
    animationFrame = window.requestAnimationFrame(animationStep);
  } else {
    indeterminateState.value = getCircularIndeterminateState(0);
  }
};

watch(
  [
    () => props.shape,
    () => props.size,
    () => props.thickness,
    () => props.trackGap,
    () => props.waveAmplitude,
    () => props.wavelength,
  ],
  async () => {
    await nextTick();
    syncLayout();
  },
);

watch(() => props.indeterminate, syncAnimation);

onMounted(() => {
  syncLayout();
  syncAnimation();
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    resizeObserver = new ResizeObserver(syncLayout);
    resizeObserver.observe(rootRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  stopAnimation();
});
</script>

<template>
  <div
    ref="root"
    class="m3-circular-progress-indicator"
    data-scope="circular-progress-indicator"
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
    <svg
      class="m3-circular-progress-indicator-svg"
      data-scope="circular-progress-indicator"
      data-part="svg"
      :viewBox="viewBox"
      focusable="false"
      aria-hidden="true"
    >
      <path
        v-if="trackPath"
        class="m3-circular-progress-indicator-track"
        data-scope="circular-progress-indicator"
        data-part="track"
        :d="trackPath"
      />
      <path
        v-if="activePath"
        class="m3-circular-progress-indicator-active"
        :class="{
          'm3-circular-progress-indicator-active-determinate': isDeterminate,
          'm3-circular-progress-indicator-active-indeterminate': !isDeterminate,
        }"
        data-scope="circular-progress-indicator"
        data-part="active-indicator"
        :d="activePath"
      />
    </svg>
  </div>
</template>

<style src="./CircularProgressIndicator.css"></style>
