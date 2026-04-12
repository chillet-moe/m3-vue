<script setup lang="ts">
import { computed, inject } from 'vue';
import { tabsContextKey } from './TabsContext';

export type TabPanelProps = {
  /** The value that identifies which tab this panel belongs to. */
  value: string;
};

const { value } = defineProps<TabPanelProps>();

defineSlots<{
  default(): any;
}>();

const tabs = inject(tabsContextKey);

const panelAttrs = computed(() => tabs?.getPanelAttrs(value) ?? {});
</script>

<template>
  <div class="m3-tab-panel" data-scope="tabs" data-part="panel" v-bind="panelAttrs">
    <slot />
  </div>
</template>
