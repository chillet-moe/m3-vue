<script setup lang="ts">
import { useElementEnvironment } from '@/internal/elementEnvironment';
import { computed, nextTick, onBeforeUnmount, shallowRef, useTemplateRef, watch } from 'vue';
import { useProgressIndicatorState } from '@/composables/useProgressIndicatorState';
import { createCssLengthReader } from '@/utils/cssLength';
import { createLinearWavePath } from '../progressIndicatorPath';
import { observeLinearProgressResize } from './observeLinearProgressResize';

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

const isWavy = computed(() => props.shape === 'wavy');

const rootRef = useTemplateRef<HTMLDivElement>('root');
const {
  isDeterminate,
  clampedValue,
  progressRatioDisplayed,
  progressState,
  ariaValueTextResolved,
  bindProgressAnimation,
} = useProgressIndicatorState({
  indeterminate: () => props.indeterminate,
  value: () => props.value,
  min: () => props.min,
  max: () => props.max,
  ariaValueText: () => props.ariaValueText,
});

const isStopIndicatorVisible = computed(() => isDeterminate.value && props.stopIndicator);
const layout = shallowRef({
  width: 240,
  height: 4,
  waveAmplitude: 3,
  wavelengthDeterminate: 40,
  wavelengthIndeterminate: 20,
});

let resizeObservation: ReturnType<typeof observeLinearProgressResize>;

const syncLayout = () => {
  const root = rootRef.value;
  if (!root || typeof window === 'undefined') {
    return;
  }

  const readCssLength = createCssLengthReader(root);
  const thickness = readCssLength('--_track-thickness', props.thickness, 4);
  const waveAmplitude = readCssLength('--_wave-amplitude', props.waveAmplitude, 3);
  const wavelengthDeterminate = readCssLength('--_wave-wavelength', props.wavelength, 40);
  const wavelengthIndeterminate = readCssLength('--_indeterminate-wave-wavelength', undefined, 20);
  const waveHeight = readCssLength('--_with-wave-height', undefined, 10);
  const previous = layout.value;
  const rect = root.getBoundingClientRect();
  const width = Math.max(1, rect.width || root.clientWidth || previous.width);
  const height = isWavy.value ? Math.max(thickness + waveAmplitude * 2, waveHeight) : thickness;

  if (
    width === previous.width &&
    height === previous.height &&
    waveAmplitude === previous.waveAmplitude &&
    wavelengthDeterminate === previous.wavelengthDeterminate &&
    wavelengthIndeterminate === previous.wavelengthIndeterminate
  ) {
    return;
  }

  layout.value = {
    width,
    height,
    waveAmplitude,
    wavelengthDeterminate,
    wavelengthIndeterminate,
  };
};

const stopLayoutTracking = () => {
  resizeObservation?.stop();
  resizeObservation = undefined;
};

const startLayoutTracking = () => {
  stopLayoutTracking();
  if (!isWavy.value) return;

  syncLayout();
  const root = rootRef.value;
  if (root) resizeObservation = observeLinearProgressResize(root, syncLayout);
};

// The render snapshot supplies the value for server markup and new segments.
const progressProperty = '--m3-linear-progress-displayed-value';
const displayedProgressStyle = { '--_progress': progressRatioDisplayed.value.toString() };
let trackElement: HTMLElement | undefined;
watch(progressRatioDisplayed, (value) => {
  const progress = value.toString();
  displayedProgressStyle['--_progress'] = progress;

  // The track stays mounted while the adjacent active segment can be replaced.
  trackElement ??= rootRef.value?.querySelector<HTMLElement>('[data-part="track"]') ?? undefined;
  trackElement?.style.setProperty(progressProperty, progress);
  const active = trackElement?.nextElementSibling as HTMLElement | null | undefined;
  if (active?.classList.contains('m3-linear-progress-indicator-active-determinate')) {
    active.style.setProperty(progressProperty, progress);
  }
});

const rootStyle = computed(() => {
  const style: Record<string, string> = {};

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
  return createLinearWavePath(
    currentLayout.width,
    currentLayout.height,
    currentLayout.waveAmplitude,
    wavelength,
    resizeObservation?.hasPeers(),
  );
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

watch(isWavy, async () => {
  await nextTick();
  startLayoutTracking();
});

watch(
  [() => props.thickness, () => props.waveAmplitude, () => props.wavelength, () => props.indeterminateWavelength],
  async () => {
    if (!isWavy.value) return;
    await nextTick();
    syncLayout();
  },
);

onBeforeUnmount(() => {
  stopLayoutTracking();
  trackElement = undefined;
});
useElementEnvironment(rootRef, (document) => {
  const releaseAnimation = bindProgressAnimation(document);
  startLayoutTracking();
  return () => {
    releaseAnimation();
    stopLayoutTracking();
  };
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
    :style="[displayedProgressStyle, rootStyle]"
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
