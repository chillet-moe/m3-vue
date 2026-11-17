<script setup lang="ts">
import { useElementEnvironment } from '@/internal/elementEnvironment';
import { computed, ref, useTemplateRef, watch } from 'vue';
import { staticLoadingIndicatorFrame } from './loadingIndicatorPath';
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

let view: Window | null = null;
let visibilityTimer = 0;
let shownAt = 0;
let animationRegistration: ReturnType<typeof registerLoadingIndicatorAnimation> | undefined;

const now = () => view?.performance.now() ?? Date.now();

const normalizedShowDelay = computed(() => {
  return Number.isFinite(props.showDelay) ? Math.max(0, props.showDelay) : 0;
});

const normalizedMinHideDelay = computed(() => {
  const delay = Number.isFinite(props.minHideDelay) ? Math.max(0, props.minHideDelay) : 0;
  return Math.min(delay, maxHideDelay);
});

const rootStyle = computed(() => {
  const width = props.containerWidth || props.containerSize;
  const height = props.containerHeight || props.containerSize;
  const style: Record<string, string> = {};
  if (props.indicatorSize) style['--md-loading-indicator-active-indicator-size'] = props.indicatorSize;
  if (width) style['--md-loading-indicator-container-width'] = width;
  if (height) style['--md-loading-indicator-container-height'] = height;
  return style;
});

const clearVisibilityTimer = () => {
  view?.clearTimeout(visibilityTimer);
  visibilityTimer = 0;
};

const setShown = (visible: boolean) => {
  visibilityTimer = 0;
  if (visible) shownAt = now();
  isShown.value = visible;
  animationRegistration?.setActive(visible);
};

const syncVisibility = () => {
  if (!view) return;
  clearVisibilityTimer();

  const visible = props.visible;
  if (visible === isShown.value) return;
  const delay = visible ? normalizedShowDelay.value : normalizedMinHideDelay.value - (now() - shownAt);
  if (delay > 0) {
    visibilityTimer = view.setTimeout(() => setShown(visible), delay);
  } else {
    setShown(visible);
  }
};

watch([() => props.visible, normalizedShowDelay, normalizedMinHideDelay], syncVisibility);

useElementEnvironment(activeIndicatorRef, (document, path) => {
  view = document.defaultView;
  shownAt = isShown.value ? now() : 0;
  const registration = registerLoadingIndicatorAnimation(path);
  animationRegistration = registration;
  registration.setActive(isShown.value);
  syncVisibility();

  return () => {
    clearVisibilityTimer();
    registration.cleanup();
    animationRegistration = undefined;
    view = null;
  };
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
    <svg
      class="m3-loading-indicator-active-svg"
      data-scope="loading-indicator"
      data-part="active-indicator-svg"
      viewBox="0 0 380 380"
      focusable="false"
      aria-hidden="true"
    >
      <path
        ref="activeIndicator"
        class="m3-loading-indicator-active"
        data-scope="loading-indicator"
        data-part="active-indicator"
        :d="staticLoadingIndicatorFrame.path"
      />
    </svg>
  </span>
</template>

<style src="./LoadingIndicator.css"></style>
