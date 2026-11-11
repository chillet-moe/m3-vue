<script setup lang="ts">
import Button from '@/components/Button/Button.vue';
import type { SelectionGroupValue } from '@/components/SelectionGroup/SelectionGroupContext';
import { useSelectionGroupItem } from '@/components/SelectionGroup/useSelectionGroupItem';

export type ButtonGroupItemProps = {
  value: SelectionGroupValue;
  disabled?: boolean;
  ariaLabel?: string;
};

const { value, disabled = false, ariaLabel } = defineProps<ButtonGroupItemProps>();

const selectionItem = useSelectionGroupItem({
  value: () => value,
  disabled: () => disabled,
  fallbackInputType: 'radio',
});
const { isSelected: isChecked, mergedDisabled, selectFromInput } = selectionItem;

const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  selectFromInput(target.checked);
};

defineSlots<{
  default(): any;
}>();
</script>

<template>
  <Button :disabled="mergedDisabled">
    <input
      :type="selectionItem.inputType()"
      :name="selectionItem.inputName()"
      :value="selectionItem.inputValue()"
      :checked="isChecked"
      :disabled="mergedDisabled"
      :aria-label="ariaLabel"
      @change="onChange"
    />
    <slot />
  </Button>
</template>
