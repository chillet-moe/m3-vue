<script setup lang="ts">
import { provide } from 'vue';
import { useTabs } from '@/composables/useTabs';
import { tabsContextKey } from './TabsContext';

export type TabsVariant = 'navigation' | 'line';
export type TabsSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
export type TabsMode = 'auto' | 'fixed' | 'scrollable';

export type TabsProps = {
  /** Visual variant of the tabs. @default 'navigation' */
  variant?: TabsVariant;

  /** Size of the tab triggers. @default 'medium' */
  size?: TabsSize;

  /** Layout mode for the tab list. @default 'auto' */
  mode?: TabsMode;

  /** The orientation of the tab list. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';

  /** Whether arrow-key navigation loops. @default true */
  loop?: boolean;

  /** Whether focusing a trigger selects it. @default true */
  selectWhenFocused?: boolean;
};

const props = withDefaults(defineProps<TabsProps>(), {
  variant: 'navigation',
  size: 'medium',
  mode: 'auto',
  orientation: 'horizontal',
  loop: true,
  selectWhenFocused: true,
});

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
  orientation: () => props.orientation,
  loop: () => props.loop,
  selectWhenFocused: () => props.selectWhenFocused,
});

provide(tabsContextKey, tabs);
</script>

<template>
  <div
    class="m3-tabs"
    data-scope="tabs"
    data-part="root"
    :data-variant="props.variant"
    :data-size="props.size"
    :data-mode="props.mode"
    :data-orientation="tabs.orientation.value"
  >
    <slot :value="tabs.value.value" />
  </div>
</template>

<style src="./Tabs.css"></style>
