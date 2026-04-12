<script setup lang="ts">
import { inject } from 'vue';
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
</script>

<template>
  <div
    class="m3-tab-list"
    data-scope="tabs"
    data-part="list"
    v-bind="tabs?.triggerListAttrs.value"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>
