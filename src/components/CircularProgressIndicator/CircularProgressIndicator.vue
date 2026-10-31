<script setup lang="ts">
import { useElementEnvironment } from '@/internal/elementEnvironment';
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
import { useProgressIndicatorState } from '@/composables/useProgressIndicatorState';
import { registerSharedAnimationFrame } from '@/internal/sharedAnimationFrame';
import { readCssLength } from '@/utils/cssLength';
import {
  createCircularArcPath,
  createCircularWaveArcPath,
  getCircularIndeterminateState,
  getCircularTrackGapDegrees,
  type CircularIndeterminateState,
} from '../progressIndicatorPath';

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

const isWavy = computed(() => props.shape === 'wavy');

const rootRef = useTemplateRef<HTMLDivElement>('root');
const { isDeterminate, clampedValue, progressRatioDisplayed, progressState, ariaValueTextResolved } =
  useProgressIndicatorState({
    element: rootRef,
    indeterminate: () => props.indeterminate,
    value: () => props.value,
    min: () => props.min,
    max: () => props.max,
    ariaValueText: () => props.ariaValueText,
  });

const activePathRef = useTemplateRef<SVGPathElement>('activePath');
const trackPathRef = useTemplateRef<SVGPathElement>('trackPath');
const layout = ref({
  size: 40,
  thickness: 4,
  trackGap: 4,
  waveAmplitude: 1.6,
  wavelength: 15,
});
const initialIndeterminateState: CircularIndeterminateState = getCircularIndeterminateState(0);

let resizeObserver: ResizeObserver | null = null;
let animationController: ReturnType<typeof registerSharedAnimationFrame> | undefined;

const syncLayout = () => {
  const root = rootRef.value;
  if (!root || typeof window === 'undefined') {
    return;
  }

  const styles = root.ownerDocument.defaultView!.getComputedStyle(root);
  const rootFontSize = parseFloat(
    root.ownerDocument.defaultView!.getComputedStyle(root.ownerDocument.documentElement).fontSize,
  );
  const size = readCssLength(styles, '--_current-size', props.size, isWavy.value ? 48 : 40, rootFontSize);
  const thickness = readCssLength(styles, '--_track-thickness', props.thickness, 4, rootFontSize);
  const trackGap = readCssLength(styles, '--_track-active-indicator-gap', props.trackGap, 4, rootFontSize);
  const waveAmplitude = readCssLength(styles, '--_wave-amplitude', props.waveAmplitude, 1.6, rootFontSize);
  const wavelength = readCssLength(styles, '--_wave-wavelength', props.wavelength, 15, rootFontSize);

  layout.value = {
    size,
    thickness,
    trackGap,
    waveAmplitude,
    wavelength,
  };
};

const rootStyle = computed(() => {
  const style: Record<string, string> = {
    '--_progress': progressRatioDisplayed.value.toString(),
  };

  if (props.size) {
    style['--md-circular-progress-indicator-size'] = props.size;
  }

  if (props.thickness) {
    style['--md-circular-progress-indicator-track-thickness'] = props.thickness;
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
const activeStartDegrees = computed(() => (isDeterminate.value ? 0 : initialIndeterminateState.startDegrees));
const activeEndDegrees = computed(() =>
  isDeterminate.value ? progressRatioDisplayed.value * 360 : initialIndeterminateState.endDegrees,
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

const syncIndeterminatePresentation = (elapsed: number) => {
  const state = getCircularIndeterminateState(elapsed);
  const currentCenter = center.value;
  const currentRadius = radius.value;
  const active = isWavy.value
    ? createCircularWaveArcPath(
        currentCenter,
        currentRadius,
        state.startDegrees,
        state.endDegrees,
        layout.value.waveAmplitude,
        layout.value.wavelength,
      )
    : createCircularArcPath(currentCenter, currentRadius, state.startDegrees, state.endDegrees);
  const gapDegrees = getCircularTrackGapDegrees(layout.value.trackGap, layout.value.thickness, currentRadius);
  const track = createCircularArcPath(
    currentCenter,
    currentRadius,
    state.endDegrees + gapDegrees,
    state.startDegrees + 360 - gapDegrees,
  );

  if (activePathRef.value?.getAttribute('d') !== active) activePathRef.value?.setAttribute('d', active);
  if (trackPathRef.value?.getAttribute('d') !== track) trackPathRef.value?.setAttribute('d', track);
};

const syncAnimation = () => {
  if (props.indeterminate) {
    animationController?.start();
  } else {
    animationController?.stop();
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

useElementEnvironment(rootRef, (document, root) => {
  syncLayout();
  animationController = registerSharedAnimationFrame(document, syncIndeterminatePresentation);
  syncAnimation();
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(syncLayout);
    resizeObserver.observe(root);
  }
  return () => {
    resizeObserver?.disconnect();
    animationController?.cleanup();
    animationController = undefined;
    resizeObserver = null;
  };
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
        ref="trackPath"
        v-if="trackPath"
        class="m3-circular-progress-indicator-track"
        data-scope="circular-progress-indicator"
        data-part="track"
        :d="trackPath"
      />
      <path
        ref="activePath"
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
