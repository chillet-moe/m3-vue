<script setup lang="ts">
import { computed, inject } from 'vue';
import { tabsContextKey } from './TabsContext';

export type TabProps = {
  /** The value that identifies this tab. */
  value: string;

  /** Whether this tab is disabled. */
  disabled?: boolean;
};

const { value, disabled = false } = defineProps<TabProps>();

defineSlots<{
  /** Tab label content. */
  default(props: { active: boolean }): any;

  /** Optional icon slot. */
  icon(props: { active: boolean }): any;
}>();

const tabs = inject(tabsContextKey);

const triggerAttrs = computed(() => tabs?.getTriggerAttrs(value) ?? {});

const active = computed(() => tabs?.value.value === value);
</script>

<template>
  <button
    type="button"
    class="m3-tab"
    data-scope="tabs"
    data-part="trigger"
    :data-disabled="disabled ? 'true' : undefined"
    :disabled="disabled"
    v-bind="triggerAttrs"
  >
    <span v-if="$slots.icon" class="m3-tab-icon" data-scope="tabs" data-part="trigger-icon">
      <slot name="icon" :active="active" />
    </span>
    <span class="m3-tab-label" data-scope="tabs" data-part="trigger-label">
      <slot :active="active" />
    </span>
    <span class="m3-tab-indicator" data-scope="tabs" data-part="indicator" />
  </button>
</template>
