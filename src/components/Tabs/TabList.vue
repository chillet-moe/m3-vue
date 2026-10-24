<script setup lang="ts">
import { useElementEnvironment } from '@/internal/elementEnvironment';
import { inject, nextTick, ref, watch, type CSSProperties } from 'vue';
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

let resizeObserver: ResizeObserver | undefined;
let mutationObserver: MutationObserver | undefined;
let observedTabs = new Set<HTMLElement>();
let animationFrame = 0;
let view: Window | null = null;
let usesWindowResizeFallback = false;

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
  const width = Math.min(activeTab.offsetWidth, content.offsetWidth);
  const start = activeTab.offsetLeft + content.offsetLeft + (content.offsetWidth - width) / 2;

  indicatorStyle.value = {
    '--_tabs-indicator-inline-start': `${start}px`,
    '--_tabs-indicator-inline-size': `${width}px`,
    '--_tabs-indicator-opacity': '1',
  };
};

const queueIndicatorUpdate = () => {
  if (!view) {
    return;
  }

  if (animationFrame) return;

  if (typeof view!.requestAnimationFrame === 'function') {
    animationFrame = view!.requestAnimationFrame(() => {
      animationFrame = 0;
      updateIndicator();
    });
    return;
  }

  updateIndicator();
};

const syncObservedTabGeometry = () => {
  const list = listElement.value;
  if (!list || !resizeObserver) return;

  const nextTabs = new Set(list.querySelectorAll<HTMLElement>('[role="tab"]'));

  for (const tab of observedTabs) {
    if (!nextTabs.has(tab)) resizeObserver.unobserve(tab);
  }

  for (const tab of nextTabs) {
    if (!observedTabs.has(tab)) resizeObserver.observe(tab);
  }

  observedTabs = nextTabs;
};

const startTabGeometryObservation = () => {
  const list = listElement.value;
  if (!list) return;

  if (typeof ResizeObserver === 'undefined') {
    view!.addEventListener('resize', queueIndicatorUpdate);
    usesWindowResizeFallback = true;
    return;
  }

  resizeObserver = new ResizeObserver(queueIndicatorUpdate);
  resizeObserver.observe(list);
  syncObservedTabGeometry();
};

useElementEnvironment(listElement, (document) => {
  view = document.defaultView;
  let disposed = false;
  void nextTick(() => {
    if (disposed) return;
    const list = listElement.value;

    startTabGeometryObservation();
    updateIndicator();

    if (list && typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver((records) => {
        if (records.some((record) => record.type === 'childList')) syncObservedTabGeometry();
        queueIndicatorUpdate();
      });
      mutationObserver.observe(list, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
  });
  return () => {
    disposed = true;
    view?.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (usesWindowResizeFallback) view?.removeEventListener('resize', queueIndicatorUpdate);
    usesWindowResizeFallback = false;
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    observedTabs.clear();
  };
});

watch(
  () => [tabs?.value.value, tabs?.orientation.value],
  () => {
    void nextTick(() => {
      queueIndicatorUpdate();
    });
  },
  { flush: 'post' },
);
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
