<script setup lang="ts">
import ListItem from '@/components/ListItem/ListItem.vue';
import Icon from '@/components/Icon/Icon.vue';

export type SelectItemProps = {
  /** Logical keyboard/pointer activity, independent of selection. */
  active?: boolean;
  /** Whether this option's value is selected. */
  selected?: boolean;
  disabled?: boolean;
  supportingText?: string;
  leadingIcon?: string;
  trailingText?: string;
};
const props = withDefaults(defineProps<SelectItemProps>(), { active: false, selected: false, disabled: false });
defineSlots<{
  default(): any;
  leading(): any;
  trailing(): any;
}>();
</script>

<template>
  <ListItem
    class="m3-select-item"
    data-scope="select-item"
    data-part="root"
    appearance="standard"
    :interactive="false"
    role="option"
    :tabindex="-1"
    :active="props.active"
    :disabled="props.disabled"
    :aria-selected="props.selected"
    :aria-disabled="props.disabled"
    :data-selected="props.selected ? 'true' : 'false'"
    :description="props.supportingText"
  >
    <template #leading>
      <Icon v-if="props.selected" aria-hidden="true" name="check" data-scope="select-item" data-part="check" />
      <slot v-else name="leading"><Icon v-if="props.leadingIcon" aria-hidden="true" :name="props.leadingIcon" /></slot>
    </template>
    <slot />
    <template v-if="$slots.trailing || props.trailingText" #trailing>
      <slot name="trailing">{{ props.trailingText }}</slot>
    </template>
  </ListItem>
</template>

<style src="./SelectItem.css"></style>
