<script setup lang="ts">
import { provide } from 'vue';
import { useTabs } from '@/composables/useTabs';
import { tabsContextKey } from './TabsContext';

export type TabsVariant = 'primary' | 'secondary';
export type TabsMode = 'fixed' | 'scrollable';

export type TabsProps = {
  /** Visual variant of the tabs. @default 'primary' */
  variant?: TabsVariant;

  /** Layout mode for the tab list. @default 'fixed' */
  mode?: TabsMode;

  /** The orientation of the tab list. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';

  /** Whether arrow-key navigation loops. @default true */
  loop?: boolean;

  /** Whether focusing a trigger selects it. @default true */
  selectWhenFocused?: boolean;
};

const { variant = 'primary', mode = 'fixed', orientation, loop, selectWhenFocused } = defineProps<TabsProps>();

const modelValue = defineModel<string>();

defineSlots<{
  /** Tabs content: Tab triggers and TabPanel components. */
  default(props: { value: string | undefined }): any;
}>();

const tabs = useTabs({
  value: () => modelValue.value,
  onValueChange: (v) => {
    modelValue.value = v;
  },
  orientation: () => orientation ?? 'horizontal',
  loop: () => loop ?? true,
  selectWhenFocused: () => selectWhenFocused ?? true,
});

provide(tabsContextKey, tabs);
</script>

<template>
  <div
    class="m3-tabs"
    data-scope="tabs"
    data-part="root"
    :data-variant="variant"
    :data-mode="mode"
    :data-orientation="tabs.orientation.value"
  >
    <slot :value="tabs.value.value" />
  </div>
</template>

<style src="./Tabs.css"></style>
