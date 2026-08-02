<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';
import { getStaticLoadingIndicatorFrame } from './loadingIndicatorPath';
import { registerLoadingIndicatorAnimation } from './loadingIndicatorAnimation';

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
const isShown = ref(props.visible);
const activeIndicatorRef = useTemplateRef<SVGPathElement>('activeIndicator');
const initialFrame = getStaticLoadingIndicatorFrame();

let showTimer = 0;
let hideTimer = 0;
let shownAt = 0;
let animationRegistration: ReturnType<typeof registerLoadingIndicatorAnimation> | undefined;

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

const syncAnimation = () => {
  animationRegistration?.setActive(isShown.value);
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

watch(() => props.visible, syncVisibility);
watch([normalizedShowDelay, normalizedMinHideDelay], syncVisibility);

onMounted(() => {
  shownAt = isShown.value ? now() : 0;
  if (activeIndicatorRef.value) {
    animationRegistration = registerLoadingIndicatorAnimation(activeIndicatorRef.value);
  }
  syncAnimation();
  syncVisibility();
});

onBeforeUnmount(() => {
  clearShowTimer();
  clearHideTimer();
  animationRegistration?.cleanup();
  animationRegistration = undefined;
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
          ref="activeIndicator"
          class="m3-loading-indicator-active"
          data-scope="loading-indicator"
          data-part="active-indicator"
          :d="initialFrame.path"
        />
      </svg>
    </span>
  </span>
</template>

<style src="./LoadingIndicator.css"></style>
