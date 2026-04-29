<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { getLoadingIndicatorFrame, getStaticLoadingIndicatorFrame } from './loadingIndicatorPath';

export type LoadingIndicatorProps = {
  /** Visual configuration of the loading indicator. */
  variant?: 'uncontained' | 'contained';

  /** Whether the loading indicator is visible. Hidden indicators keep their layout space. */
  visible?: boolean;

  /** CSS length used for the active indicator size. */
  indicatorSize?: string;

  /** CSS length used for both container dimensions. */
  containerSize?: string;

  /** CSS length used for the container width. */
  containerWidth?: string;

  /** CSS length used for the container height. */
  containerHeight?: string;

  /** Delay in milliseconds before showing after visible becomes true. */
  showDelay?: number;

  /** Minimum visible duration in milliseconds before hiding, capped at 1000ms. */
  minHideDelay?: number;

  /** Accessible label. */
  ariaLabel?: string;
};

const props = withDefaults(defineProps<LoadingIndicatorProps>(), {
  variant: 'uncontained',
  visible: true,
  showDelay: 0,
  minHideDelay: 0,
});

const maxHideDelay = 1000;
const elapsed = ref(0);
const isShown = ref(props.visible);
const prefersReducedMotion = ref(false);

let animationFrame = 0;
let animationStartTime = 0;
let showTimer = 0;
let hideTimer = 0;
let shownAt = 0;
let motionMediaQuery: MediaQueryList | null = null;

const now = () => {
  if (typeof window !== 'undefined' && window.performance) {
    return window.performance.now();
  }

  return Date.now();
};

const normalizedShowDelay = computed(() => {
  return Number.isFinite(props.showDelay) ? Math.max(0, props.showDelay) : 0;
});

const normalizedMinHideDelay = computed(() => {
  const delay = Number.isFinite(props.minHideDelay) ? Math.max(0, props.minHideDelay) : 0;
  return Math.min(delay, maxHideDelay);
});

const rootStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.indicatorSize) {
    style['--md-loading-indicator-active-indicator-size'] = props.indicatorSize;
  }

  if (props.containerSize) {
    style['--md-loading-indicator-container-width'] = props.containerSize;
    style['--md-loading-indicator-container-height'] = props.containerSize;
  }

  if (props.containerWidth) {
    style['--md-loading-indicator-container-width'] = props.containerWidth;
  }

  if (props.containerHeight) {
    style['--md-loading-indicator-container-height'] = props.containerHeight;
  }

  return style;
});

const frame = computed(() => {
  if (prefersReducedMotion.value) {
    return getStaticLoadingIndicatorFrame();
  }

  return getLoadingIndicatorFrame(elapsed.value);
});

const activeIndicatorStyle = computed(() => ({
  transform: `rotate(${frame.value.rotation}deg)`,
}));

const clearShowTimer = () => {
  if (showTimer) {
    window.clearTimeout(showTimer);
    showTimer = 0;
  }
};

const clearHideTimer = () => {
  if (hideTimer) {
    window.clearTimeout(hideTimer);
    hideTimer = 0;
  }
};

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

  elapsed.value = timestamp - animationStartTime;
  animationFrame = window.requestAnimationFrame(animationStep);
};

const syncAnimation = () => {
  if (typeof window === 'undefined') {
    return;
  }

  stopAnimation();
  if (isShown.value && !prefersReducedMotion.value) {
    elapsed.value = 0;
    animationFrame = window.requestAnimationFrame(animationStep);
  } else if (!isShown.value) {
    elapsed.value = 0;
  }
};

const showNow = () => {
  clearShowTimer();
  clearHideTimer();
  if (!isShown.value) {
    isShown.value = true;
  }
  shownAt = now();
  syncAnimation();
};

const hideNow = () => {
  clearShowTimer();
  clearHideTimer();
  isShown.value = false;
  syncAnimation();
};

const syncVisibility = () => {
  if (typeof window === 'undefined') {
    return;
  }

  clearShowTimer();
  clearHideTimer();

  if (props.visible) {
    if (isShown.value) {
      return;
    }

    if (normalizedShowDelay.value > 0) {
      showTimer = window.setTimeout(showNow, normalizedShowDelay.value);
    } else {
      showNow();
    }
    return;
  }

  if (!isShown.value) {
    return;
  }

  const visibleDuration = now() - shownAt;
  const hideDelay = Math.max(0, normalizedMinHideDelay.value - visibleDuration);
  if (hideDelay > 0) {
    hideTimer = window.setTimeout(hideNow, hideDelay);
  } else {
    hideNow();
  }
};

const syncReducedMotion = () => {
  prefersReducedMotion.value = motionMediaQuery?.matches ?? false;
  syncAnimation();
};

watch(() => props.visible, syncVisibility);
watch([normalizedShowDelay, normalizedMinHideDelay], syncVisibility);

onMounted(() => {
  shownAt = isShown.value ? now() : 0;

  if (typeof window.matchMedia === 'function') {
    motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    syncReducedMotion();
    motionMediaQuery.addEventListener('change', syncReducedMotion);
  } else {
    syncAnimation();
  }

  syncVisibility();
});

onBeforeUnmount(() => {
  clearShowTimer();
  clearHideTimer();
  stopAnimation();
  motionMediaQuery?.removeEventListener('change', syncReducedMotion);
  motionMediaQuery = null;
});
</script>

<template>
  <span
    class="m3-loading-indicator"
    data-scope="loading-indicator"
    data-part="root"
    data-indeterminate="true"
    :data-variant="variant"
    :data-visible="isShown ? 'true' : 'false'"
    role="progressbar"
    :aria-label="ariaLabel"
    :aria-hidden="isShown ? undefined : 'true'"
    :style="rootStyle"
  >
    <span
      class="m3-loading-indicator-container"
      data-scope="loading-indicator"
      data-part="container"
      aria-hidden="true"
    >
      <svg
        class="m3-loading-indicator-active-svg"
        data-scope="loading-indicator"
        data-part="active-indicator-svg"
        viewBox="0 0 432 432"
        focusable="false"
        aria-hidden="true"
      >
        <path
          class="m3-loading-indicator-active"
          data-scope="loading-indicator"
          data-part="active-indicator"
          :d="frame.path"
          :style="activeIndicatorStyle"
        />
      </svg>
    </span>
  </span>
</template>

<style src="./LoadingIndicator.css"></style>
