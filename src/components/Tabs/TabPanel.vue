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

const panel = computed<{ value: string; active: boolean; attrs: Record<string, unknown> } | undefined>((previous) => {
  if (!tabs) return undefined;

  const active = tabs.value.value === value;
  if (previous?.value === value && previous.active === active) return previous;
  return { value, active, attrs: tabs.getPanelAttrs(value) };
});
</script>

<template>
  <div class="m3-tab-panel" data-scope="tabs" data-part="panel" v-bind="panel?.attrs">
    <slot />
  </div>
</template>
