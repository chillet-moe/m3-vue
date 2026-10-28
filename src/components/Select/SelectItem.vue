<script setup lang="ts">
import { computed, inject, ref, useSlots, watch } from 'vue';
import MenuItem from '@/components/Menu/MenuItem.vue';
import Icon from '@/components/Icon/Icon.vue';
import type { SelectOption } from './Select.vue';
import { selectItemContextKey } from './SelectItemContext';

export type SelectItemProps = {
  /** Index in the list slot's filtered entries, not the source options array. */
  index: number;
  /** Retains row content during filtering leave transitions; key rows by option.value. */
  option: SelectOption;
};
const { option, index } = defineProps<SelectItemProps>();
const context = inject(selectItemContextKey);
if (!context) throw new Error('SelectItem must be rendered inside Select or Combobox.');
const slots = useSlots();
const showSelectedIcon = context.showSelectedIcon;
const selected = computed(() => context.isOptionSelected(option));
// A recycled/just-mounted virtual row is already selected; only a subsequent
// selection change should run MenuItem's selection keyframes.
const animateSelection = ref(!context.customList);
if (context.customList) {
  watch([() => option.value, selected], ([value], [previousValue]) => {
    animateSelection.value = value === previousValue;
  });
}
defineSlots<{
  default(props: { option: SelectOption; selected: boolean }): any;
  leading(props: { option: SelectOption; selected: boolean }): any;
  trailing(props: { option: SelectOption; selected: boolean }): any;
}>();
</script>

<template>
  <MenuItem
    v-bind="context.optionProps(index, option)"
    role="option"
    :tabindex="-1"
    :aria-disabled="Boolean(option.disabled)"
    class="m3-select-option"
    data-scope="select"
    data-part="option"
    :data-has-option-leading="option.leadingIcon || slots.leading ? 'true' : undefined"
    :data-show-selected-icon="showSelectedIcon ? 'true' : undefined"
    :data-selection-motion="animateSelection ? undefined : 'none'"
    :disabled="option.disabled"
    :selected="selected"
    :close-on-select="false"
  >
    <template v-if="showSelectedIcon || option.leadingIcon || slots.leading" #leading>
      <span class="m3-select-option-leading-content" data-scope="select" data-part="option-leading-content">
        <span
          v-if="showSelectedIcon"
          class="m3-select-option-check"
          data-scope="select"
          data-part="option-check"
          aria-hidden="true"
        >
          <Icon name="check" />
        </span>

        <span
          v-if="option.leadingIcon || slots.leading"
          class="m3-select-option-icon"
          data-scope="select"
          data-part="option-icon"
          aria-hidden="true"
        >
          <slot name="leading" :option="option" :selected="false">
            <Icon v-if="option.leadingIcon" :name="option.leadingIcon" />
          </slot>
        </span>
      </span>
    </template>

    <slot :option="option" :selected="selected">{{ option.label }}</slot>

    <template v-if="option.supportingText" #supporting>
      {{ option.supportingText }}
    </template>

    <template v-if="slots.trailing" #trailing>
      <slot name="trailing" :option="option" :selected="selected" />
    </template>

    <template v-else-if="option.trailingText" #trailingText>
      {{ option.trailingText }}
    </template>
  </MenuItem>
</template>
