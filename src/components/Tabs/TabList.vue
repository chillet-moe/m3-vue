<script setup lang="ts">
import { isElement, useElementEnvironment } from '@/internal/elementEnvironment';
import { computed, h, inject, ref, shallowRef, watch, type CSSProperties } from 'vue';
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
const indicatorGeometry = shallowRef<{ vertical: boolean; start: number; size: number } | null>(null);

// Track geometry in the indicator render so it cannot invalidate the trigger slot.
const Indicator = () => {
  const geometry = indicatorGeometry.value;
  const style: CSSProperties = {};
  if (geometry) {
    const axis = geometry.vertical ? 'block' : 'inline';
    style[`--_tabs-indicator-${axis}-start`] = `${geometry.start}px`;
    style[`--_tabs-indicator-${axis}-size`] = `${geometry.size}px`;
  }
  style['--_tabs-indicator-opacity'] = geometry ? '1' : '0';

  return h('span', {
    class: 'm3-tab-indicator',
    'data-scope': 'tabs',
    'data-part': 'indicator',
    style,
  });
};

const indicatorList = computed(() => (tabs?.hasLineIndicator.value ? listElement.value : null));

let hasStartingGeometry = false;

const updateIndicator = (activeTab: HTMLElement | null, vertical: boolean) => {
  if (!activeTab) {
    indicatorGeometry.value = null;
    return;
  }

  let start: number;
  let size: number;
  if (vertical) {
    start = activeTab.offsetTop;
    size = activeTab.offsetHeight;
  } else {
    const content = activeTab.querySelector<HTMLElement>('.m3-tab-content') ?? activeTab;
    const contentWidth = content.offsetWidth;
    size = Math.min(activeTab.offsetWidth, contentWidth);
    start = activeTab.offsetLeft + content.offsetLeft + (contentWidth - size) / 2;
  }

  const previous = indicatorGeometry.value;
  if (previous?.vertical === vertical && previous.start === start && previous.size === size) return;
  indicatorGeometry.value = { vertical, start, size };
};

watch(
  () => tabs?.hasLineIndicator.value,
  (visible) => {
    const list = listElement.value;
    if (!visible || !list) return;

    // Capture the outgoing navigation geometry before the parent patches its variant.
    // The resize observer will then measure the line geometry for the transition.
    const activeTab = list.querySelector<HTMLElement>('[role="tab"][data-active]');
    updateIndicator(activeTab, list.dataset.orientation === 'vertical');
    hasStartingGeometry = true;
  },
  { flush: 'sync' },
);

useElementEnvironment(indicatorList, (document, list) => {
  const view = document.defaultView;
  if (!tabs || !view) return;

  const { value, orientation } = tabs;
  const tabSelector = '[role="tab"]';
  const observedTabs = new Set<Element>();
  let animationFrame = 0;

  const measureLineIndicator = () => {
    updateIndicator(list.querySelector<HTMLElement>('[role="tab"][data-active]'), orientation.value === 'vertical');
  };

  const queueIndicatorUpdate = () => {
    if (animationFrame) return;

    if (typeof view.requestAnimationFrame === 'function') {
      animationFrame = view.requestAnimationFrame(() => {
        animationFrame = 0;
        measureLineIndicator();
      });
      return;
    }

    measureLineIndicator();
  };

  const resizeObserver =
    typeof view.ResizeObserver === 'function' ? new view.ResizeObserver(queueIndicatorUpdate) : undefined;
  const syncObservedTab = (tab: Element) => {
    // Resolve moves and role changes against the DOM at the end of the mutation batch.
    if (tab !== list && list.contains(tab) && tab.matches(tabSelector)) {
      if (observedTabs.has(tab)) return;
      observedTabs.add(tab);
      resizeObserver?.observe(tab);
    } else if (observedTabs.delete(tab)) {
      resizeObserver?.unobserve(tab);
    }
  };

  if (resizeObserver) {
    resizeObserver.observe(list);
    for (const tab of list.querySelectorAll(tabSelector)) {
      observedTabs.add(tab);
      resizeObserver.observe(tab);
    }
  } else {
    view.addEventListener('resize', queueIndicatorUpdate);
  }

  const syncTabsInSubtrees = (nodes: NodeList) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!isElement(node)) continue;
      if (node.hasAttribute('role') || observedTabs.has(node)) syncObservedTab(node);
      if (node.firstElementChild) {
        for (const tab of node.querySelectorAll(tabSelector)) syncObservedTab(tab);
      }
    }
  };

  const mutationObserver =
    typeof view.MutationObserver === 'function'
      ? new view.MutationObserver((records) => {
          if (resizeObserver) {
            for (const record of records) {
              if (record.type === 'attributes' && isElement(record.target)) {
                syncObservedTab(record.target);
              } else if (record.type === 'childList') {
                syncTabsInSubtrees(record.removedNodes);
                syncTabsInSubtrees(record.addedNodes);
              }
            }
          }
          queueIndicatorUpdate();
        })
      : undefined;
  mutationObserver?.observe(list, { childList: true, characterData: true, subtree: true, attributeFilter: ['role'] });

  const stopWatching = watch([value, orientation], queueIndicatorUpdate, { flush: 'post' });
  if (hasStartingGeometry) {
    hasStartingGeometry = false;
    if (!resizeObserver) queueIndicatorUpdate();
  } else {
    measureLineIndicator();
  }

  return () => {
    stopWatching();
    if (animationFrame) view.cancelAnimationFrame(animationFrame);
    if (resizeObserver) resizeObserver.disconnect();
    else view.removeEventListener('resize', queueIndicatorUpdate);
    mutationObserver?.disconnect();
  };
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
    <Indicator />
  </div>
</template>
