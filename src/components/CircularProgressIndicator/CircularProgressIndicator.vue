<script setup lang="ts">
import { useElementEnvironment } from '@/internal/elementEnvironment';
import { computed, nextTick, ref, shallowRef, useTemplateRef, watch } from 'vue';
import { useProgressIndicatorState } from '@/composables/useProgressIndicatorState';
import { registerSharedAnimationFrame } from '@/internal/sharedAnimationFrame';
import { createCssLengthReader } from '@/utils/cssLength';
import {
  createCircularArcPath,
  createCircularIndeterminateFrameReader,
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

const svgRef = useTemplateRef<SVGSVGElement>('svg');
const activePathRef = useTemplateRef<SVGPathElement>('activePath');
const trackPathRef = useTemplateRef<SVGPathElement>('trackPath');
const layout = shallowRef({
  size: 40,
  thickness: 4,
  trackGap: 4,
  waveAmplitude: 1.6,
  wavelength: 15,
});
const initialIndeterminateState: CircularIndeterminateState = getCircularIndeterminateState(0);

let animationController: ReturnType<typeof registerSharedAnimationFrame> | undefined;

const syncLayout = () => {
  const root = rootRef.value;
  if (!root || typeof window === 'undefined') {
    return;
  }

  const readCssLength = createCssLengthReader(root);
  const size = readCssLength('--_current-size', props.size, isWavy.value ? 48 : 40);
  const thickness = readCssLength('--_track-thickness', props.thickness, 4);
  const trackGap = readCssLength('--_track-active-indicator-gap', props.trackGap, 4);
  const waveAmplitude = readCssLength('--_wave-amplitude', props.waveAmplitude, 1.6);
  const wavelength = readCssLength('--_wave-wavelength', props.wavelength, 15);

  layout.value = {
    size,
    thickness,
    trackGap,
    waveAmplitude,
    wavelength,
  };
};

const rootStyle = computed(() => {
  const style: Record<string, string> = {};

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
// Vue supplies the initial path when a segment is created. Subsequent changes
// stay on that SVG element so animation frames do not render the progressbar.
const initialTrackPath = ref('');
const initialActivePath = ref('');
let previousTrack = '';
let previousActive = '';

watch(
  [layout, isWavy, () => (isDeterminate.value ? progressRatioDisplayed.value : undefined)],
  ([{ trackGap, thickness, waveAmplitude, wavelength }, wavy, progress]) => {
    const startDegrees = progress === undefined ? initialIndeterminateState.startDegrees : 0;
    const endDegrees = progress === undefined ? initialIndeterminateState.endDegrees : progress * 360;
    const circleCenter = center.value;
    const circleRadius = radius.value;
    let track = '';
    if (progress === undefined || progress < 1) {
      const gapDegrees = getCircularTrackGapDegrees(trackGap, thickness, circleRadius, progress);
      track = createCircularArcPath(
        circleCenter,
        circleRadius,
        endDegrees + gapDegrees,
        startDegrees + 360 - gapDegrees,
      );
    }

    let active = '';
    if (progress === undefined || progress > 0) {
      active = wavy
        ? createCircularWaveArcPath(circleCenter, circleRadius, startDegrees, endDegrees, waveAmplitude, wavelength)
        : createCircularArcPath(circleCenter, circleRadius, startDegrees, endDegrees);
    }

    if (track !== previousTrack) {
      if (track && previousTrack) trackPathRef.value?.setAttribute('d', track);
      else initialTrackPath.value = track;
      previousTrack = track;
    }
    if (active !== previousActive) {
      if (active && previousActive) activePathRef.value?.setAttribute('d', active);
      else initialActivePath.value = active;
      previousActive = active;
    }
  },
  { immediate: true },
);

const readIndeterminateFrame = computed(() => {
  const { trackGap, thickness, waveAmplitude, wavelength } = layout.value;
  const gapDegrees = getCircularTrackGapDegrees(trackGap, thickness, radius.value);
  const wave = isWavy.value ? { amplitude: waveAmplitude, wavelength } : undefined;
  return createCircularIndeterminateFrameReader(center.value, radius.value, gapDegrees, wave);
});

const syncIndeterminatePresentation = (elapsed: number, hasPeers: boolean) => {
  const { active, track } = readIndeterminateFrame.value(elapsed, hasPeers);
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
  const releaseAnimation = bindProgressAnimation(document);
  syncLayout();
  animationController = registerSharedAnimationFrame(svgRef.value!, syncIndeterminatePresentation, {
    element: root,
    measure: syncLayout,
  });
  syncAnimation();
  return () => {
    releaseAnimation();
    animationController?.cleanup();
    animationController = undefined;
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
      ref="svg"
      class="m3-circular-progress-indicator-svg"
      data-scope="circular-progress-indicator"
      data-part="svg"
      :viewBox="viewBox"
      focusable="false"
      aria-hidden="true"
    >
      <path
        ref="trackPath"
        v-if="initialTrackPath"
        class="m3-circular-progress-indicator-track"
        data-scope="circular-progress-indicator"
        data-part="track"
        :d="initialTrackPath"
      />
      <path
        ref="activePath"
        v-if="initialActivePath"
        class="m3-circular-progress-indicator-active"
        :class="{
          'm3-circular-progress-indicator-active-determinate': isDeterminate,
          'm3-circular-progress-indicator-active-indeterminate': !isDeterminate,
        }"
        data-scope="circular-progress-indicator"
        data-part="active-indicator"
        :d="initialActivePath"
      />
    </svg>
  </div>
</template>

<style src="./CircularProgressIndicator.css"></style>
