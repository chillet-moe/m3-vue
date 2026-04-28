<script setup lang="ts">
import { inject, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from 'vue';
import { tabsContextKey } from './TabsContext';

export type TabListProps = {
  /** Accessible label for the tab list. */
  ariaLabel?: string;
};

const { ariaLabel = undefined } = defineProps<TabListProps>();

defineSlots<{
  default(): any;
}>();

const tabs = inject(tabsContextKey);

const listElement = ref<HTMLElement | null>(null);
const indicatorStyle = ref<CSSProperties>({ '--_tabs-indicator-opacity': '0' });

const indicatorMinimumSize = 24;

let resizeObserver: ResizeObserver | undefined;
let mutationObserver: MutationObserver | undefined;
let animationFrame = 0;

const hideIndicator = () => {
  indicatorStyle.value = { '--_tabs-indicator-opacity': '0' };
};

const getActiveTab = () => {
  const list = listElement.value;
  const value = tabs?.value.value;

  if (!list || value === undefined) {
    return undefined;
  }

  return Array.from(list.querySelectorAll<HTMLElement>('[role="tab"][data-tab-value]')).find(
    (tab) => tab.dataset.tabValue === value,
  );
};

const updateIndicator = () => {
  const list = listElement.value;
  const activeTab = getActiveTab();

  if (!list || !activeTab) {
    hideIndicator();
    return;
  }

  if (tabs?.orientation.value === 'vertical') {
    indicatorStyle.value = {
      '--_tabs-indicator-block-start': `${activeTab.offsetTop}px`,
      '--_tabs-indicator-block-size': `${activeTab.offsetHeight}px`,
      '--_tabs-indicator-opacity': '1',
    };
    return;
  }

  const content = activeTab.querySelector<HTMLElement>('.m3-tab-content') ?? activeTab;
  const width = Math.min(activeTab.offsetWidth, Math.max(content.offsetWidth, indicatorMinimumSize));
  const start = activeTab.offsetLeft + content.offsetLeft + (content.offsetWidth - width) / 2;

  indicatorStyle.value = {
    '--_tabs-indicator-inline-start': `${start}px`,
    '--_tabs-indicator-inline-size': `${width}px`,
    '--_tabs-indicator-opacity': '1',
  };
};

const queueIndicatorUpdate = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.cancelAnimationFrame === 'function' && animationFrame) {
    window.cancelAnimationFrame(animationFrame);
  }

  if (typeof window.requestAnimationFrame === 'function') {
    animationFrame = window.requestAnimationFrame(updateIndicator);
    return;
  }

  updateIndicator();
};

const observeTabGeometry = () => {
  resizeObserver?.disconnect();

  const list = listElement.value;
  if (!list || typeof ResizeObserver === 'undefined') {
    return;
  }

  resizeObserver = new ResizeObserver(queueIndicatorUpdate);
  resizeObserver.observe(list);

  for (const tab of list.querySelectorAll<HTMLElement>('[role="tab"]')) {
    resizeObserver.observe(tab);
  }
};

onMounted(() => {
  void nextTick(() => {
    const list = listElement.value;

    observeTabGeometry();
    updateIndicator();

    if (list && typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        observeTabGeometry();
        queueIndicatorUpdate();
      });
      mutationObserver.observe(list, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
  });

  window.addEventListener('resize', queueIndicatorUpdate);
});

watch(
  () => [tabs?.value.value, tabs?.orientation.value],
  () => {
    void nextTick(() => {
      observeTabGeometry();
      queueIndicatorUpdate();
    });
  },
  { flush: 'post' },
);

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', queueIndicatorUpdate);

    if (typeof window.cancelAnimationFrame === 'function' && animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }
  }

  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
});
</script>

<template>
  <div
    ref="listElement"
    class="m3-tab-list"
    data-scope="tabs"
    data-part="list"
    v-bind="tabs?.triggerListAttrs.value"
    :aria-label="ariaLabel"
  >
    <slot />
    <span class="m3-tab-indicator" data-scope="tabs" data-part="indicator" :style="indicatorStyle" />
  </div>
</template>
